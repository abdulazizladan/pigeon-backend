import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Ticket } from "./ticket.entity";
import { User } from "src/user/entities/user.entity";

@Entity({ name: "Reply" })
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, ticket => ticket.replies)
  @JoinColumn({ name: 'ticket_id' }) // Optional: Only if you want custom column name
  ticket: Ticket;

  @Column({ nullable: false })
  message: string;

  //@Column({nullable: true})
  //sender: User;

  @CreateDateColumn({default: Date.now()})
  date: Date;

}