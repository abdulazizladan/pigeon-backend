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
  ) {}

  /**
   * Creates a new ticket in the database.
   * @param createTicketDto - DTO containing ticket details
   * @returns The created ticket entity
   */
  async create(createTicketDto: CreateTicketDto) {
    const ticket = this.ticketRepository.create(createTicketDto);
    return await this.ticketRepository.save(ticket); 
  }

  /**
   * Retrieves statistics about tickets (total, active, resolved, dismissed).
   * @returns An object containing ticket stats and a message
   */
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

  /**
   * Adds a reply to a specific ticket.
   * @param ticketID - The ID of the ticket to reply to
   * @param replyData - DTO containing reply details
   * @returns The created reply entity
   * @throws NotFoundException if the ticket does not exist
   */
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

  /**
   * Retrieves all tickets, including their sender relation.
   * @returns An object with all tickets and a message
   */
  async findAll() {
    const ticket = await this.ticketRepository.find({
      relations: [
        'sender'
      ]
    })
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

  /**
   * Retrieves a single ticket by its ID, including replies and sender.
   * @param id - The ID of the ticket
   * @returns An object with the ticket and a message
   */
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

  /**
   * Finds all tickets sent by a user with the given email.
   * @param email - The email of the sender
   * @returns An array of tickets sent by the user
   */
  findByEmail(email: string) {
    return this.ticketRepository.find({
      where: {"sender": {email}},
      relations: [
        'sender'
      ]
    })
  }

  /**
   * Updates a ticket by its ID.
   * @param id - The ID of the ticket
   * @param updateTicketDto - DTO containing updated ticket data
   * @returns An object with the update result and a message
   */
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
   * Deletes a ticket by its ID.
   * @param id - The ID of the ticket
   * @returns An object with the deletion status and a message
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
