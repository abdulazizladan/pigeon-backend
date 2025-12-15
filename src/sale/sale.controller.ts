// src/sale/sale.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Req,
  UnauthorizedException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SaleService } from './sale.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { Sale } from './entities/sale.entity';
import { Product } from './enum/product.enum';

@ApiTags('Sales Management')
//@ApiBearerAuth()
@Controller('sales')
//@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SaleController {
  constructor(private readonly saleService: SaleService) { }

  // --- CRUD Endpoints ---

  @Roles(Role.manager)
  @ApiOperation({ summary: 'Create a new sale', description: 'Records a new fuel sale transaction. The authenticated user will be recorded as the user who created the sale.' })
  @ApiCreatedResponse({ description: 'Sale created successfully.', type: Sale })
  @ApiBadRequestResponse({ description: 'Invalid input data or pump not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: CreateSaleDto,
    examples: {
      default: {
        summary: 'Sample create sale payload',
        value: {
          product: Product.PETROL,
          pricePerLitre: 680.75,
          openingMeterReading: 1000.0,
          closingMeterReading: 1200.0,
          pumpId: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        } as CreateSaleDto,
      },
    },
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSaleDto, @Req() req: any) {
    // req.user is set by the AuthGuard (JwtStrategy) and contains { id, email, role }
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User ID not found in request. Ensure authentication is enabled.');
    }
    return this.saleService.create(dto, userId);
  }

  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get all sales', description: 'Retrieve a list of all sales records.' })
  @ApiOkResponse({ description: 'All sales retrieved successfully.', type: [Sale] })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.saleService.findAll(page, limit);
  }

  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get a sale by ID', description: 'Retrieve a specific sale record by its UUID.' })
  @ApiOkResponse({ description: 'Sale retrieved successfully.', type: Sale })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'UUID of the sale record.' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.saleService.findOne(id);
  }

  @Roles(Role.manager)
  @ApiOperation({ summary: 'Update a sale', description: 'Update a specific sale record by its ID. Triggers total price recalculation.' })
  @ApiOkResponse({ description: 'Sale updated successfully.', type: Sale })
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: UpdateSaleDto,
    examples: {
      default: {
        summary: 'Sample update sale payload (Updates trigger total price recalculation)',
        value: {
          pricePerLitre: 700.0,
          closingMeterReading: 1250.0,
        } as UpdateSaleDto,
      },
    },
  })
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.saleService.update(id, updateSaleDto);
  }

  @Roles(Role.manager)
  @ApiOperation({ summary: 'Delete a sale', description: 'Deletes a sale record by its ID.' })
  @ApiResponse({ status: 204, description: 'Sale deleted successfully (No Content).' }) // Updated response description
  @ApiNotFoundResponse({ description: 'Sale not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Use 204 No Content for successful deletion
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.saleService.remove(id);
  }

  // --- New Reporting Endpoints ---
  /**
   * 💰 Calculates the total monetary sales from all records.
   * Accessible by director and manager.
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get total sales revenue', description: 'Calculates the total monetary sales across all stations.' })
  @ApiOkResponse({
    description: 'Total sales revenue retrieved.',
    schema: { properties: { totalSale: { type: 'number', example: 1254300.50 } } },
  })
  @Get('report/total')
  async getTotalSale(): Promise<{ totalSale: number }> {
    const totalSale = await this.saleService.getTotalSale();
    return { totalSale };
  }

  /**
   * 🗺️ Calculates the total monetary sales for a specific station.
   * Accessible by director and manager.
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get total sales revenue by Station ID', description: 'Calculates the total monetary sales for a specific fueling station.' })
  @ApiOkResponse({
    description: 'Total sales revenue for the station retrieved.',
    schema: { properties: { totalSale: { type: 'number', example: 500000.75 } } },
  })
  @ApiParam({ name: 'stationId', format: 'uuid', description: 'UUID of the station.' })
  @Get('report/station/:stationId/total')
  async getTotalSalesByStationId(@Param('stationId', ParseUUIDPipe) stationId: string): Promise<{ totalSale: number }> {
    const totalSale = await this.saleService.getTotalSalesByStationId(stationId);
    return { totalSale };
  }

  /**
   * 📅 Calculates the total sales grouped by the week of the year.
   * Accessible by director and manager.
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get total sales grouped by week', description: 'Calculates sales revenue aggregated by week of the year.' })
  @ApiOkResponse({
    description: 'Weekly sales data retrieved.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: { week: { type: 'number', example: 45 }, totalSale: { type: 'number', example: 150000.00 } },
      },
    },
  })
  @Get('report/weekly')
  getTotalSalesPerWeek() {
    return this.saleService.getTotalSalesPerWeek();
  }

  /**
   * 🗓️ Calculates the total sales grouped by the month of the year.
   * Accessible by director and manager.
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get total sales grouped by month', description: 'Calculates sales revenue aggregated by month of the year.' })
  @ApiOkResponse({
    description: 'Monthly sales data retrieved.',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: { month: { type: 'string', example: '2024-11' }, totalSale: { type: 'number', example: 480000.00 } },
      },
    },
  })
  @Get('report/monthly')
  getTotalSalesPerMonth() {
    return this.saleService.getTotalSalesPerMonth();
  }

  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: 'Get daily sales records per station', description: 'Get aggregated daily sales records for a station.' })
  @ApiOkResponse({
    description: 'Daily sales records retrieved.',
  })
  @Get('report/daily/station/:stationId')
  async getDailySalesByStation(
    @Param('stationId', ParseUUIDPipe) stationId: string
  ) {
    return this.saleService.getDailySalesByStation(stationId);
  }

  @ApiOperation({ summary: 'Get sales record by station' })
  @Get('/station/:id')
  getSalesByStation(@Param('id') id: string) {
    return this.saleService.findAllByStationID(id);
  }
}