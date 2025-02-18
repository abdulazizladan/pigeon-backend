import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

}
