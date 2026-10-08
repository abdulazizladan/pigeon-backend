import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StationsService } from '../stations/stations.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/enums/role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import { CreateManagerDto } from './dto/create-manager.dto';

export interface ManagerStationRef {
  id: string;
  name: string;
  code: string;
}

/** A manager as returned by the API: the user record plus the station they run. */
export type Manager = Omit<User, 'password'> & { station: ManagerStationRef | null };

@Injectable()
export class ManagersService {
  constructor(
    private readonly usersService: UsersService,
    private readonly stationsService: StationsService,
  ) {}

  async findAll(status?: UserStatus): Promise<Manager[]> {
    const [managers, stations] = await Promise.all([
      this.usersService.findManagers(status),
      this.stationsService.findAll(),
    ]);
    const stationByManager = new Map<string, ManagerStationRef>();
    for (const s of stations) {
      if (s.managerId) stationByManager.set(s.managerId, { id: s.id, name: s.name, code: s.code });
    }
    return managers.map((m) => ({ ...m, station: stationByManager.get(m.id) ?? null }));
  }

  async findOne(id: string): Promise<Manager> {
    const user = await this.usersService.findOneById(id);
    if (!user || user.role !== Role.MANAGER) {
      throw new NotFoundException(`Manager with id "${id}" not found`);
    }
    const { password, ...manager } = user;
    const station = await this.stationsService.findByManager(id);
    return {
      ...manager,
      station: station ? { id: station.id, name: station.name, code: station.code } : null,
    };
  }

  async create(dto: CreateManagerDto, creatorRole: Role): Promise<Manager> {
    const created = await this.usersService.createUser({ ...dto, role: Role.MANAGER }, creatorRole);
    return { ...created, station: null };
  }

  /**
   * Soft-removes a manager: status becomes inactive, they can no longer log in,
   * and they are unassigned from their station so it shows as needing a manager.
   */
  async remove(id: string): Promise<Manager> {
    await this.findOne(id); // 404 if missing or not a manager
    const updated = await this.usersService.updateStatus(id, UserStatus.INACTIVE);
    await this.stationsService.unassignManager(id);
    return { ...updated, station: null };
  }
}
