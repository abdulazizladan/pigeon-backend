import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';

/** Dip levels of one reservoir at open and close of a trading day, plus any delivery received in between. */
@Entity()
@Index(['recordId'])
@Index(['reservoirId'])
export class ReservoirReading {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  recordId: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

  @Column({ type: 'varchar' })
  reservoirId: string;

  @Column({ type: 'varchar' })
  product: Product;

  @Column({ type: 'real' })
  openingLevel: number;

  /** Litres received from a tanker during the day; 0 when nothing was delivered. */
  @Column({ type: 'real', default: 0 })
  deliveredLitres: number;

  @Column({ type: 'real' })
  closingLevel: number;

  /** openingLevel + deliveredLitres − closingLevel: what left the tank, so what the pumps should have sold. */
  @Column({ type: 'real' })
  expectedLitres: number;
}
