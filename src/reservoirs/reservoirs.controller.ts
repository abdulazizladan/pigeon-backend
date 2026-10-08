import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReservoirsService } from './reservoirs.service';
import { CreateReservoirDto } from './dto/create-reservoir.dto';
import { UpdateReservoirDto } from './dto/update-reservoir.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

@ApiTags('Reservoirs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ReservoirsController {
  constructor(private readonly reservoirsService: ReservoirsService) {}

  @Get('stations/:stationId/reservoirs')
  @ApiOperation({ summary: 'Storage tanks at a station, one per product' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findByStation(@Param('stationId') stationId: string) {
    return this.reservoirsService.findByStation(stationId);
  }

  @Post('stations/:stationId/reservoirs')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({ summary: 'Add a reservoir for a product the station does not have a tank for yet. Admin and Director only.' })
  @ApiResponse({ status: 409, description: 'Station already has a reservoir for that product' })
  create(@Param('stationId') stationId: string, @Body() dto: CreateReservoirDto) {
    return this.reservoirsService.create(stationId, dto);
  }

  @Get('reservoirs/:id')
  @ApiOperation({ summary: 'Get a reservoir by id' })
  @ApiResponse({ status: 404, description: 'Reservoir not found' })
  findOne(@Param('id') id: string) {
    return this.reservoirsService.findOne(id);
  }

  @Patch('reservoirs/:id')
  @Roles(Role.ADMIN, Role.DIRECTOR)
  @ApiOperation({ summary: 'Change a reservoir capacity. Admin and Director only.' })
  update(@Param('id') id: string, @Body() dto: UpdateReservoirDto) {
    return this.reservoirsService.update(id, dto);
  }
}
