import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Status } from './enum/status.enum';

@Injectable()
export class TicketService {

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>
  ) {

  }

  async create(createTicketDto: CreateTicketDto) {
    const ticket = this.ticketRepository.create(createTicketDto);
    return await this.ticketRepository.save(ticket); 
  }

  async getStats() {
    const activeTickets = await this.ticketRepository.count({where: {status: Status.active}})
    const resolvedTickets = await this.ticketRepository.count({where: {status: Status.resolved}})
    const terminatedTickets = await this.ticketRepository.count({where: {status: Status.terminated}})
    const totalTickets = await this.ticketRepository.count()
    return {
      success: true,
      data: {
        total: totalTickets,
        active: activeTickets,
        resolved: resolvedTickets,
        dismissed: terminatedTickets
      },
      message: "Ticket stats"
    }
  }

  async addReply(ticketID: number, replyData: CreateReplyDto) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketID },
      relations: ['replies'], // Load existing replies to update the array
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
  
    const reply = this.replyRepository.create({
      ...replyData,
      ticket, // Set the ticket relation
    });
  
    await this.replyRepository.save(reply); // Save the reply
  
    // Optional: Update the ticket's replies array (for in-memory consistency)
    if (!ticket.replies) ticket.replies = [];
    ticket.replies.push(reply);
    await this.ticketRepository.save(ticket); // Save the updated ticket
  
    return reply;
  }

  async findAll() {
    const ticket = await this.ticketRepository.find()
    try {
      return {
        success: true,
        data: ticket,
        message: "Tickets fetched succesfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOne(
      {
        relations: [
          'replies',
          'sender'
        ], 
        where: {id}
      }
    )
    try {
      return {
        success: true,
        data: ticket,
        message: "Ticket fetched succesfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  update(id: number, updateTicketDto: UpdateTicketDto) {
    try {
      const ticket = this.ticketRepository.update({id}, updateTicketDto)
      return {
        success: true,
        data: ticket,
        message: "Ticket updated successfully"
      }
    }
    catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  /**
   * 
   * @param id 
   * @returns delete ticket status message
   */
  remove(id: number) {
    try {
      this.ticketRepository.delete(id)
      return {
        success: true,
        message: "Ticket deleted successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
