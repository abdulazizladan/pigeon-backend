import { Dispenser } from "src/dispenser/entities/dispenser.entity";
import { Pump } from "src/station/entities/pump.entity";
import { Station } from "src/station/entities/station.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";

enum Product {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    GAS = 'GAS', // Assumes LPG or similar
    KEROSENE = 'KEROSENE',
  }

  @Entity({ name: 'Sale' }) // Use plural, lowercase name convention
  export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    /**
     * The type of product sold (e.g., PETROL, DIESEL).
     */
    @Column({
      default: 'petrol'
    })
    product: string;
  
    /**
     * Price per unit volume (e.g., per liter) at the time of transaction.
     */
    @Column({
      type: 'decimal',
      precision: 10,
      scale: 4, // Up to 4 decimal places for price accuracy
      nullable: false,
      name: 'price_per_litre',
    })
    pricePerLitre: number;
  
    /**
     * The reading on the dispenser before the transaction started.
     */
    @Column({
      type: 'decimal',
      precision: 15, // High precision for meter readings
      scale: 3,
      nullable: false,
      name: 'opening_meter_reading',
    })
    openingMeterReading: number;
  
    /**
     * The reading on the dispenser after the transaction concluded.
     */
    @Column({
      type: 'decimal',
      precision: 15,
      scale: 3,
      nullable: false,
      name: 'closing_meter_reading',
    })
    closingMeterReading: number;
  
    /**
     * Timestamp when the sale record was created (defaults to now).
     * Renamed from transactionDate and using CreateDateColumn for clarity.
     */
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    // --- Relationships ---
  
    /**
     * Links the sale to the specific dispenser/pump used.
     * Using 'dispenser_id' as the foreign key column name.
     */
    @ManyToOne(() => Dispenser, (dispenser) => dispenser.sales)
    @JoinColumn({ name: 'dispenser_id' }) // No need for referencedColumnName if it's 'id'
    dispenser: Dispenser;
  
    @ManyToOne(() => User, (user) => user.sales)
    @JoinColumn({ name: 'recorded_by_user_id' }) // New foreign key column name
    recordedBy: User;
  
    /**
     * 🗺️ Links the sale to the specific Station where the transaction occurred.
     * (Directly linking for easy querying, though station is also accessible via Pump).
     */
    @ManyToOne(() => Station, (station) => station.sales)
    @JoinColumn({ name: 'station_id' })
    station: Station;
  
    /**
     * ⛽ Links the sale to the specific Pump used.
     */
    @ManyToOne(() => Pump, (pump) => pump.sales)
    @JoinColumn({ name: 'pump_id' }) // Renamed from 'dispenser_id' to 'pump_id'
    pump: Pump;
  }