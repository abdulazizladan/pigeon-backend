import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * One manager submission covering a whole trading day at a station: meter readings for
 * every pump plus opening/closing levels for every reservoir. One per station per day.
 */
@Entity()
@Index(['stationId', 'recordedOn'], { unique: true })
export class DailyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  /** Trading day as YYYY-MM-DD. */
  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

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
