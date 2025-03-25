import { Dispenser } from "src/dispenser/entities/dispenser.entity";
import { Station } from "src/station/entities/station.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";

@Entity({name: "Sale"})
export class Sale {
    @PrimaryGeneratedColumn({})
    id: number;

    @Column({})
    pumpId: number;
    
    @Column({})
    pricePerLitre: number;

    @Column({})
    openingMeterReading: number;

    @Column({})
    closingMeterReading: number;

    @Column({})
    transactionDate: Date;
    
    @ManyToOne((type) => Dispenser, dispenser => dispenser.sales)
    @JoinColumn({name: 'dispenser_id', referencedColumnName: 'id'})
    dispenser: Dispenser;

    @ManyToOne((type) => Station, station => station.sales)
    @JoinColumn({name: 'station_id', referencedColumnName: 'id'})
    station: Station;
}
