import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Station } from "./station.entity";

@Entity({name: 'Stock'})
export class Stock {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    dateTaken: Date;

    @Column()
    petrolReading: number;

    @Column()
    dieselReading: number;

    @CreateDateColumn({default: Date.now()})
    dateUpdated: Date;

    @ManyToOne((type) => Station, station => station.stock)
    station: Station;
}