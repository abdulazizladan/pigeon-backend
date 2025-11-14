import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
import { Station } from "./station.entity";
import { Pump } from "./pump.entity";


@Entity({ name: 'PumpDailyRecords' })
export class PumpDailyRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * The day this sales record is for (important for grouping).
   * Note: Always store as a date without time components (e.g., '2023-11-03').
   */
  @Column({ type: 'date', nullable: false })
  recordDate: Date;

  /**
   * The total volume of fuel dispensed by this pump on this day (in Liters).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  volumeSold: number;

  /**
   * The total monetary value of sales from this pump on this day.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalRevenue: number;

  // --- Relationships ---

  /**
   * Many Daily Records belong to One Pump.
   * This relationship provides the foreign key `pumpId` in this table.
   */
  @ManyToOne(() => Pump, (pump) => pump.dailyRecords)
  @JoinColumn({ name: 'pump_id' })
  pump: Pump;

  /**
   * An optional shortcut to the station for querying/reporting simplicity,
   * though it can also be retrieved via the Pump relationship.
   * This is denormalization, which is often acceptable for reporting convenience.
   */
  @ManyToOne(() => Station, (station) => station.dailyRecords)
  @JoinColumn({ name: 'station_id' })
  station: Station; // Added for easy grouping by station
  
  // Ensures that there is only ONE record per pump per day
  @Index(['pump', 'recordDate'], { unique: true })
  
  @CreateDateColumn({ precision: 6 })
  createdAt: Date;
}