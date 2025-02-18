import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: "Station"})
export class Station {
    @PrimaryGeneratedColumn({})
    id: number;

    @Column({})
    name: string;

    @Column({})
    address: string;

    @Column({})
    ward: string;

    @Column({})
    lga: string;

    @Column({})
    state: string;

    @Column({})
    longitude: number;

    @Column({})
    latitude: number;

}
