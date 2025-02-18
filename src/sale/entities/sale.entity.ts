import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

    @Column({})
    dispenserId: number;    
}
