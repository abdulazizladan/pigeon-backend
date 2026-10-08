import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from '../product.enum';

/** The current selling price of one product at one station, in Naira per litre. */
@Entity()
@Index(['stationId', 'product'], { unique: true })
export class StationProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar' })
  product: Product;

  /** ₦ per litre. Daily records snapshot this value so later price changes never rewrite history. */
  @Column({ type: 'real' })
  pricePerLitre: number;

  @Column({ type: 'varchar', nullable: true })
  updatedById: string | null;

  @Column({ type: 'varchar', nullable: true })
  updatedByUsername: string | null;

  @UpdateDateColumn()
  updatedAt: Date;
}
