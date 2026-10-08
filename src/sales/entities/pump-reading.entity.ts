import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';

/** A pump's totaliser at open and close of one trading day. Litres sold = closing − opening. */
@Entity()
@Index(['recordId'])
@Index(['pumpId'])
export class PumpReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  recordId: string;

  @Column({ type: 'varchar' })
  stationId: string;

  /** Copied from the record so range queries never need a join. */
  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

  @Column({ type: 'varchar' })
  pumpId: string;

  // Name and product are snapshotted so renaming or re-plumbing a pump later never changes history.
  @Column({ type: 'varchar' })
  pumpName: string;

  @Column({ type: 'varchar' })
  product: Product;

  @Column({ type: 'real' })
  openingReading: number;

  @Column({ type: 'real' })
  closingReading: number;

  @Column({ type: 'real' })
  litresSold: number;

  /** ₦/litre in force when the day was recorded. */
  @Column({ type: 'real' })
  pricePerLitre: number;

  /** litresSold × pricePerLitre, in ₦. */
  @Column({ type: 'real' })
  amount: number;
}
