import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthChecksService } from './health-checks.service';
import { CreateHealthCheckDto, HealthChecksQueryDto, UpdateHealthCheckDto } from './dto/health-check.dto';
import { StationQueryDto } from '../sales/dto/station-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

type Req = { user: JwtPayload };

@ApiTags('Station health')
@ApiBearerAuth('JWT-auth')
@Controller('health-checks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HealthChecksController {
  constructor(private readonly service: HealthChecksService) {}

  @Get()
  @ApiOperation({ summary: 'Health checks in a date range, newest first. Managers get their own station.' })
  findAll(@Query() query: HealthChecksQueryDto, @Request() req: Req) {
    return this.service.findAll(query, req.user);
  }

  @Get('template')
  @ApiOperation({ summary: "Blank check for today: every pump with its last recorded condition" })
  @ApiResponse({ status: 403, description: 'Manager is not assigned to a station' })
  getTemplate(@Query() query: StationQueryDto, @Request() req: Req) {
    return this.service.getTemplate(req.user, query.stationId);
  }

  @Get('latest')
  @ApiOperation({ summary: 'The most recent health check for a station, or an empty body' })
  findLatest(@Query() query: StationQueryDto, @Request() req: Req) {
    return this.service.findLatest(req.user, query.stationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: Req) {
    return this.service.findOne(id, req.user);
  }

  @Post()
  @LogActivity({
    action: 'health_check.recorded',
    describe: ({ result }) => `Recorded a health check for ${result.recordedOn}: station ${result.stationCondition}, ${result.faultyPumps} pump(s) not OK`,
    target: ({ result }) => ({ type: 'station', id: result.stationId, label: null }),
  })
  @ApiOperation({ summary: 'Record the station condition and every pump condition for a day' })
  @ApiResponse({ status: 400, description: 'Validation failed: lists every problem found' })
  @ApiResponse({ status: 409, description: 'The station already has a check for that day' })
  create(@Body() dto: CreateHealthCheckDto, @Request() req: Req) {
    return this.service.create(dto, req.user);
  }

  @Put(':id')
  @LogActivity({
    action: 'health_check.updated',
    describe: ({ result }) => `Updated the health check for ${result.recordedOn}: station ${result.stationCondition}, ${result.faultyPumps} pump(s) not OK`,
    target: ({ result }) => ({ type: 'station', id: result.stationId, label: null }),
  })
  @ApiOperation({ summary: 'Replace the conditions on an existing health check' })
  update(@Param('id') id: string, @Body() dto: UpdateHealthCheckDto, @Request() req: Req) {
    return this.service.update(id, dto, req.user);
  }
}
