import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { DailyRecord } from './entities/daily-record.entity';
import { PumpReading } from './entities/pump-reading.entity';
import { ReservoirReading } from './entities/reservoir-reading.entity';
import { CreateDailyRecordDto, PumpReadingDto, ReservoirReadingDto } from './dto/create-daily-record.dto';
import { UpdateDailyRecordDto } from './dto/update-daily-record.dto';
import { DailyRecordsQueryDto } from './dto/daily-records-query.dto';
import { SalesSummaryQueryDto } from './dto/sales-summary-query.dto';
import { buildDailyReport, DailySalesReport, round2 } from './sales-report';
import { StationsService } from '../stations/stations.service';
import { Station } from '../stations/entities/station.entity';
import { StationStatus } from '../stations/enums/station-status.enum';
import { PumpsService } from '../pumps/pumps.service';
import { PumpStatus } from '../pumps/pump-status.enum';
import { ReservoirsService } from '../reservoirs/reservoirs.service';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/product.enum';
import { Role } from '../users/enums/role.enum';
import { JwtPayload } from '../auth/auth.service';
import { addDays, eachDay, formatLocalDate, seededRandom } from '../common/date.util';

export interface SalesPoint {
  date: string;
  /** ₦ from pump meters that day. */
  amount: number;
  litres: number;
  /** Number of pump readings recorded that day (kept for the dashboard; one per pump per station). */
  transactions: number;
}

export interface SalesSummary {
  from: string;
  to: string;
  stationId: string | null;
  days: number;
  totalAmount: number;
  totalLitres: number;
  totalTransactions: number;
  averagePerDay: number;
  points: SalesPoint[];
}

/** What the manager's daily form is pre-filled with: every pump and tank, opening values carried from the last record. */
export interface DailyRecordTemplate {
  station: { id: string; name: string; code: string };
  recordedOn: string;
  lastRecordedOn: string | null;
  pumps: { pumpId: string; name: string; product: Product; pricePerLitre: number | null; openingReading: number | null }[];
  reservoirs: { reservoirId: string; product: Product; capacityLitres: number; openingLevel: number | null }[];
}

const MAX_RANGE_DAYS = 366;

interface PreparedReadings {
  pumps: Partial<PumpReading>[];
  reservoirs: Partial<ReservoirReading>[];
}

@Injectable()
export class SalesService implements OnModuleInit {
  constructor(
    @InjectRepository(DailyRecord)
    private readonly recordsRepository: Repository<DailyRecord>,
    @InjectRepository(PumpReading)
    private readonly pumpReadingsRepository: Repository<PumpReading>,
    @InjectRepository(ReservoirReading)
    private readonly reservoirReadingsRepository: Repository<ReservoirReading>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly stationsService: StationsService,
    private readonly pumpsService: PumpsService,
    private readonly reservoirsService: ReservoirsService,
    private readonly productsService: ProductsService,
  ) {}

  // ---------------------------------------------------------------- access

  /**
   * The station a request may act on. Managers are pinned to their own station;
   * directors and admins must name one. Throws 403/400/404 accordingly.
   */
  private async resolveStation(user: JwtPayload, stationId?: string | null): Promise<Station> {
    if (isManager(user)) {
      const own = await this.stationsService.findByManager(user.sub);
      if (!own) throw new ForbiddenException('You are not assigned to a station');
      if (stationId && stationId !== own.id) {
        throw new ForbiddenException('Managers can only work with their own station');
      }
      return own;
    }
    if (!stationId) throw new BadRequestException('stationId is required');
    return this.stationsService.findOne(stationId);
  }

  /** Like resolveStation, but directors and admins may leave the station unset to mean "all". */
  private async resolveStationOrAll(user: JwtPayload, stationId?: string | null): Promise<Station | null> {
    if (isManager(user) || stationId) return this.resolveStation(user, stationId);
    return null;
  }

  // ---------------------------------------------------------------- template

  async getTemplate(user: JwtPayload, stationId?: string): Promise<DailyRecordTemplate> {
    const station = await this.resolveStation(user, stationId);
    const [pumps, reservoirs, prices, last] = await Promise.all([
      this.pumpsService.findByStation(station.id),
      this.reservoirsService.findByStation(station.id),
      this.productsService.priceMap(station.id),
      this.recordsRepository.findOne({ where: { stationId: station.id }, order: { recordedOn: 'DESC' } }),
    ]);

    const lastPump = new Map<string, number>();
    const lastTank = new Map<string, number>();
    if (last) {
      const [p, r] = await Promise.all([
        this.pumpReadingsRepository.find({ where: { recordId: last.id } }),
        this.reservoirReadingsRepository.find({ where: { recordId: last.id } }),
      ]);
      for (const x of p) lastPump.set(x.pumpId, x.closingReading);
      for (const x of r) lastTank.set(x.reservoirId, x.closingLevel);
    }

    return {
      station: { id: station.id, name: station.name, code: station.code },
      recordedOn: formatLocalDate(new Date()),
      lastRecordedOn: last?.recordedOn ?? null,
      pumps: pumps
        .filter((p) => p.status === PumpStatus.ACTIVE)
        .map((p) => ({
          pumpId: p.id,
          name: p.name,
          product: p.product,
          pricePerLitre: prices.get(p.product) ?? null,
          openingReading: lastPump.get(p.id) ?? null,
        })),
      reservoirs: reservoirs.map((r) => ({
        reservoirId: r.id,
        product: r.product,
        capacityLitres: r.capacityLitres,
        openingLevel: lastTank.get(r.id) ?? null,
      })),
    };
  }

  // ---------------------------------------------------------------- write

  async create(dto: CreateDailyRecordDto, user: JwtPayload): Promise<DailySalesReport> {
    const station = await this.resolveStation(user, dto.stationId);
    this.assertTradingDay(dto.recordedOn);

    if (await this.recordsRepository.findOne({ where: { stationId: station.id, recordedOn: dto.recordedOn } })) {
      throw new ConflictException(`${station.name} already has a record for ${dto.recordedOn}; update it instead`);
    }

    const prepared = await this.prepareReadings(station, dto.pumps, dto.reservoirs);

    const record = await this.dataSource.transaction(async (em) => {
      const saved = await em.save(
        em.create(DailyRecord, {
          stationId: station.id,
          recordedOn: dto.recordedOn,
          notes: dto.notes?.trim() || null,
          recordedById: user.sub,
          recordedByUsername: user.username,
        }),
      );
      await this.insertReadings(em, saved, prepared);
      return saved;
    });

    return this.findOne(record.id, user);
  }

  async update(id: string, dto: UpdateDailyRecordDto, user: JwtPayload): Promise<DailySalesReport> {
    const record = await this.loadRecord(id, user);
    const station = await this.stationsService.findOne(record.stationId);
    const prepared = await this.prepareReadings(station, dto.pumps, dto.reservoirs);

    await this.dataSource.transaction(async (em) => {
      await em.delete(PumpReading, { recordId: record.id });
      await em.delete(ReservoirReading, { recordId: record.id });
      record.notes = dto.notes?.trim() || null;
      record.recordedById = user.sub;
      record.recordedByUsername = user.username;
      await em.save(record);
      await this.insertReadings(em, record, prepared);
    });

    return this.findOne(record.id, user);
  }

  private async insertReadings(
    em: { save: DataSource['manager']['save']; create: DataSource['manager']['create'] },
    record: DailyRecord,
    prepared: PreparedReadings,
  ) {
    const stamp = { recordId: record.id, stationId: record.stationId, recordedOn: record.recordedOn };
    await em.save(PumpReading, em.create(PumpReading, prepared.pumps.map((p) => ({ ...p, ...stamp }))));
    await em.save(ReservoirReading, em.create(ReservoirReading, prepared.reservoirs.map((r) => ({ ...r, ...stamp }))));
  }

  private assertTradingDay(day: string) {
    const parsed = new Date(`${day}T00:00:00`);
    if (Number.isNaN(parsed.getTime()) || formatLocalDate(parsed) !== day) {
      throw new BadRequestException(`recordedOn "${day}" is not a valid calendar day`);
    }
    if (day > formatLocalDate(new Date())) {
      throw new BadRequestException('recordedOn cannot be in the future');
    }
  }

  /**
   * Checks a submission against the station's current pumps, tanks and prices and turns it into rows.
   * Every problem is collected so the manager sees the whole list at once rather than one per attempt.
   */
  private async prepareReadings(
    station: Station,
    pumpDtos: PumpReadingDto[],
    reservoirDtos: ReservoirReadingDto[],
  ): Promise<PreparedReadings> {
    const [pumps, reservoirs, prices] = await Promise.all([
      this.pumpsService.findByStation(station.id),
      this.reservoirsService.findByStation(station.id),
      this.productsService.priceMap(station.id),
    ]);
    const errors: string[] = [];

    const pumpById = new Map(pumps.map((p) => [p.id, p]));
    const seenPumps = new Set<string>();
    const pumpRows: Partial<PumpReading>[] = [];
    for (const dto of pumpDtos) {
      const pump = pumpById.get(dto.pumpId);
      if (!pump) {
        errors.push(`Pump "${dto.pumpId}" does not belong to ${station.name}`);
        continue;
      }
      if (seenPumps.has(pump.id)) {
        errors.push(`${pump.name} was submitted more than once`);
        continue;
      }
      seenPumps.add(pump.id);
      if (dto.closingReading < dto.openingReading) {
        errors.push(`${pump.name}: closing reading (${dto.closingReading}) is below opening reading (${dto.openingReading})`);
      }
      const price = prices.get(pump.product);
      if (price === undefined) {
        errors.push(`No ${pump.product} price is set for ${station.name}; ask a director to set one`);
        continue;
      }
      const litresSold = round2(dto.closingReading - dto.openingReading);
      pumpRows.push({
        pumpId: pump.id,
        pumpName: pump.name,
        product: pump.product,
        openingReading: dto.openingReading,
        closingReading: dto.closingReading,
        litresSold,
        pricePerLitre: price,
        amount: round2(litresSold * price),
      });
    }
    const missingPumps = pumps.filter((p) => p.status === PumpStatus.ACTIVE && !seenPumps.has(p.id));
    if (missingPumps.length) {
      errors.push(`Missing readings for: ${missingPumps.map((p) => p.name).join(', ')}`);
    }

    const tankById = new Map(reservoirs.map((r) => [r.id, r]));
    const seenTanks = new Set<string>();
    const tankRows: Partial<ReservoirReading>[] = [];
    for (const dto of reservoirDtos) {
      const tank = tankById.get(dto.reservoirId);
      if (!tank) {
        errors.push(`Reservoir "${dto.reservoirId}" does not belong to ${station.name}`);
        continue;
      }
      if (seenTanks.has(tank.id)) {
        errors.push(`The ${tank.product} reservoir was submitted more than once`);
        continue;
      }
      seenTanks.add(tank.id);
      const delivered = dto.deliveredLitres ?? 0;
      const available = dto.openingLevel + delivered;
      if (dto.openingLevel > tank.capacityLitres || dto.closingLevel > tank.capacityLitres) {
        errors.push(`${tank.product} reservoir: levels cannot exceed its ${tank.capacityLitres} L capacity`);
      }
      if (dto.closingLevel > available) {
        errors.push(
          `${tank.product} reservoir: closing level (${dto.closingLevel}) is above opening level plus deliveries (${available})`,
        );
      }
      tankRows.push({
        reservoirId: tank.id,
        product: tank.product,
        openingLevel: dto.openingLevel,
        deliveredLitres: delivered,
        closingLevel: dto.closingLevel,
        expectedLitres: round2(available - dto.closingLevel),
      });
    }
    const missingTanks = reservoirs.filter((r) => !seenTanks.has(r.id));
    if (missingTanks.length) {
      errors.push(`Missing levels for the ${missingTanks.map((r) => r.product).join(', ')} reservoir(s)`);
    }

    if (errors.length) throw new BadRequestException(errors);
    return { pumps: pumpRows, reservoirs: tankRows };
  }

  // ---------------------------------------------------------------- read

  private async loadRecord(id: string, user: JwtPayload): Promise<DailyRecord> {
    const record = await this.recordsRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Daily record with id "${id}" not found`);
    await this.resolveStation(user, record.stationId); // 403 for a manager of another station
    return record;
  }

  async findOne(id: string, user: JwtPayload): Promise<DailySalesReport> {
    const record = await this.loadRecord(id, user);
    const [pumps, tanks] = await Promise.all([
      this.pumpReadingsRepository.find({ where: { recordId: record.id }, order: { pumpName: 'ASC' } }),
      this.reservoirReadingsRepository.find({ where: { recordId: record.id } }),
    ]);
    return buildDailyReport(record, pumps, tanks);
  }

  async findAll(query: DailyRecordsQueryDto, user: JwtPayload): Promise<DailySalesReport[]> {
    const station = await this.resolveStationOrAll(user, query.stationId);
    const { from, to } = this.resolveRange(query.from, query.to);

    const records = await this.recordsRepository.find({
      where: station
        ? { stationId: station.id, recordedOn: Between(from, to) }
        : { recordedOn: Between(from, to) },
      order: { recordedOn: 'DESC', stationId: 'ASC' },
    });
    if (records.length === 0) return [];

    const ids = records.map((r) => r.id);
    const [pumps, tanks] = await Promise.all([
      this.pumpReadingsRepository.find({ where: { recordId: In(ids) }, order: { pumpName: 'ASC' } }),
      this.reservoirReadingsRepository.find({ where: { recordId: In(ids) } }),
    ]);
    const pumpsByRecord = groupBy(pumps, (p) => p.recordId);
    const tanksByRecord = groupBy(tanks, (t) => t.recordId);

    return records.map((r) => buildDailyReport(r, pumpsByRecord.get(r.id) ?? [], tanksByRecord.get(r.id) ?? []));
  }

  async getSummary(query: SalesSummaryQueryDto, user: JwtPayload): Promise<SalesSummary> {
    const station = await this.resolveStationOrAll(user, query.stationId?.trim() || null);
    const { from, to, days } = this.resolveRange(query.from, query.to);

    const qb = this.pumpReadingsRepository
      .createQueryBuilder('r')
      .select('r.recordedOn', 'date')
      .addSelect('SUM(r.amount)', 'amount')
      .addSelect('SUM(r.litresSold)', 'litres')
      .addSelect('COUNT(*)', 'transactions')
      .where('r.recordedOn BETWEEN :from AND :to', { from, to });
    if (station) qb.andWhere('r.stationId = :stationId', { stationId: station.id });
    qb.groupBy('r.recordedOn').orderBy('r.recordedOn', 'ASC');

    const rows = await qb.getRawMany<{ date: string; amount: number | string; litres: number | string; transactions: number | string }>();
    const byDate = new Map(rows.map((r) => [r.date, r]));

    const points: SalesPoint[] = days.map((date) => {
      const row = byDate.get(date);
      return {
        date,
        amount: row ? round2(Number(row.amount)) : 0,
        litres: row ? round2(Number(row.litres)) : 0,
        transactions: row ? Number(row.transactions) : 0,
      };
    });

    const totalAmount = round2(points.reduce((sum, p) => sum + p.amount, 0));
    const totalLitres = round2(points.reduce((sum, p) => sum + p.litres, 0));
    const totalTransactions = points.reduce((sum, p) => sum + p.transactions, 0);

    return {
      from,
      to,
      stationId: station?.id ?? null,
      days: days.length,
      totalAmount,
      totalLitres,
      totalTransactions,
      averagePerDay: round2(totalAmount / days.length),
      points,
    };
  }

  private resolveRange(fromInput?: string, toInput?: string) {
    const to = toInput ?? formatLocalDate(new Date());
    const from = fromInput ?? formatLocalDate(addDays(new Date(`${to}T00:00:00`), -29));
    if (from > to) throw new BadRequestException('`from` must be on or before `to`');
    const days = eachDay(from, to);
    if (days.length > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Date range may not exceed ${MAX_RANGE_DAYS} days`);
    }
    return { from, to, days };
  }

  // ---------------------------------------------------------------- seed

  /** Seeds ~90 days of deterministic daily records per station in non-production when the table is empty. */
  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') return;
    if ((await this.recordsRepository.count()) > 0) return;

    const stations = await this.stationsService.findAll();
    if (stations.length === 0) return;

    const random = seededRandom(20261008);
    const today = new Date();
    const records: Partial<DailyRecord>[] = [];
    const pumpRows: Partial<PumpReading>[] = [];
    const tankRows: Partial<ReservoirReading>[] = [];

    for (const station of stations) {
      const [pumps, reservoirs, prices] = await Promise.all([
        this.pumpsService.findByStation(station.id),
        this.reservoirsService.findByStation(station.id),
        this.productsService.priceMap(station.id),
      ]);
      if (pumps.length === 0 || reservoirs.length === 0) continue;

      const scale = station.status === StationStatus.MAINTENANCE ? 0.3 : 1;
      const meters = new Map(pumps.map((p) => [p.id, Math.round(100000 + random() * 50000)]));
      const levels = new Map(reservoirs.map((r) => [r.id, Math.round(r.capacityLitres * 0.7)]));

      for (let offset = 89; offset >= 0; offset--) {
        const day = addDays(today, -offset);
        const recordedOn = formatLocalDate(day);
        const weekend = day.getDay() === 0 || day.getDay() === 6 ? 1.15 : 1;
        // Records are keyed by (station, day); the id is assigned when saved, so stash the key for now.
        const record: Partial<DailyRecord> = {
          stationId: station.id,
          recordedOn,
          notes: null,
          recordedById: station.managerId,
          recordedByUsername: station.managerUsername,
        };
        records.push(record);

        const soldByProduct = new Map<Product, number>();
        for (const pump of pumps) {
          const price = prices.get(pump.product);
          if (price === undefined) continue;
          const [lo, hi] = DAILY_LITRES[pump.product];
          const litres = Math.round((lo + random() * (hi - lo)) * scale * weekend * 10) / 10;
          const opening = meters.get(pump.id)!;
          const closing = round2(opening + litres);
          meters.set(pump.id, closing);
          soldByProduct.set(pump.product, (soldByProduct.get(pump.product) ?? 0) + litres);
          pumpRows.push({
            // recordId is filled in after the records are saved; keyed by position.
            recordId: String(records.length - 1),
            stationId: station.id,
            recordedOn,
            pumpId: pump.id,
            pumpName: pump.name,
            product: pump.product,
            openingReading: opening,
            closingReading: closing,
            litresSold: litres,
            pricePerLitre: price,
            amount: round2(litres * price),
          });
        }

        for (const tank of reservoirs) {
          const pumped = soldByProduct.get(tank.product) ?? 0;
          const opening = levels.get(tank.id)!;
          let delivered = 0;
          if (opening - pumped < tank.capacityLitres * 0.2) {
            delivered = Math.round(tank.capacityLitres * 0.85 - opening);
          }
          // Real tanks lose a little to evaporation and meter drift, so dips rarely match meters exactly.
          const drift = 1 + (random() * 0.017 - 0.005);
          const closing = Math.max(0, Math.round((opening + delivered - pumped * drift) * 10) / 10);
          levels.set(tank.id, closing);
          tankRows.push({
            recordId: String(records.length - 1),
            stationId: station.id,
            recordedOn,
            reservoirId: tank.id,
            product: tank.product,
            openingLevel: opening,
            deliveredLitres: delivered,
            closingLevel: closing,
            expectedLitres: round2(opening + delivered - closing),
          });
        }
      }
    }

    const saved = await this.recordsRepository.save(this.recordsRepository.create(records), { chunk: 100 });
    const idByIndex = saved.map((r) => r.id);
    for (const row of pumpRows) row.recordId = idByIndex[Number(row.recordId)];
    for (const row of tankRows) row.recordId = idByIndex[Number(row.recordId)];
    await this.pumpReadingsRepository.save(this.pumpReadingsRepository.create(pumpRows), { chunk: 500 });
    await this.reservoirReadingsRepository.save(this.reservoirReadingsRepository.create(tankRows), { chunk: 500 });
  }
}

/** Typical litres one pump dispenses per day, used only for seed data. */
const DAILY_LITRES: Record<Product, [number, number]> = {
  [Product.PETROL]: [1400, 2600],
  [Product.DIESEL]: [700, 1300],
  [Product.KEROSENE]: [150, 400],
};

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    const bucket = map.get(k);
    if (bucket) bucket.push(item);
    else map.set(k, [item]);
  }
  return map;
}

/** The JWT carries the role as a plain string. */
function isManager(user: JwtPayload): boolean {
  return user.role === (Role.MANAGER as string);
}
