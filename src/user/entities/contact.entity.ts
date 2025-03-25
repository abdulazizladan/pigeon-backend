import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";
import {} from "typeorm";

@Entity({name: "Contact"})
export class Contact {

    @Column({ primary: true, generated: true })
    id: number;

    @Column({})
    phone: string;

    @JoinColumn({name: "user_email", referencedColumnName: "email"})
    @OneToOne((type) => User, user => user.contact, {cascade: true, onDelete: 'CASCADE'})
    user: User;
}