import { Body, Controller, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateDailyRecordDto } from './dto/create-daily-record.dto';
import { UpdateDailyRecordDto } from './dto/update-daily-record.dto';
import { DailyRecordsQueryDto } from './dto/daily-records-query.dto';
import { SalesSummaryQueryDto } from './dto/sales-summary-query.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

type Req = { user: JwtPayload };

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Daily ₦ and litre totals from pump meters for a date range',
    description: 'Managers always get their own station. Directors and admins get every station unless stationId is given.',
  })
  @ApiResponse({ status: 400, description: 'Invalid range' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  getSummary(@Query() query: SalesSummaryQueryDto, @Request() req: Req) {
    return this.salesService.getSummary(query, req.user);
  }

  @Get('daily')
  @ApiOperation({
    summary: 'Daily records in a date range, each with expected (reservoir) vs actual (pump meter) sales per pump',
  })
  findAll(@Query() query: DailyRecordsQueryDto, @Request() req: Req) {
    return this.salesService.findAll(query, req.user);
  }

  @Get('daily/template')
  @ApiOperation({
    summary: 'Blank form for today: every active pump and reservoir with opening values carried over from the last record',
  })
  @ApiResponse({ status: 403, description: 'Manager is not assigned to a station' })
  getTemplate(@Query() query: StationQueryDto, @Request() req: Req) {
    return this.salesService.getTemplate(req.user, query.stationId);
  }

  @Get('daily/:id')
  @ApiOperation({ summary: 'One daily record with its expected vs actual breakdown' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOne(@Param('id') id: string, @Request() req: Req) {
    return this.salesService.findOne(id, req.user);
  }

  @Post('daily')
  @LogActivity({
    action: 'daily_record.created',
    describe: ({ result }) =>
      `Recorded daily sales for ${result.recordedOn}: ₦${result.totals.actualAmount} actual vs ₦${result.totals.expectedAmount} expected`,
    target: ({ result }) => ({ type: 'daily_record', id: result.id, label: result.recordedOn }),
    metadata: ({ result }) => ({ stationId: result.stationId, ...result.totals }),
  })
  @ApiOperation({
    summary: 'Record a trading day: opening/closing meter for every active pump and dip levels for every reservoir',
    description: 'Managers record their own station. Prices in force at submission time are snapshotted onto the readings.',
  })
  @ApiResponse({ status: 201, description: 'Record created; returns the expected vs actual report' })
  @ApiResponse({ status: 400, description: 'Validation failed: lists every problem found' })
  @ApiResponse({ status: 409, description: 'The station already has a record for that day' })
  create(@Body() dto: CreateDailyRecordDto, @Request() req: Req) {
    return this.salesService.create(dto, req.user);
  }

  @Put('daily/:id')
  @LogActivity({
    action: 'daily_record.updated',
    describe: ({ result }) =>
      `Updated daily sales for ${result.recordedOn}: ₦${result.totals.actualAmount} actual vs ₦${result.totals.expectedAmount} expected`,
    target: ({ result }) => ({ type: 'daily_record', id: result.id, label: result.recordedOn }),
    metadata: ({ result }) => ({ stationId: result.stationId, ...result.totals }),
  })
  @ApiOperation({ summary: 'Replace every reading on an existing daily record' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  update(@Param('id') id: string, @Body() dto: UpdateDailyRecordDto, @Request() req: Req) {
    return this.salesService.update(id, dto, req.user);
  }
}
