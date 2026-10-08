import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketPriority, TicketStatus } from '../enums/ticket.enums';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'varchar', default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  // Denormalised creator/assignee so list responses never touch the users table
  // (and never risk leaking password hashes through a relation).
  @Column({ type: 'varchar', nullable: true })
  createdById: string | null;

  @Column({ type: 'varchar', nullable: true })
  createdByUsername: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedToId: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedToUsername: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
