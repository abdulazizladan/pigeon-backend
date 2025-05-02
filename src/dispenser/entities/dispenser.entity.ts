import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { Sale } from "src/sale/entities/sale.entity";
import { Station } from "src/station/entities/station.entity";

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

    @Column({nullable: true})
    image: string;

    @Column({comment: "Date dispenser was added"})
    dateAdded: Date;

    @Column({})
    phone: string;

    @Column({default: Status.active})
    status: "active" | "inactive";

    @OneToMany((type) => Sale, sale => sale.dispenser)
    sales: Sale[];

    @ManyToOne((type) => Station, station => station.dispensers)
    @JoinColumn({name: 'station_id', referencedColumnName: "id"})
    station: Station;

}
