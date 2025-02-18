import { Entity, ManyToOne, Column, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enum/status.enum";

@Entity({name: "Pump"})
export class Pump{
    
    @PrimaryGeneratedColumn({})
    id: number;

    @Column({})
    number: number;

    @Column({default: Status.working})
    status: Status;

}