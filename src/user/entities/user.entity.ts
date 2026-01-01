import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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
import { IsEmail, IsEnum, IsString, IsOptional, IsDate, IsArray, IsNumber } from "class-validator";
import { Sale } from "src/sale/entities/sale.entity";

@Entity({ name: "User" })
export class User {
    /**
     * Unique identifier for the user (Primary Key)
     */
    @PrimaryGeneratedColumn('uuid')
    @IsString()
    id: string;

    /**
     * Unique email address of the user
     */
    @Column({ unique: true })
    @IsEmail()
    email: string;

    /**
     * Hashed password for the user (excluded from serialization)
     */
    @Exclude()
    @Column({ default: "password" })
    @IsString()
    password: string;

    /**
     * Role of the user (admin, director, manager)
     */
    @Column({ default: Role.manager })
    @IsEnum(Role)
    role: Role;

    /**
     * Status of the user (active, inactive, etc.)
     */
    @Column({ default: Status.active })
    @IsEnum(Status)
    status: Status;

    /**
     * Date when the user was created
     */
    @CreateDateColumn({ precision: 6 })
    @IsDate()
    createdAt: Date;

    /**
     * One-to-one relation to Info entity (user's personal info)
     */
    @OneToOne((type) => Info, info => info.user, { cascade: true })
    @IsOptional()
    info: Info;

    /**
     * One-to-one relation to Contact entity (user's contact info)
     */
    @OneToOne((type) => Contact, contact => contact.user, { cascade: true })
    @IsOptional()
    contact: Contact;

    /**
     * One-to-one relation to Station entity (if user is a manager)
     */
    @OneToOne((type) => Station, station => station.manager, { nullable: true, cascade: true })
    @IsOptional()
    station: Station;

    /**
     * One-to-many relation to Ticket entity (tickets sent by user)
     */
    @OneToMany((type) => Ticket, ticket => ticket.sender)
    @IsArray()
    @IsOptional()
    tickets: Ticket[];

    /**
     * One-to-many relation to Reply entity (replies sent by user)
     */
    @OneToMany((type) => Reply, reply => reply.sender)
    @IsArray()
    @IsOptional()
    replies: Reply[];

    /**
     * One-to-many relation to MonthlyReport entity (reports created by user)
     */
    @OneToMany((type) => MonthlyReport, report => report.createdBy, { nullable: true, cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @IsArray()
    @IsOptional()
    reports: MonthlyReport[];

    /**
     * Validates a plain password against the user's hashed password
     * @param password Plain password to validate
     * @returns Promise<boolean> indicating if password is valid
     */
    async validatePassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    /**
     * Hashes a plain password using bcrypt
     * @param password Plain password to hash
     * @returns Promise<string> hashed password
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10); // 10 salt rounds 
    }

    @OneToMany((type) => Sale, sale => sale.recordedBy)
    sales: Sale[];

    @UpdateDateColumn()
    lastUpdated: Date;
}


