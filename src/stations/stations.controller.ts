import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { NIGERIAN_STATES } from '../common/nigeria';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

@ApiTags('Stations')
@ApiBearerAuth('JWT-auth')
@Controller('stations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all stations' })
  findAll() {
    return this.stationsService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Station counts by status and manager assignment summary' })
  getStats() {
    return this.stationsService.getStats();
  }

  @Get('mine')
  @ApiOperation({ summary: "The station assigned to the current user, or null if they don't run one" })
  @ApiResponse({ status: 200, description: 'Station, or an empty body when unassigned' })
  getMine(@Request() req: { user: JwtPayload }) {
    return this.stationsService.findByManager(req.user.sub);
  }

  @Get('states')
  @ApiOperation({ summary: 'Nigerian states accepted in the state field' })
  getStates() {
    return NIGERIAN_STATES;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a station by id' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findOne(@Param('id') id: string) {
    return this.stationsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'station.created',
    describe: ({ result }) =>
      `Created station ${result.name} (${result.code})` + (result.managerUsername ? ` and assigned @${result.managerUsername}` : ''),
    target: ({ result }) => ({ type: 'station', id: result.id, label: result.name }),
  })
  @ApiOperation({ summary: 'Create a station, optionally assigning a manager. Admin and Director only.' })
  @ApiResponse({ status: 400, description: 'Validation failed or manager not assignable' })
  @ApiResponse({ status: 409, description: 'Station code already exists or manager already assigned' })
  create(@Body() dto: CreateStationDto) {
    return this.stationsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'station.updated',
    describe: ({ result, body }) => {
      const parts: string[] = [];
      if ('managerId' in body) {
        parts.push(
          body.managerId === null
            ? `Unassigned the manager from ${result.name}`
            : `Assigned @${result.managerUsername} to ${result.name}`,
        );
      }
      if (body.status !== undefined) parts.push(`Set ${result.name} status to ${body.status}`);
      const detailKeys = ['name', 'description', 'address', 'lga', 'state'].filter((k) => body[k] !== undefined);
      if (detailKeys.length) parts.push(`Updated ${result.name} (${detailKeys.join(', ')})`);
      return parts.join('; ') || `Updated station ${result.name}`;
    },
    target: ({ result }) => ({ type: 'station', id: result.id, label: result.name }),
    metadata: ({ body }) => body,
  })
  @ApiOperation({ summary: 'Update station details, status or assigned manager. Admin and Director only.' })
  update(@Param('id') id: string, @Body() dto: UpdateStationDto) {
    return this.stationsService.update(id, dto);
  }
}
