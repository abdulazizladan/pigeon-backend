import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, In, Repository } from 'typeorm';
import { HealthCheck } from './entities/health-check.entity';
import { PumpCheck } from './entities/pump-check.entity';
import { CreateHealthCheckDto, HealthChecksQueryDto, PumpCheckDto, UpdateHealthCheckDto } from './dto/health-check.dto';
import { PumpCondition } from './maintenance.enums';
import { StationsService } from '../stations/stations.service';
import { Station } from '../stations/entities/station.entity';
import { PumpsService } from '../pumps/pumps.service';
import { Product } from '../products/product.enum';
import { JwtPayload } from '../auth/auth.service';
import { addDays, eachDay, formatLocalDate } from '../common/date.util';

export interface HealthCheckReport extends HealthCheck {
  pumps: PumpCheck[];
  faultyPumps: number;
}

export interface HealthCheckTemplate {
  station: { id: string; name: string; code: string };
  recordedOn: string;
  lastRecordedOn: string | null;
  lastStationCondition: string | null;
  pumps: { pumpId: string; name: string; product: Product; status: string; lastCondition: PumpCondition | null }[];
}

const isManager = (u: JwtPayload) => u.role === 'manager';

@Injectable()
export class HealthChecksService {
  constructor(
    @InjectRepository(HealthCheck) private readonly checks: Repository<HealthCheck>,
    @InjectRepository(PumpCheck) private readonly pumpChecks: Repository<PumpCheck>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly stationsService: StationsService,
    private readonly pumpsService: PumpsService,
  ) {}

  /** Managers are pinned to their own station; directors and admins must name one. */
  async resolveStation(user: JwtPayload, stationId?: string | null): Promise<Station> {
    if (isManager(user)) {
      const own = await this.stationsService.findByManager(user.sub);
      if (!own) throw new ForbiddenException('You are not assigned to a station');
      if (stationId && stationId !== own.id) throw new ForbiddenException('Managers can only work with their own station');
      return own;
    }
    if (!stationId) throw new BadRequestException('stationId is required');
    return this.stationsService.findOne(stationId);
  }

  private async resolveStationOrAll(user: JwtPayload, stationId?: string | null): Promise<Station | null> {
    if (isManager(user) || stationId) return this.resolveStation(user, stationId);
    return null;
  }

  async getTemplate(user: JwtPayload, stationId?: string): Promise<HealthCheckTemplate> {
    const station = await this.resolveStation(user, stationId);
    const [pumps, last] = await Promise.all([
      this.pumpsService.findByStation(station.id),
      this.checks.findOne({ where: { stationId: station.id }, order: { recordedOn: 'DESC' } }),
    ]);
    const lastByPump = new Map<string, PumpCondition>();
    if (last) {
      for (const pc of await this.pumpChecks.find({ where: { healthCheckId: last.id } })) lastByPump.set(pc.pumpId, pc.condition);
    }
    return {
      station: { id: station.id, name: station.name, code: station.code },
      recordedOn: formatLocalDate(new Date()),
      lastRecordedOn: last?.recordedOn ?? null,
      lastStationCondition: last?.stationCondition ?? null,
      pumps: pumps.map((p) => ({ pumpId: p.id, name: p.name, product: p.product, status: p.status, lastCondition: lastByPump.get(p.id) ?? null })),
    };
  }

  async create(dto: CreateHealthCheckDto, user: JwtPayload): Promise<HealthCheckReport> {
    const station = await this.resolveStation(user, dto.stationId);
    const recordedOn = dto.recordedOn ?? formatLocalDate(new Date());
    if (recordedOn > formatLocalDate(new Date())) throw new BadRequestException('recordedOn cannot be in the future');
    if (await this.checks.findOne({ where: { stationId: station.id, recordedOn } })) {
      throw new ConflictException(`${station.name} already has a health check for ${recordedOn}; update it instead`);
    }
    const rows = await this.prepareRows(station, dto.pumps);
    const saved = await this.dataSource.transaction(async (em) => {
      const check = await em.save(
        em.create(HealthCheck, {
          stationId: station.id,
          recordedOn,
          stationCondition: dto.stationCondition,
          notes: dto.notes?.trim() || null,
          recordedById: user.sub,
          recordedByUsername: user.username,
        }),
      );
      await em.save(PumpCheck, em.create(PumpCheck, rows.map((r) => ({ ...r, healthCheckId: check.id, stationId: station.id, recordedOn }))));
      return check;
    });
    return this.findOne(saved.id, user);
  }

  async update(id: string, dto: UpdateHealthCheckDto, user: JwtPayload): Promise<HealthCheckReport> {
    const check = await this.load(id, user);
    const station = await this.stationsService.findOne(check.stationId);
    const rows = await this.prepareRows(station, dto.pumps);
    await this.dataSource.transaction(async (em) => {
      await em.delete(PumpCheck, { healthCheckId: check.id });
      check.stationCondition = dto.stationCondition;
      check.notes = dto.notes?.trim() || null;
      check.recordedById = user.sub;
      check.recordedByUsername = user.username;
      await em.save(check);
      await em.save(PumpCheck, em.create(PumpCheck, rows.map((r) => ({ ...r, healthCheckId: check.id, stationId: check.stationId, recordedOn: check.recordedOn }))));
    });
    return this.findOne(check.id, user);
  }

  /** Validates every pump belongs to the station and that none is missing or repeated. */
  private async prepareRows(station: Station, dtos: PumpCheckDto[]): Promise<Partial<PumpCheck>[]> {
    const pumps = await this.pumpsService.findByStation(station.id);
    const byId = new Map(pumps.map((p) => [p.id, p]));
    const seen = new Set<string>();
    const errors: string[] = [];
    const rows: Partial<PumpCheck>[] = [];
    for (const dto of dtos) {
      const pump = byId.get(dto.pumpId);
      if (!pump) { errors.push(`Pump "${dto.pumpId}" does not belong to ${station.name}`); continue; }
      if (seen.has(pump.id)) { errors.push(`${pump.name} was submitted more than once`); continue; }
      seen.add(pump.id);
      rows.push({ pumpId: pump.id, pumpName: pump.name, product: pump.product, condition: dto.condition, notes: dto.notes?.trim() || null });
    }
    const missing = pumps.filter((p) => !seen.has(p.id));
    if (missing.length) errors.push(`Missing a condition for: ${missing.map((p) => p.name).join(', ')}`);
    if (errors.length) throw new BadRequestException(errors);
    return rows;
  }

  private async load(id: string, user: JwtPayload): Promise<HealthCheck> {
    const check = await this.checks.findOne({ where: { id } });
    if (!check) throw new NotFoundException(`Health check with id "${id}" not found`);
    await this.resolveStation(user, check.stationId); // 403 for a manager of another station
    return check;
  }

  private async report(check: HealthCheck): Promise<HealthCheckReport> {
    const pumps = await this.pumpChecks.find({ where: { healthCheckId: check.id }, order: { pumpName: 'ASC' } });
    return { ...check, pumps, faultyPumps: pumps.filter((p) => p.condition !== PumpCondition.OK).length };
  }

  async findOne(id: string, user: JwtPayload): Promise<HealthCheckReport> {
    return this.report(await this.load(id, user));
  }

  /** Most recent check for a station, or null if it has never been checked. */
  async findLatest(user: JwtPayload, stationId?: string): Promise<HealthCheckReport | null> {
    const station = await this.resolveStation(user, stationId);
    const check = await this.checks.findOne({ where: { stationId: station.id }, order: { recordedOn: 'DESC' } });
    return check ? this.report(check) : null;
  }

  async findAll(query: HealthChecksQueryDto, user: JwtPayload): Promise<HealthCheckReport[]> {
    const station = await this.resolveStationOrAll(user, query.stationId);
    const to = query.to ?? formatLocalDate(new Date());
    const from = query.from ?? formatLocalDate(addDays(new Date(`${to}T00:00:00`), -29));
    if (from > to) throw new BadRequestException('`from` must be on or before `to`');
    if (eachDay(from, to).length > 366) throw new BadRequestException('Date range may not exceed 366 days');

    const checks = await this.checks.find({
      where: station ? { stationId: station.id, recordedOn: Between(from, to) } : { recordedOn: Between(from, to) },
      order: { recordedOn: 'DESC', stationId: 'ASC' },
    });
    if (!checks.length) return [];
    const pumps = await this.pumpChecks.find({ where: { healthCheckId: In(checks.map((c) => c.id)) }, order: { pumpName: 'ASC' } });
    const grouped = new Map<string, PumpCheck[]>();
    for (const p of pumps) grouped.set(p.healthCheckId, [...(grouped.get(p.healthCheckId) ?? []), p]);
    return checks.map((c) => {
      const list = grouped.get(c.id) ?? [];
      return { ...c, pumps: list, faultyPumps: list.filter((p) => p.condition !== PumpCondition.OK).length };
    });
  }
}
