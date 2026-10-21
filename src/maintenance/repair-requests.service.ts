import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { RepairRequest } from './entities/repair-request.entity';
import { CreateRepairRequestDto, DecideRepairRequestDto, RepairRequestsQueryDto } from './dto/repair-request.dto';
import { DECISION_STATUS, RepairPriority, RepairStatus } from './maintenance.enums';
import { HealthChecksService } from './health-checks.service';
import { PumpsService } from '../pumps/pumps.service';
import { JwtPayload } from '../auth/auth.service';

export interface RepairRequestStats {
  total: number;
  byStatus: Record<RepairStatus, number>;
  pendingByPriority: Record<RepairPriority, number>;
}

const isManager = (u: JwtPayload) => u.role === 'manager';

@Injectable()
export class RepairRequestsService {
  constructor(
    @InjectRepository(RepairRequest) private readonly requests: Repository<RepairRequest>,
    private readonly healthChecks: HealthChecksService,
    private readonly pumpsService: PumpsService,
  ) {}

  async create(dto: CreateRepairRequestDto, user: JwtPayload): Promise<RepairRequest> {
    const station = await this.healthChecks.resolveStation(user, dto.stationId);
    let pumpName: string | null = null;
    if (dto.pumpId) {
      const pump = await this.pumpsService.findOne(dto.pumpId);
      if (pump.stationId !== station.id) throw new BadRequestException(`That pump is not at ${station.name}`);
      pumpName = pump.name;
    }
    return this.requests.save(
      this.requests.create({
        stationId: station.id,
        stationName: station.name,
        pumpId: dto.pumpId ?? null,
        pumpName,
        facility: dto.facility.trim(),
        description: dto.description.trim(),
        priority: dto.priority,
        status: RepairStatus.PENDING,
        healthCheckId: dto.healthCheckId ?? null,
        requestedById: user.sub,
        requestedByUsername: user.username,
        decidedById: null,
        decidedByUsername: null,
        decidedAt: null,
        decisionNote: null,
      }),
    );
  }

  async findOne(id: string, user: JwtPayload): Promise<RepairRequest> {
    const request = await this.requests.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Repair request with id "${id}" not found`);
    if (isManager(user)) await this.healthChecks.resolveStation(user, request.stationId);
    return request;
  }

  /** Managers see their station's requests; directors and admins see every station unless filtered. */
  async findAll(query: RepairRequestsQueryDto, user: JwtPayload): Promise<RepairRequest[]> {
    const where: FindOptionsWhere<RepairRequest> = {};
    if (isManager(user) || query.stationId) {
      where.stationId = (await this.healthChecks.resolveStation(user, query.stationId)).id;
    }
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    return this.requests.find({ where, order: { createdAt: 'DESC' } });
  }

  async getStats(user: JwtPayload, stationId?: string): Promise<RepairRequestStats> {
    const where: FindOptionsWhere<RepairRequest> = {};
    if (isManager(user) || stationId) where.stationId = (await this.healthChecks.resolveStation(user, stationId)).id;
    const rows = await this.requests.find({ where, select: { status: true, priority: true } });
    const byStatus = Object.fromEntries(Object.values(RepairStatus).map((s) => [s, 0])) as Record<RepairStatus, number>;
    const pendingByPriority = Object.fromEntries(Object.values(RepairPriority).map((p) => [p, 0])) as Record<RepairPriority, number>;
    for (const r of rows) {
      byStatus[r.status]++;
      if (r.status === RepairStatus.PENDING) pendingByPriority[r.priority]++;
    }
    return { total: rows.length, byStatus, pendingByPriority };
  }

  /** Authorize, deny or ignore. A request that was ignored can still be decided later; authorized or denied ones are final. */
  async decide(id: string, dto: DecideRepairRequestDto, user: JwtPayload): Promise<RepairRequest> {
    if (isManager(user)) throw new ForbiddenException('Only a director or admin can decide on a repair request');
    const request = await this.findOne(id, user);
    if (request.status === RepairStatus.AUTHORIZED || request.status === RepairStatus.DENIED) {
      throw new BadRequestException(`This request has already been ${request.status}`);
    }
    request.status = DECISION_STATUS[dto.decision];
    request.decidedById = user.sub;
    request.decidedByUsername = user.username;
    request.decidedAt = new Date();
    request.decisionNote = dto.note?.trim() || null;
    return this.requests.save(request);
  }
}
