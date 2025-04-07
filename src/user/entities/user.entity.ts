import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Info } from "./info.entity";
import { Role } from "../enums/role.enum";
import * as bcrypt from "bcrypt";
import { Contact } from "./contact.entity";
import { Station } from "src/station/entities/station.entity";
import { MonthlyReport } from "src/report/entities/report.entity";
import { Status } from "../enums/status.enum";
import { Ticket } from "src/ticket/entities/ticket.entity";
import { Exclude } from "class-transformer";
import { Reply } from "src/ticket/entities/reply.entity";

@Entity({name: "User"})
export class User {
    
    @PrimaryGeneratedColumn({})
    id:number;
     
    @Column({unique: true})
    email: string;

    @Exclude()
    @Column({default: "password"})
    password: string;

    @Column({type: 'text', enum: Role, default: Role.manager})
    role: Role;

    @Column({default: Status.active})
    status: Status;

    @CreateDateColumn({default: Date.now()})
    createdAt: Date;

    @OneToOne((type) => Info, info => info.user) 
    info: Info;

    @OneToOne((type) => Contact, contact => contact.user)
    contact: Contact;

    @OneToOne((type) => Station, station => station.manager, {nullable: true})
    station: Station;

    @OneToMany((type) => Ticket, ticket => ticket.sender)
    tickets: Ticket[];

    ticketReply: Reply;

    @OneToMany((type) => MonthlyReport, report => report.createdBy, {nullable: true, cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'})
    reports: MonthlyReport[];

    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10); // 10 salt rounds 
    }
}


