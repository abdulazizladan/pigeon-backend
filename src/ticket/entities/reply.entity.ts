import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ticket } from "./ticket.entity";
import { User } from "src/user/entities/user.entity";
import { Status } from "../enum/status.enum";

@Entity({ name: "Reply" })
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, ticket => ticket.replies)
  @JoinColumn({ name: 'ticket_id' }) // Optional: Only if you want custom column name
  ticket: Ticket;

  @Column({ nullable: false })
  message: string;

  @ManyToOne(() => User, user => user.replies, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({
    type: 'simple-enum',
    enum: Status,
    default: Status.active
  })
  status: Status;

  @CreateDateColumn({ precision: 6 })
  date: Date;

}