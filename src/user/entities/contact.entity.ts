import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { IsString, IsNumber } from "class-validator";

/**
 * Contact entity representing user's contact information.
 */
@Entity({name: "Contact"})
export class Contact {
    /**
     * Unique identifier for the contact (Primary Key)
     */
    @Column({ primary: true, generated: true })
    @IsNumber()
    id: number;

    /**
     * Phone number of the user
     */
    @Column({})
    @IsString()
    phone: string;

    /**
     * Associated user for this contact (One-to-One relationship)
     */
    @JoinColumn({name: "user_email", referencedColumnName: "email"})
    @OneToOne((type) => User, user => user.contact, {cascade: true, onDelete: 'CASCADE'})
    user: User;
}