import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StationStatus } from '../enums/station-status.enum';

@Entity()
export class Station {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  /** Short unique identifier, generated from the name when not supplied. */
  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Street address within the LGA. */
  @Column({ type: 'varchar', length: 160, nullable: true })
  address: string | null;

  /** Local Government Area. */
  @Column({ type: 'varchar', length: 80, nullable: true })
  lga: string | null;

  /** One of NIGERIAN_STATES. */
  @Column({ type: 'varchar', length: 40, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', default: StationStatus.ACTIVE })
  status: StationStatus;

  // Denormalised manager so station reads never join the users table.
  @Column({ type: 'varchar', nullable: true })
  managerId: string | null;

  @Column({ type: 'varchar', nullable: true })
  managerUsername: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
