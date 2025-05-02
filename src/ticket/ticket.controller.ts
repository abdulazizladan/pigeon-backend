import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Roles(Role.director, Role.manager)
  @ApiOperation({summary: "Create ticket"})
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @Roles(Role.admin)
  @ApiOperation({summary: "Get tickets stats"})
  @Get("stats")
  getStats() {
    return this.ticketService.getStats()
  }

  @Roles(Role.admin, Role.director, Role.manager)
  @ApiOperation({summary: "Add reply to ticket"})
  @Post(':ticketID/reply')
  async addReply(@Param('ticketID') ticketID: number,
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


  @ApiOperation({summary: "Get all tickets"})
  @Get()
  @Roles(Role.admin)
  findAll() {
    return this.ticketService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({summary: "Get ticket by email"})
  @Roles( Role.director, Role.manager)
  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.ticketService.findByEmail(email);
  }
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({summary: "Get ticket by ID"})
  @Roles(Role.admin, Role.director, Role.manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(+id);
  }

  @ApiOperation({summary: "Update"})
  @Patch(':id')
  @Roles(Role.admin)
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(+id, updateTicketDto);
  }

  /**@ApiOperation({summary: "Remove ticket"})
  @Delete(':id')
  @Roles(Role.admin)
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }**/
}
