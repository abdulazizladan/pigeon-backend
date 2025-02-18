import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Info } from "./info.entity";
import { Role } from "../enums/role.enum";
import * as bcrypt from "bcrypt";
import { Contact } from "./contact.entity";
import { Station } from "src/station/entities/station.entity";

@Entity({name: "User"})
export class User {
    
    @PrimaryGeneratedColumn({})
    id:number;
     
    @Column({})
    email: string;

    @Column({default: "password"})
    password: string;

    @Column({})
    role: Role;

    @OneToOne((type) => Info, info => info.user)
    info: Info;

    @OneToOne((type) => Contact, contact => contact.user)
    contact: Contact;

    @OneToOne((type) => Station, station => station.manager)
    station: Station;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10); // 10 salt rounds 
    }
}


