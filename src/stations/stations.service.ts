import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Station } from './entities/station.entity';
import { StationStatus } from './enums/station-status.enum';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../users/enums/role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import { shouldSeedDemoData } from '../common/seed.util';

export interface StationStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  managers: {
    total: number;
    assigned: number;
    unassigned: number;
  };
}

type SeedStation = Pick<Station, 'name' | 'code' | 'description' | 'address' | 'lga' | 'state' | 'status'>;

const SEED_STATIONS: SeedStation[] = [
  { name: 'Lekki Station', code: 'LKK-01', description: 'Flagship station serving Lekki Phase 1 and the Admiralty corridor.', address: '12 Admiralty Way, Lekki Phase 1', lga: 'Eti-Osa', state: 'Lagos', status: StationStatus.ACTIVE },
  { name: 'Ikeja Station', code: 'IKJ-02', description: 'High-volume station close to the airport road.', address: '3 Isaac John Street, GRA', lga: 'Ikeja', state: 'Lagos', status: StationStatus.ACTIVE },
  { name: 'Wuse Station', code: 'WSE-03', description: 'Central Abuja station with extended opening hours.', address: 'Plot 221 Herbert Macaulay Way, Zone 5', lga: 'Abuja Municipal', state: 'FCT', status: StationStatus.ACTIVE },
  { name: 'Garki Station', code: 'GRK-04', description: 'Closed for pump replacement and canopy works.', address: 'Area 11, Garki', lga: 'Abuja Municipal', state: 'FCT', status: StationStatus.MAINTENANCE },
  { name: 'Port Harcourt Station', code: 'PHC-05', description: 'Serves the GRA Phase 2 business district.', address: '45 Tombia Street, GRA Phase 2', lga: 'Port Harcourt', state: 'Rivers', status: StationStatus.ACTIVE },
  { name: 'Kano Station', code: 'KNO-06', description: 'Undergoing tank integrity inspection.', address: 'Zoo Road, Nassarawa GRA', lga: 'Nassarawa', state: 'Kano', status: StationStatus.MAINTENANCE },
];

@Injectable()
export class StationsService implements OnModuleInit {
  constructor(
    @InjectRepository(Station)
    private readonly stationsRepository: Repository<Station>,
    private readonly usersService: UsersService,
  ) {}

  /** Seeds sample stations in non-production, and backfills address fields on earlier seed rows. */
  async onModuleInit() {
    if (!shouldSeedDemoData()) return;

    const existing = await this.stationsRepository.find();
    if (existing.length === 0) {
      const manager = await this.usersService.findOneByUsername('manager');
      for (const [index, sample] of SEED_STATIONS.entries()) {
        const assign = index === 0 && manager;
        await this.stationsRepository.save(
          this.stationsRepository.create({
            ...sample,
            managerId: assign ? manager.id : null,
            managerUsername: assign ? manager.username : null,
          }),
        );
      }
      return;
    }

    // Seed rows created before description/address/lga/state existed get them filled in.
    for (const station of existing) {
      if (station.state) continue;
      const sample = SEED_STATIONS.find((s) => s.code === station.code);
      if (!sample) continue;
      Object.assign(station, {
        description: sample.description,
        address: sample.address,
        lga: sample.lga,
        state: sample.state,
      });
      await this.stationsRepository.save(station);
    }
  }

  findAll(): Promise<Station[]> {
    return this.stationsRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Station> {
    const station = await this.stationsRepository.findOne({ where: { id } });
    if (!station) throw new NotFoundException(`Station with id "${id}" not found`);
    return station;
  }

  /** The station a manager is assigned to, if any. */
  findByManager(managerId: string): Promise<Station | null> {
    return this.stationsRepository.findOne({ where: { managerId } });
  }

  async getStats(): Promise<StationStats> {
    const [stations, users] = await Promise.all([
      this.stationsRepository.find({ select: { status: true, managerId: true } }),
      this.usersService.findAll(),
    ]);

    const managers = users.filter((u) => u.role === Role.MANAGER && u.status === UserStatus.ACTIVE);
    const assignedIds = new Set(stations.map((s) => s.managerId).filter((id): id is string => !!id));
    const assigned = managers.filter((m) => assignedIds.has(m.id)).length;
    const count = (status: StationStatus) => stations.filter((s) => s.status === status).length;

    return {
      total: stations.length,
      active: count(StationStatus.ACTIVE),
      maintenance: count(StationStatus.MAINTENANCE),
      inactive: count(StationStatus.INACTIVE),
      managers: {
        total: managers.length,
        assigned,
        unassigned: managers.length - assigned,
      },
    };
  }

  async create(dto: CreateStationDto): Promise<Station> {
    const code = dto.code ? dto.code.trim().toUpperCase() : await this.generateCode(dto.name);
    if (await this.stationsRepository.findOne({ where: { code } })) {
      throw new ConflictException(`Station code "${code}" already exists`);
    }

    const manager = dto.managerId ? await this.resolveManager(dto.managerId) : null;

    return this.stationsRepository.save(
      this.stationsRepository.create({
        name: dto.name.trim(),
        code,
        description: dto.description?.trim() || null,
        address: dto.address.trim(),
        lga: dto.lga.trim(),
        state: dto.state,
        status: dto.status ?? StationStatus.ACTIVE,
        managerId: manager?.id ?? null,
        managerUsername: manager?.username ?? null,
      }),
    );
  }

  async update(id: string, dto: UpdateStationDto): Promise<Station> {
    const station = await this.findOne(id);

    if (dto.name !== undefined) station.name = dto.name.trim();
    if (dto.description !== undefined) station.description = dto.description?.trim() || null;
    if (dto.address !== undefined) station.address = dto.address.trim();
    if (dto.lga !== undefined) station.lga = dto.lga.trim();
    if (dto.state !== undefined) station.state = dto.state;
    if (dto.status !== undefined) station.status = dto.status;

    if (dto.managerId !== undefined) {
      if (dto.managerId === null) {
        station.managerId = null;
        station.managerUsername = null;
      } else {
        const manager = await this.resolveManager(dto.managerId, station.id);
        station.managerId = manager.id;
        station.managerUsername = manager.username;
      }
    }

    return this.stationsRepository.save(station);
  }

  /** Clears the manager from whichever station they run. Returns the station, or null if none. */
  async unassignManager(managerId: string): Promise<Station | null> {
    const station = await this.stationsRepository.findOne({ where: { managerId } });
    if (!station) return null;
    station.managerId = null;
    station.managerUsername = null;
    return this.stationsRepository.save(station);
  }

  /** Validates that a user can be assigned: exists, is an active manager, and runs no other station. */
  private async resolveManager(managerId: string, forStationId?: string) {
    const manager = await this.usersService.findOneById(managerId);
    if (!manager) throw new NotFoundException(`User with id "${managerId}" not found`);
    if (manager.role !== Role.MANAGER) {
      throw new BadRequestException('Only users with the manager role can be assigned to a station');
    }
    if (manager.status === UserStatus.INACTIVE) {
      throw new BadRequestException('An inactive manager cannot be assigned to a station');
    }
    const elsewhere = await this.stationsRepository.findOne({ where: { managerId: manager.id } });
    if (elsewhere && elsewhere.id !== forStationId) {
      throw new ConflictException(`${manager.username} is already assigned to ${elsewhere.name}`);
    }
    return manager;
  }

  /** e.g. "Lekki Station" -> "LEK-07": three letters from the name plus a running number. */
  private async generateCode(name: string): Promise<string> {
    const letters = name.replace(/[^A-Za-z]/g, '').toUpperCase().padEnd(3, 'X').slice(0, 3);
    const total = await this.stationsRepository.count();
    for (let n = total + 1; n < total + 1000; n++) {
      const candidate = `${letters}-${String(n).padStart(2, '0')}`;
      if (!(await this.stationsRepository.findOne({ where: { code: candidate } }))) return candidate;
    }
    throw new ConflictException('Could not generate a unique station code; please supply one');
  }
}
