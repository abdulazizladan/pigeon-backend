import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketPriority, TicketStatus } from './enums/ticket.enums';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../auth/auth.service';
import { shouldSeedDemoData } from '../common/seed.util';

const isAdmin = (user: JwtPayload) => user.role === 'admin';

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

@Injectable()
export class TicketsService implements OnModuleInit {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    private readonly usersService: UsersService,
  ) {}

  /** Seeds a few sample tickets in non-production environments so the UI has data. */
  async onModuleInit() {
    if (!shouldSeedDemoData()) return;
    if ((await this.ticketsRepository.count()) > 0) return;

    const manager = await this.usersService.findOneByUsername('manager');
    const director = await this.usersService.findOneByUsername('director');

    const samples: Partial<Ticket>[] = [
      {
        title: 'Cannot reset password',
        description: 'The password reset link in the email returns a 404 page.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
      },
      {
        title: 'Dashboard stats not refreshing',
        description: 'User counts on the dashboard stay stale until a hard reload.',
        status: TicketStatus.IN_PROGRESS,
        priority: TicketPriority.MEDIUM,
      },
      {
        title: 'Request: export users to CSV',
        description: 'Directors would like to export the users directory as CSV.',
        status: TicketStatus.OPEN,
        priority: TicketPriority.LOW,
      },
      {
        title: 'Login page blank on Safari 15',
        description: 'Blank screen after submitting credentials on older Safari builds.',
        status: TicketStatus.RESOLVED,
        priority: TicketPriority.URGENT,
      },
      {
        title: 'Dark mode toggle not persisted',
        description: 'Theme resets to light after closing the tab.',
        status: TicketStatus.CLOSED,
        priority: TicketPriority.LOW,
      },
    ];

    for (const sample of samples) {
      await this.ticketsRepository.save(
        this.ticketsRepository.create({
          ...sample,
          createdById: manager?.id ?? null,
          createdByUsername: manager?.username ?? null,
          assignedToId: sample.status === TicketStatus.OPEN ? null : director?.id ?? null,
          assignedToUsername: sample.status === TicketStatus.OPEN ? null : director?.username ?? null,
        }),
      );
    }
  }

  /** Admins see every ticket; everyone else sees only the tickets they raised. */
  findAll(user: JwtPayload): Promise<Ticket[]> {
    return this.ticketsRepository.find({
      where: isAdmin(user) ? {} : { createdById: user.sub },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user?: JwtPayload): Promise<Ticket> {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket with id "${id}" not found`);
    if (user && !isAdmin(user) && ticket.createdById !== user.sub) {
      throw new ForbiddenException('You can only view tickets you raised');
    }
    return ticket;
  }

  async getStats(user: JwtPayload): Promise<TicketStats> {
    const tickets = await this.ticketsRepository.find({
      select: { status: true, priority: true },
      where: isAdmin(user) ? {} : { createdById: user.sub },
    });
    const byStatus = Object.fromEntries(
      Object.values(TicketStatus).map((s) => [s, 0]),
    ) as Record<TicketStatus, number>;
    const byPriority = Object.fromEntries(
      Object.values(TicketPriority).map((p) => [p, 0]),
    ) as Record<TicketPriority, number>;
    for (const t of tickets) {
      byStatus[t.status]++;
      byPriority[t.priority]++;
    }
    return { total: tickets.length, byStatus, byPriority };
  }

  async create(dto: CreateTicketDto, creator: JwtPayload): Promise<Ticket> {
    const ticket = this.ticketsRepository.create({
      title: dto.title.trim(),
      description: dto.description.trim(),
      priority: dto.priority ?? TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      createdById: creator.sub,
      createdByUsername: creator.username,
      assignedToId: null,
      assignedToUsername: null,
    });
    return this.ticketsRepository.save(ticket);
  }

  /**
   * Admins may change anything. The person who raised a ticket may edit its title, description
   * and priority, close it, or reopen a closed one; they may not assign it or mark it in progress
   * or resolved, which is the support team's call.
   */
  async update(id: string, dto: UpdateTicketDto, user: JwtPayload): Promise<Ticket> {
    const ticket = await this.findOne(id);
    const admin = isAdmin(user);
    const owner = ticket.createdById === user.sub;

    if (!admin && !owner) throw new ForbiddenException('You can only update tickets you raised');

    if (!admin) {
      if (dto.assignedToId !== undefined) {
        throw new ForbiddenException('Only an admin can assign a ticket');
      }
      if (dto.status !== undefined && dto.status !== TicketStatus.CLOSED && dto.status !== TicketStatus.OPEN) {
        throw new ForbiddenException('You can close or reopen your ticket; other status changes are made by support');
      }
      if (dto.status === TicketStatus.OPEN && ticket.status !== TicketStatus.CLOSED) {
        throw new ForbiddenException('Only a closed ticket can be reopened');
      }
    }

    if (dto.title !== undefined) ticket.title = dto.title.trim();
    if (dto.description !== undefined) ticket.description = dto.description.trim();
    if (dto.status !== undefined) ticket.status = dto.status;
    if (dto.priority !== undefined) ticket.priority = dto.priority;

    if (dto.assignedToId !== undefined) {
      if (dto.assignedToId === null) {
        ticket.assignedToId = null;
        ticket.assignedToUsername = null;
      } else {
        const assignee = await this.usersService.findOneById(dto.assignedToId);
        if (!assignee) throw new NotFoundException(`User with id "${dto.assignedToId}" not found`);
        ticket.assignedToId = assignee.id;
        ticket.assignedToUsername = assignee.username;
      }
    }

    return this.ticketsRepository.save(ticket);
  }
}
