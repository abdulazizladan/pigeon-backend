import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List all support tickets, newest first' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Ticket counts by status and priority' })
  getStats() {
    return this.ticketsService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by id' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() dto: CreateTicketDto, @Request() req: { user: JwtPayload }) {
    return this.ticketsService.create(dto, req.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({ summary: 'Update status, priority or assignee. Admin and Director only.' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ticket or assignee not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }
}
