import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RepairPriority, RepairStatus } from '../maintenance.enums';

/** A manager's report of a faulty facility, awaiting a director's authorization to repair. */
@Entity()
@Index(['stationId', 'status'])
@Index(['status', 'priority'])
export class RepairRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar' })
  stationName: string;

  /** Set when the faulty facility is a specific pump. */
  @Column({ type: 'varchar', nullable: true })
  pumpId: string | null;

  @Column({ type: 'varchar', nullable: true })
  pumpName: string | null;

  /** What is faulty, e.g. "Pump 2", "Canopy lights", "Generator". */
  @Column({ type: 'varchar', length: 120 })
  facility: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', default: RepairPriority.MEDIUM })
  priority: RepairPriority;

  @Column({ type: 'varchar', default: RepairStatus.PENDING })
  status: RepairStatus;

  /** The health check that surfaced the fault, when there was one. */
  @Column({ type: 'varchar', nullable: true })
  healthCheckId: string | null;

  @Column({ type: 'varchar', nullable: true })
  requestedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  requestedByUsername: string | null;

  @Column({ type: 'varchar', nullable: true })
  decidedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  decidedByUsername: string | null;

  @Column({ type: 'datetime', nullable: true })
  decidedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  decisionNote: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
