import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';
import { PumpCondition } from '../maintenance.enums';

/** One pump's condition within a HealthCheck. Name and product are snapshotted. */
@Entity()
@Index(['healthCheckId'])
@Index(['pumpId'])
export class PumpCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  healthCheckId: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar', length: 10 })
  recordedOn: string;

  @Column({ type: 'varchar' })
  pumpId: string;

  @Column({ type: 'varchar' })
  pumpName: string;

  @Column({ type: 'varchar' })
  product: Product;

  @Column({ type: 'varchar', default: PumpCondition.OK })
  condition: PumpCondition;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
