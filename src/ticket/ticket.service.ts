import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reply } from './entities/reply.entity';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Status } from './enum/status.enum';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class TicketService {


  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,

    @InjectRepository(Reply)
    private readonly replyRepository: Repository<Reply>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  /**
   * Creates a new ticket in the database.
   * @param createTicketDto - DTO containing ticket details
   * @returns The created ticket entity
   */
  async create(createTicketDto: CreateTicketDto) {
    const user = await this.userRepository.findOne({ where: { email: createTicketDto.email } });
    if (!user) {
      throw new NotFoundException(`User with email ${createTicketDto.email} not found`);
    }

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      sender: user
    });
    return await this.ticketRepository.save(ticket);
  }

  /**
   * Retrieves statistics about tickets (total, active, resolved, dismissed).
   * @returns An object containing ticket stats and a message
   */
  async getStats() {
    const activeTickets = await this.ticketRepository.count({ where: { status: Status.active } })
    const resolvedTickets = await this.ticketRepository.count({ where: { status: Status.resolved } })
    const terminatedTickets = await this.ticketRepository.count({ where: { status: Status.terminated } })
    const totalTickets = await this.ticketRepository.count()
    return {
      total: totalTickets,
      active: activeTickets,
      resolved: resolvedTickets,
      dismissed: terminatedTickets
    }
  }

  /**
   * Adds a reply to a specific ticket.
   * @param ticketID - The ID of the ticket to reply to
   * @param replyData - DTO containing reply details
   * @param user - The user creating the reply
   * @returns The created reply entity
   * @throws NotFoundException if the ticket does not exist
   */
  async addReply(ticketID: string, replyData: CreateReplyDto, user: User) {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketID },
      relations: ['replies'], // Load existing replies to update the array
    });
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Prevent replying to resolved tickets
    if (ticket.status === Status.resolved) {
      throw new BadRequestException('Cannot reply to a resolved ticket');
    }

    const reply = this.replyRepository.create({
      ...replyData,
      ticket, // Set the ticket relation
      sender: user,
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
      return ticket;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Retrieves a single ticket by its ID, including replies and sender.
   * @param id - The ID of the ticket
   * @returns An object with the ticket and a message
   */
  async findOne(id: string) {
    const ticket = await this.ticketRepository.findOne(
      {
        relations: [
          'replies',
          'sender'
        ],
        where: { id }
      }
    )
    try {
      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      return ticket;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Finds all tickets sent by a user with the given email.
   * @param email - The email of the sender
   * @returns An array of tickets sent by the user
   */
  findByEmail(email: string) {
    return this.ticketRepository.find({
      where: { "sender": { email } },
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
  async update(id: string, updateTicketDto: UpdateTicketDto) {
    try {
      const result = await this.ticketRepository.update({ id }, updateTicketDto);
      if (result.affected === 0) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }
      return this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Deletes a ticket by its ID.
   * @param id - The ID of the ticket
   * @returns An object with the deletion status and a message
   */
  async remove(id: number) {
    try {
      const result = await this.ticketRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }
      return {
        success: true,
        message: "Ticket deleted successfully"
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
