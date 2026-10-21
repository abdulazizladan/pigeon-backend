import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RepairRequestsService } from './repair-requests.service';
import { CreateRepairRequestDto, DecideRepairRequestDto, RepairRequestsQueryDto } from './dto/repair-request.dto';
import { StationQueryDto } from '../sales/dto/station-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

type Req = { user: JwtPayload };

@ApiTags('Repair requests')
@ApiBearerAuth('JWT-auth')
@Controller('repair-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RepairRequestsController {
  constructor(private readonly service: RepairRequestsService) {}

  @Get()
  @ApiOperation({ summary: 'Repair requests, newest first. Managers get their own station; filter by status and priority.' })
  findAll(@Query() query: RepairRequestsQueryDto, @Request() req: Req) {
    return this.service.findAll(query, req.user);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Counts by status, and pending requests by priority' })
  getStats(@Query() query: StationQueryDto, @Request() req: Req) {
    return this.service.getStats(req.user, query.stationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: Req) {
    return this.service.findOne(id, req.user);
  }

  @Post()
  @LogActivity({
    action: 'repair_request.created',
    describe: ({ result }) => `Reported "${result.facility}" at ${result.stationName} for repair (${result.priority} priority)`,
    target: ({ result }) => ({ type: 'repair_request', id: result.id, label: result.facility }),
  })
  @ApiOperation({ summary: 'Report a faulty facility and request authorization to repair it' })
  @ApiResponse({ status: 201, description: 'Request created, pending a decision' })
  create(@Body() dto: CreateRepairRequestDto, @Request() req: Req) {
    return this.service.create(dto, req.user);
  }

  @Patch(':id/decision')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'repair_request.decided',
    describe: ({ result }) => `${result.status.charAt(0).toUpperCase() + result.status.slice(1)} the repair of "${result.facility}" at ${result.stationName}`,
    target: ({ result }) => ({ type: 'repair_request', id: result.id, label: result.facility }),
    metadata: ({ body }) => body,
  })
  @ApiOperation({ summary: 'Authorize, deny or ignore a repair request. Director and Admin only.' })
  @ApiResponse({ status: 400, description: 'Request already authorized or denied' })
  decide(@Param('id') id: string, @Body() dto: DecideRepairRequestDto, @Request() req: Req) {
    return this.service.decide(id, dto, req.user);
  }
}
