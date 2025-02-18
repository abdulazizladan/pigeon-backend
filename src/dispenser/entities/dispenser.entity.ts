import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "Dispenser"})
export class Dispenser {
    @PrimaryGeneratedColumn({})
    id: number;

    @Column({})
    firstName: string;

    @Column({nullable: false})
    middleName: string;

    @Column({})
    lastName: string;

    @Column({comment: "Date dispenser was added"})
    dateAdded: Date;
}
