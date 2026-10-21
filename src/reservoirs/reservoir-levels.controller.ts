import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReservoirLevelsService } from './reservoir-levels.service';
import { RecordLevelsDto } from './dto/record-levels.dto';
import { StationQueryDto } from '../sales/dto/station-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

type Req = { user: JwtPayload };

@ApiTags('Reservoir levels')
@ApiBearerAuth('JWT-auth')
@Controller('reservoir-levels')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservoirLevelsController {
  constructor(private readonly service: ReservoirLevelsService) {}

  @Get('summary')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({ summary: "Every station's current reservoir levels in one call, for the stations list. Admin and Director only." })
  getAllLevels() {
    return this.service.getAllLevels();
  }

  @Get()
  @ApiOperation({ summary: 'Current level of every reservoir at a station, with days of stock remaining. Managers get their own station.' })
  @ApiResponse({ status: 403, description: 'Manager is not assigned to a station' })
  getLevels(@Query() query: StationQueryDto, @Request() req: Req) {
    return this.service.getLevels(req.user, query.stationId);
  }

  @Post()
  @LogActivity({
    action: 'reservoir_levels.recorded',
    describe: ({ result, body }) =>
      `Recorded end-of-day reservoir levels for ${body.recordedOn ?? result.asOf} at ${result.station.name}: ` +
      result.reservoirs.filter((r: any) => r.level !== null).map((r: any) => `${r.product} ${r.percent}%`).join(', '),
    target: ({ result }) => ({ type: 'station', id: result.station.id, label: result.station.name }),
  })
  @ApiOperation({ summary: 'Record (or correct) the close-of-business level of each reservoir for a day' })
  @ApiResponse({ status: 400, description: 'Validation failed: lists every problem found' })
  record(@Body() dto: RecordLevelsDto, @Request() req: Req) {
    return this.service.record(dto, req.user);
  }
}
