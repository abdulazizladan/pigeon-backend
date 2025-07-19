import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import { IsString, IsOptional, IsNumber } from "class-validator";

@Entity({name: "Info"})
export class Info {
    /**
     * Unique identifier for the info record (Primary Key)
     */
    @Column({ primary: true, generated: true })
    @IsNumber()
    id: number;
    
    /**
     * First name of the user
     */
    @Column({})
    @IsString()
    firstName: string;

    /**
     * Last name of the user
     */
    @Column({})
    @IsString()
    lastName: string;

    /**
     * URL or path to the user's profile image (optional)
     */
    @Column({nullable: true})
    @IsOptional()
    @IsString()
    image: string;

    /**
     * The user associated with this info record
     */
    @JoinColumn({name: 'user_email', referencedColumnName: "email"})
    @OneToOne((type) => User, user => user.info, { cascade: true, onDelete: 'CASCADE'})
    user: User;
}