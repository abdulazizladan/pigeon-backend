// src/pump/entities/pump.entity.ts (or dispenser.entity.ts)

import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Station } from '../../station/entities/station.entity'; // Adjust path as necessary
import { Sale } from '../../sale/entities/sale.entity'; // Assuming your Sale entity is here

enum Product {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    GAS = 'GAS', // Assumes LPG or similar
    KEROSENE = 'KEROSENE',
  }

@Entity({ name: 'pumps' })
export class Pump {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The sequential identifier for the pump within the station (e.g., Pump 1, Pump 2).
   */
  @Column({ name: 'pump_number', type: 'int', nullable: false })
  pumpNumber: number;

  /**
   * The type of fuel product this pump dispenses.
   */
  @Column({default: 'petrol'})
  dispensedProduct: Product;

  // --- Relationships ---

  /**
   * Many Pumps belong to One Station.
   * This is the Many side of the relationship.
   */
  @ManyToOne(() => Station, (station) => station.pumps)
  @JoinColumn({ name: 'station_id' }) // Foreign key column in the 'pumps' table
  station: Station;

  /**
   * One Pump can have Many Sales records.
   * This is the One side of the relationship.
   */
  @OneToMany(() => Sale, (sale) => sale.dispenser) // Note: Renamed 'dispenser' in Sale to match 'Pump' usage
  sales: Sale[];

}