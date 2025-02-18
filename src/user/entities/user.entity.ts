import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { Info } from "./info.entity";
import { Role } from "../enums/role.enum";
import * as bcrypt from "bcrypt";
import { Contact } from "./contact.entity";

@Entity({name: "User"})
export class User {
    
    @PrimaryColumn({})
    email: string;

    @Column({default: "password"})
    password: string;

    @Column({})
    role: Role;

    @OneToOne((type) => Info, info => info.user)
    info: Info;

    @OneToOne((type) => Contact, contact => contact.user)
    contact: Contact;

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10); // 10 salt rounds
    }
}


