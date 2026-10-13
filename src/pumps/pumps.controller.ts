import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PumpsService } from './pumps.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { LogActivity } from '../activities/activity.decorator';

@ApiTags('Pumps')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Get('stations/:stationId/pumps')
  @ApiOperation({ summary: 'Pumps installed at a station' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findByStation(@Param('stationId') stationId: string) {
    return this.pumpsService.findByStation(stationId);
  }

  @Post('stations/:stationId/pumps')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'pump.created',
    describe: ({ result }) => `Added pump ${result.name} (${result.product})`,
    target: ({ result }) => ({ type: 'station', id: result.stationId, label: null }),
  })
  @ApiOperation({ summary: 'Add a pump to a station. Admin and Director only.' })
  @ApiResponse({ status: 409, description: 'Pump name already used at this station' })
  create(@Param('stationId') stationId: string, @Body() dto: CreatePumpDto) {
    return this.pumpsService.create(stationId, dto);
  }

  @Get('pumps/:id')
  @ApiOperation({ summary: 'Get a pump by id' })
  @ApiResponse({ status: 404, description: 'Pump not found' })
  findOne(@Param('id') id: string) {
    return this.pumpsService.findOne(id);
  }

  @Patch('pumps/:id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @LogActivity({
    action: 'pump.updated',
    describe: ({ result, body }) =>
      body.status !== undefined
        ? `${body.status === 'active' ? 'Put' : 'Took'} pump ${result.name} ${body.status === 'active' ? 'back in' : 'out of'} service`
        : `Updated pump ${result.name}`,
    target: ({ result }) => ({ type: 'station', id: result.stationId, label: null }),
    metadata: ({ body }) => body,
  })
  @ApiOperation({ summary: 'Rename a pump, change its product or take it out of service. Admin and Director only.' })
  update(@Param('id') id: string, @Body() dto: UpdatePumpDto) {
    return this.pumpsService.update(id, dto);
  }

  @Delete('pumps/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a pump. Admin only.',
    description: 'Permanent. Readings already recorded for the pump are kept. Returns the removed pump.',
  })
  @ApiResponse({ status: 200, description: 'Pump removed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Pump not found' })
  remove(@Param('id') id: string) {
    return this.pumpsService.remove(id);
  }
}
