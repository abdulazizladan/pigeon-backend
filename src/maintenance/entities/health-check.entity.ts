import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { StationCondition } from '../maintenance.enums';

/** A manager's walk-round of the station on one day: overall condition plus one PumpCheck per pump. */
@Entity()
@Index(['stationId', 'recordedOn'], { unique: true })
export class HealthCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

  @Column({ type: 'varchar', default: StationCondition.GOOD })
  stationCondition: StationCondition;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', nullable: true })
  recordedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  recordedByUsername: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
