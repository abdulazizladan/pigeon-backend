import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { ReservoirLevel } from './entities/reservoir-level.entity';
import { Reservoir } from './entities/reservoir.entity';
import { ReservoirsService } from './reservoirs.service';
import { RecordLevelsDto } from './dto/record-levels.dto';
import { ReservoirReading } from '../sales/entities/reservoir-reading.entity';
import { PumpReading } from '../sales/entities/pump-reading.entity';
import { StationsService } from '../stations/stations.service';
import { Station } from '../stations/entities/station.entity';
import { Product } from '../products/product.enum';
import { JwtPayload } from '../auth/auth.service';
import { addDays, formatLocalDate } from '../common/date.util';

export type LevelStatus = 'ok' | 'low' | 'critical' | 'unknown';

export interface ReservoirLevelIndicator {
  reservoirId: string;
  product: Product;
  capacityLitres: number;
  /** Latest known litres in the tank, or null if never read. */
  level: number | null;
  percent: number | null;
  recordedOn: string | null;
  /** Where the latest figure came from. */
  source: 'level' | 'daily_record' | null;
  recordedByUsername: string | null;
  /** Average litres of this product sold per day over the last 14 recorded days. */
  avgDailyLitres: number;
  /** level ÷ avgDailyLitres, or null when consumption is unknown. */
  daysRemaining: number | null;
  status: LevelStatus;
}

export interface StationLevels {
  station: { id: string; name: string; code: string };
  asOf: string;
  reservoirs: ReservoirLevelIndicator[];
}

/** Levels for every station at once, for list views. */
export interface StationLevelsSummary {
  stationId: string;
  reservoirs: ReservoirLevelIndicator[];
}

const LOW_PERCENT = 25;
const CRITICAL_PERCENT = 10;
const CONSUMPTION_WINDOW_DAYS = 14;

const isManager = (u: JwtPayload) => u.role === 'manager';
const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class ReservoirLevelsService {
  constructor(
    @InjectRepository(ReservoirLevel) private readonly levels: Repository<ReservoirLevel>,
    @InjectRepository(ReservoirReading) private readonly readings: Repository<ReservoirReading>,
    @InjectRepository(PumpReading) private readonly pumpReadings: Repository<PumpReading>,
    private readonly reservoirsService: ReservoirsService,
    private readonly stationsService: StationsService,
  ) {}

  private async resolveStation(user: JwtPayload, stationId?: string | null): Promise<Station> {
    if (isManager(user)) {
      const own = await this.stationsService.findByManager(user.sub);
      if (!own) throw new ForbiddenException('You are not assigned to a station');
      if (stationId && stationId !== own.id) throw new ForbiddenException('Managers can only work with their own station');
      return own;
    }
    if (!stationId) throw new BadRequestException('stationId is required');
    return this.stationsService.findOne(stationId);
  }

  /** Every station's current levels in one pass, for the stations list. Directors and admins only. */
  async getAllLevels(): Promise<StationLevelsSummary[]> {
    const since = formatLocalDate(addDays(new Date(), -(CONSUMPTION_WINDOW_DAYS - 1)));
    const [reservoirs, standalone, fromRecords, recentPumps] = await Promise.all([
      this.reservoirsService.findAll(),
      this.levels.find({ order: { recordedOn: 'DESC' } }),
      this.readings.find({ order: { recordedOn: 'DESC' } }),
      this.pumpReadings.find({ where: { recordedOn: MoreThanOrEqual(since) }, select: { stationId: true, product: true, litresSold: true, recordedOn: true } }),
    ]);

    const latestStandalone = new Map<string, ReservoirLevel>();
    for (const l of standalone) if (!latestStandalone.has(l.reservoirId)) latestStandalone.set(l.reservoirId, l);
    const latestRecord = new Map<string, ReservoirReading>();
    for (const r of fromRecords) if (!latestRecord.has(r.reservoirId)) latestRecord.set(r.reservoirId, r);

    // Consumption per station+product over the window.
    const litres = new Map<string, Map<Product, number>>();
    const days = new Map<string, Map<Product, Set<string>>>();
    for (const p of recentPumps) {
      if (!litres.has(p.stationId)) { litres.set(p.stationId, new Map()); days.set(p.stationId, new Map()); }
      const l = litres.get(p.stationId)!; const d = days.get(p.stationId)!;
      l.set(p.product, (l.get(p.product) ?? 0) + p.litresSold);
      if (!d.has(p.product)) d.set(p.product, new Set());
      d.get(p.product)!.add(p.recordedOn);
    }

    const byStation = new Map<string, ReservoirLevelIndicator[]>();
    for (const r of reservoirs) {
      const ind = this.indicator(r, latestStandalone.get(r.id), latestRecord.get(r.id), litres.get(r.stationId) ?? new Map(), days.get(r.stationId) ?? new Map());
      byStation.set(r.stationId, [...(byStation.get(r.stationId) ?? []), ind]);
    }
    return [...byStation.entries()].map(([stationId, list]) => ({ stationId, reservoirs: list.sort((a, b) => a.product.localeCompare(b.product)) }));
  }

  /** Current level of every reservoir at a station, from the newest of standalone readings and daily records. */
  async getLevels(user: JwtPayload, stationId?: string | null): Promise<StationLevels> {
    const station = await this.resolveStation(user, stationId);
    const reservoirs = await this.reservoirsService.findByStation(station.id);
    if (reservoirs.length === 0) return { station: this.ref(station), asOf: formatLocalDate(new Date()), reservoirs: [] };

    const ids = reservoirs.map((r) => r.id);
    const since = formatLocalDate(addDays(new Date(), -(CONSUMPTION_WINDOW_DAYS - 1)));
    const [standalone, fromRecords, recentPumps] = await Promise.all([
      this.levels.find({ where: { reservoirId: In(ids) }, order: { recordedOn: 'DESC' } }),
      this.readings.find({ where: { reservoirId: In(ids) }, order: { recordedOn: 'DESC' } }),
      this.pumpReadings.find({ where: { stationId: station.id, recordedOn: MoreThanOrEqual(since) }, select: { product: true, litresSold: true, recordedOn: true } }),
    ]);

    // Average daily litres per product over days that actually have readings.
    const litresByProduct = new Map<Product, number>();
    const daysByProduct = new Map<Product, Set<string>>();
    for (const p of recentPumps) {
      litresByProduct.set(p.product, (litresByProduct.get(p.product) ?? 0) + p.litresSold);
      if (!daysByProduct.has(p.product)) daysByProduct.set(p.product, new Set());
      daysByProduct.get(p.product)!.add(p.recordedOn);
    }

    const latestStandalone = new Map<string, ReservoirLevel>();
    for (const l of standalone) if (!latestStandalone.has(l.reservoirId)) latestStandalone.set(l.reservoirId, l);
    const latestRecord = new Map<string, ReservoirReading>();
    for (const r of fromRecords) if (!latestRecord.has(r.reservoirId)) latestRecord.set(r.reservoirId, r);

    return {
      station: this.ref(station),
      asOf: formatLocalDate(new Date()),
      reservoirs: reservoirs.map((r) => this.indicator(r, latestStandalone.get(r.id), latestRecord.get(r.id), litresByProduct, daysByProduct)),
    };
  }

  private indicator(
    r: Reservoir,
    standalone: ReservoirLevel | undefined,
    record: ReservoirReading | undefined,
    litresByProduct: Map<Product, number>,
    daysByProduct: Map<Product, Set<string>>,
  ): ReservoirLevelIndicator {
    // Newest wins; on the same day the explicit end-of-day reading wins over the sales record.
    let level: number | null = null;
    let recordedOn: string | null = null;
    let source: 'level' | 'daily_record' | null = null;
    let by: string | null = null;
    if (standalone && (!record || standalone.recordedOn >= record.recordedOn)) {
      level = standalone.level; recordedOn = standalone.recordedOn; source = 'level'; by = standalone.recordedByUsername;
    } else if (record) {
      level = record.closingLevel; recordedOn = record.recordedOn; source = 'daily_record'; by = null;
    }

    const days = daysByProduct.get(r.product)?.size ?? 0;
    const avgDailyLitres = days ? round2((litresByProduct.get(r.product) ?? 0) / days) : 0;
    const percent = level === null ? null : Math.max(0, Math.min(100, round2((level / r.capacityLitres) * 100)));
    const status: LevelStatus =
      percent === null ? 'unknown' : percent <= CRITICAL_PERCENT ? 'critical' : percent <= LOW_PERCENT ? 'low' : 'ok';

    return {
      reservoirId: r.id,
      product: r.product,
      capacityLitres: r.capacityLitres,
      level,
      percent,
      recordedOn,
      source,
      recordedByUsername: by,
      avgDailyLitres,
      daysRemaining: level !== null && avgDailyLitres > 0 ? round2(level / avgDailyLitres) : null,
      status,
    };
  }

  /** Records (or corrects) the close-of-day level of each listed reservoir, then returns the refreshed indicators. */
  async record(dto: RecordLevelsDto, user: JwtPayload): Promise<StationLevels> {
    const station = await this.resolveStation(user, dto.stationId);
    const recordedOn = dto.recordedOn ?? formatLocalDate(new Date());
    if (recordedOn > formatLocalDate(new Date())) throw new BadRequestException('recordedOn cannot be in the future');

    const reservoirs = await this.reservoirsService.findByStation(station.id);
    const byId = new Map(reservoirs.map((r) => [r.id, r]));
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const input of dto.levels) {
      const tank = byId.get(input.reservoirId);
      if (!tank) { errors.push(`Reservoir "${input.reservoirId}" does not belong to ${station.name}`); continue; }
      if (seen.has(tank.id)) { errors.push(`The ${tank.product} reservoir was submitted more than once`); continue; }
      seen.add(tank.id);
      if (input.level > tank.capacityLitres) errors.push(`${tank.product} reservoir: ${input.level} L exceeds its ${tank.capacityLitres} L capacity`);
    }
    if (errors.length) throw new BadRequestException(errors);

    for (const input of dto.levels) {
      const tank = byId.get(input.reservoirId)!;
      const existing = await this.levels.findOne({ where: { reservoirId: tank.id, recordedOn } });
      const row = existing ?? this.levels.create({ stationId: station.id, reservoirId: tank.id, product: tank.product, recordedOn });
      row.level = round2(input.level);
      row.recordedById = user.sub;
      row.recordedByUsername = user.username;
      await this.levels.save(row);
    }
    return this.getLevels(user, station.id);
  }

  private ref(s: Station) {
    return { id: s.id, name: s.name, code: s.code };
  }
}
