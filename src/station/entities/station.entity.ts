import { Dispenser } from "src/dispenser/entities/dispenser.entity";
import { Sale } from "src/sale/entities/sale.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsString, IsNumber, IsOptional, IsEnum } from "class-validator";
import { Pump } from "./pump.entity";

@Entity({name: "Station"})
export class Station {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({})
    // Name of the station
    @IsString()
    name: string;

    @Column({})
    // Physical address of the station
    @IsString()
    address: string;

    @Column({})
    // Ward where the station is located
    @IsString()
    ward: string;

    @Column({})
    // Local Government Area of the station
    @IsString()
    lga: string;

    @Column({})
    // State where the station is located
    @IsString()
    state: string;

    @Column({})
    // Longitude coordinate of the station
    @IsNumber()
    longitude: number;

    @Column({})
    // Latitude coordinate of the station
    @IsNumber()
    latitude: number;

    @JoinColumn({name: "user_id", referencedColumnName: "id"})
    @OneToOne((type) => User, (user: User) => user.station)
    // Manager of the station (User entity)
    @IsOptional()
    manager: User;

    @Column({})
    // Price per liter at the station
    @IsNumber()
    pricePerLiter: number;

    @OneToMany((type) => Sale, sale => sale.station)
    // Sales associated with the station
    @IsOptional()
    sales: Sale[];

    @OneToMany((type) => Dispenser, dispenser => dispenser.station)
    // Dispensers available at the station
    @IsOptional()
    dispensers: Dispenser[];

    @Column({default: "active"})
    // Status of the station (active or inactive)
    @IsEnum(["active", "inactive"])
    status: "active" | "inactive";

    @OneToMany(() => Pump, (pump) => pump.station)
    pumps: Pump[];
}
