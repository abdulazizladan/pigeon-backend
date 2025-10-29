import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { CreateReplyDto } from './dto/create-reply.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/user/enums/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Ticket')
@ApiBearerAuth()
@Controller('ticket')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  /**
   * Create a new ticket.
   * Accessible by director and manager.
   * @access director, manager
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({summary: "Create ticket"})
  @ApiOkResponse({ description: 'Ticket created successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  /**
   * Get ticket stats.
   * Accessible by admin only.
   * @access admin
   */
  @Roles(Role.admin)
  @ApiOperation({summary: "Get tickets stats"})
  @ApiOkResponse({ description: 'Ticket stats retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin role allowed.' })
  @Get("stats")
  getStats() {
    return this.ticketService.getStats()
  }

  /**
   * Add reply to a ticket.
   * Accessible by admin, director, and manager.
   * @access admin, director, manager
   */
  @Roles(Role.admin, Role.director, Role.manager)
  @ApiOperation({summary: "Add reply to ticket"})
  @ApiOkResponse({ description: 'Reply added successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin, director, and manager roles allowed.' })
  @Post(':ticketID/reply')
  async addReply(@Param('ticketID') ticketID: string,
  @Body() createReplyDto: CreateReplyDto) {
    try {
      const reply = await this.ticketService.addReply(ticketID, createReplyDto);
      return {
        success: true,
        data: reply,
        message: 'Reply added successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get all tickets.
   * Accessible by admin only.
   * @access admin
   */
  @ApiOperation({summary: "Get all tickets"})
  @ApiOkResponse({ description: 'All tickets retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin role allowed.' })
  @Get()
  @Roles(Role.admin)
  findAll() {
    return this.ticketService.findAll();
  }

  /**
   * Get tickets by email.
   * Accessible by director and manager.
   * @access director, manager
   * @param email - The email to search tickets for
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({summary: "Get ticket by email"})
  @ApiOkResponse({ description: 'Tickets retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Roles( Role.director, Role.manager)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.ticketService.findByEmail(email);
  }

  /**
   * Get a ticket by ID.
   * Accessible by admin, director, and manager.
   * @access admin, director, manager
   * @param id - The ID of the ticket
   */
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({summary: "Get ticket by ID"})
  @ApiOkResponse({ description: 'Ticket retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin, director, and manager roles allowed.' })
  @Roles(Role.admin, Role.director, Role.manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  /**
   * Update a ticket by ID.
   * Accessible by admin only.
   * @access admin
   * @param id - The ID of the ticket
   * @param updateTicketDto - DTO containing updated ticket data
   */
  @ApiOperation({summary: "Update"})
  @ApiOkResponse({ description: 'Ticket updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin role allowed.' })
  @Patch(':id')
  @Roles(Role.admin)
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(id, updateTicketDto);
  }

  /**
   * Remove a ticket by ID.
   * Accessible by admin only.
   * @access admin
   * @param id - The ID of the ticket
   */
  @ApiOperation({summary: "Remove ticket"})
  @ApiOkResponse({ 
    description: 'Ticket deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Ticket deleted successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin role allowed.' })
  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
