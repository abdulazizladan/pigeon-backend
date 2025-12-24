import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/enums/role.enum';
// import { AuthGuard } from '@nestjs/passport'; // Uncomment these when guards are active
// import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Supply & Restock')
@ApiBearerAuth()
@Controller('supply')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) { }

  @Roles(Role.manager)
  @Post('request')
  @ApiOperation({ summary: 'Request fuel restock (Manager)' })
  create(@Body() createSupplyDto: CreateSupplyDto, @Req() req: any) {
    const userId = req.user?.id || '2960f22f-d123-4567-890a-123456789abc'; // Fallback for dev if auth off
    return this.supplyService.create(createSupplyDto, userId);
  }

  @Roles(Role.director)
  @Get()
  @ApiOperation({ summary: 'List all supply requests (Director)' })
  findAll() {
    return this.supplyService.findAll();
  }

  @Roles(Role.director, Role.manager)
  @Get('station/:stationId')
  @ApiOperation({ summary: 'List supply requests by station' })
  findAllByStation(@Param('stationId', ParseUUIDPipe) stationId: string) {
    return this.supplyService.findAllByStation(stationId);
  }

  @Roles(Role.director)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Approve/Reject/Deliver supply request (Director)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplyDto: UpdateSupplyDto,
    @Req() req: any
  ) {
    const approverId = req.user?.id || '2960f22f-d123-4567-890a-123456789abc'; // Fallback
    return this.supplyService.updateStatus(id, updateSupplyDto, approverId);
  }

  // --- Trends ---

  @Roles(Role.director)
  @Get('stats/trends')
  @ApiOperation({ summary: 'Get global refuel trends (last 30 days)' })
  getGlobalTrends() {
    return this.supplyService.getRefuelTrends(null, 30);
  }

  @Roles(Role.director, Role.manager)
  @Get('station/:stationId/stats/trends')
  @ApiOperation({ summary: 'Get station refuel trends (last 30 days)' })
  getStationTrends(@Param('stationId', ParseUUIDPipe) stationId: string) {
    return this.supplyService.getRefuelTrends(stationId, 30);
  }
}
