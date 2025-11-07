import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { Sale } from "src/sale/entities/sale.entity";
import { Station } from "src/station/entities/station.entity";
import { IsString, IsOptional, IsEnum, IsDate, IsNumber } from "class-validator";

@Entity({name: "Dispenser"})
export class Dispenser {
    /**
     * Unique identifier for the dispenser (Primary Key)
     */
    @PrimaryGeneratedColumn('uuid')
    @IsString()
    id: string;

    /**
     * First name of the dispenser
     */
    @Column({})
    @IsString()
    firstName: string;

    /**
     * Middle name of the dispenser
     */
    @Column({nullable: false})
    @IsString()
    middleName: string;

    /**
     * Last name of the dispenser
     */
    @Column({})
    @IsString()
    lastName: string;

    /**
     * URL or path to the dispenser's image (optional)
     */
    @Column({nullable: true})
    @IsOptional()
    @IsString()
    image: string;

    /**
     * Date the dispenser was added
     */
    @Column({comment: "Date dispenser was added"})
    @IsDate()
    dateAdded: Date;

    /**
     * Phone number of the dispenser
     */
    @Column({})
    @IsString()
    phone: string;

    /**
     * Status of the dispenser (active or terminated)
     */
    @Column({default: Status.active})
    @IsEnum(Status)
    status: Status;

    /**
     * Sales associated with the dispenser
     */
    @OneToMany((type) => Sale, sale => sale.dispenser)
    @IsOptional()
    sales: Sale[];

    /**
     * Station to which the dispenser belongs
     */
    @ManyToOne((type) => Station, station => station.dispensers)
    @JoinColumn({name: 'station_id', referencedColumnName: "id"})
    @IsOptional()
    station: Station;

    @CreateDateColumn({default: Date.now()})
    createdAt: Date;

    @UpdateDateColumn()
    lastUpdated: Date;

}
