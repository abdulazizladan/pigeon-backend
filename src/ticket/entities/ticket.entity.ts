import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { Reply } from "./reply.entity";
import { User } from "src/user/entities/user.entity";

@Entity({ name: 'Ticket' })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  dateCreated: Date;

  @Column({ default: Status.active })
  status: Status;

  @OneToMany(() => Reply, reply => reply.ticket)
  replies: Reply[];

  @ManyToOne((type) => User, user => user.tickets, {nullable: true})
  @JoinColumn({name: "user_id", referencedColumnName: "id"})
  sender: User;
}