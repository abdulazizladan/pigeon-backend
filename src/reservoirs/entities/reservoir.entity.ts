import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Product } from '../../products/product.enum';

/** The underground storage tank for one product at one station. Exactly one per product per station. */
@Entity()
@Index(['stationId', 'product'], { unique: true })
export class Reservoir {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  stationId: string;

  @Column({ type: 'varchar' })
  product: Product;

  /** Litres the tank can hold. Daily levels may not exceed it. */
  @Column({ type: 'real' })
  capacityLitres: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
