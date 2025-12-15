import { Dispenser } from "src/dispenser/entities/dispenser.entity";
import { Pump } from "src/station/entities/pump.entity";
import { Station } from "src/station/entities/station.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, OneToOne, Index } from "typeorm";
import { Product } from "../enum/product.enum";

@Entity({ name: 'Sale' }) // Use plural, lowercase name convention
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The type of product sold (e.g., PETROL, DIESEL).
   */
  @Column({
    default: "product" // Use enum value as default
  })
  product: string; // Use the enum type

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
   * The calculated total price of the transaction (Volume * PricePerLitre).
   * CRITICAL: Added for reporting queries.
   */
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 4,
    nullable: false,
    name: 'total_price',
  })
  totalPrice: number; // New column to store calculated price

  /**
   * Timestamp when the sale record was created (defaults to now).
   */
  @CreateDateColumn({ precision: 6 })
  @Index()
  createdAt: Date;

  // --- Relationships ---

  @ManyToOne(() => User, (user) => user.sales)
  @JoinColumn({ name: 'recorded_by_user_id' })
  recordedBy: User;

  /**
   * 🗺️ Links the sale to the specific Station where the transaction occurred (derived from Pump).
   */
  @ManyToOne(() => Station, (station) => station.sales)
  @JoinColumn({ name: 'stationId' })
  @Index()
  station: Station;

  /**
   * ⛽ Links the sale to the specific Pump used.
   */
  @ManyToOne(() => Pump, (pump) => pump.sales)
  @JoinColumn({ name: 'pump_id' })
  @Index()
  pump: Pump;

  @OneToOne((type) => Dispenser, dispenser => dispenser.sales)
  @JoinColumn({ name: 'saleId' })
  dispenser: Dispenser;
}
