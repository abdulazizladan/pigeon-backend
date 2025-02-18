import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity({name: "Info"})
export class Info {
    
    @Column({ primary: true, generated: true })
    id: number;
    
    @Column({})
    firstName: string;

    @Column({})
    lastName: string;

    @Column({})
    image: string;

    @JoinColumn({name: 'user_email', referencedColumnName: "email"})
    @OneToOne((type) => User, user => user.info)
    user: User;
}