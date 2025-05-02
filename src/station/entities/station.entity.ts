import { Dispenser } from "src/dispenser/entities/dispenser.entity";
import { Sale } from "src/sale/entities/sale.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @JoinColumn({name: "user_id", referencedColumnName: "id"})
    @OneToOne((type) => User, (user: User) => user.station)
    manager: User;

    @Column({})
    pricePerLiter: number;

    @OneToMany((type) => Sale, sale => sale.station)
    sales: Sale[];

    @OneToMany((type) => Dispenser, dispenser => dispenser.station)
    dispensers: Dispenser[];

    @Column({default: "active"})
    status: "active" | "inactive";
}
