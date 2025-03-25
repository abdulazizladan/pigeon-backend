import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiOperation } from '@nestjs/swagger';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('ticket')
//@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({summary: "Create ticket"})
  @Post()
  create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketService.create(createTicketDto);
  }

  @ApiOperation({summary: "Get tickets stats"})
  @Get("stats")
  getStats() {
    return this.ticketService.getStats()
  }

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
  //@Roles()
  findAll() {
    return this.ticketService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({summary: "Get ticket by ID"})
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketService.findOne(+id);
  }

  @ApiOperation({summary: "Update"})
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
    return this.ticketService.update(+id, updateTicketDto);
  }

  @ApiOperation({summary: "Remove ticket"})
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
