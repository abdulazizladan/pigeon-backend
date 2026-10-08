import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';
import { PumpStatus } from '../pump-status.enum';

/** A dispensing pump at a station. Each pump sells one product and draws from that product's reservoir. */
@Entity()
@Index(['stationId', 'name'], { unique: true })
export class Pump {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  /** Label painted on the pump, e.g. "Pump 1". Unique within the station. */
  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ type: 'varchar' })
  product: Product;

  @Column({ type: 'varchar', default: PumpStatus.ACTIVE })
  status: PumpStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
