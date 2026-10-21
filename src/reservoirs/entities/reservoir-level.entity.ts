import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';

/**
 * A standalone end-of-day dip reading of one reservoir. Daily sales records also carry closing
 * levels; the level indicator uses whichever reading is newest. One row per reservoir per day.
 */
@Entity()
@Index(['reservoirId', 'recordedOn'], { unique: true })
@Index(['stationId', 'recordedOn'])
export class ReservoirLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar' })
  reservoirId: string;

  @Column({ type: 'varchar' })
  product: Product;

  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

  /** Litres in the tank at close of business. */
  @Column({ type: 'real' })
  level: number;

  @Column({ type: 'varchar', nullable: true })
  recordedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  recordedByUsername: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
