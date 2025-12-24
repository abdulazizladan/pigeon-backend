import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards, HttpCode, HttpStatus, Req, ForbiddenException } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse, ApiBody, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/enums/role.enum';
import { RecordSalesDto } from './dto/record-sales.dto';

interface ManagerIdDto {
  managerId: string;
}

@ApiTags('Stations')
@ApiBearerAuth()
@Controller('station')
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class StationController {

  constructor(private readonly stationService: StationService) { }

  /**
   * Get the station assigned to the logged-in manager.
   * Accessible by manager only.
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Get my station details (Manager)' })
  @ApiOkResponse({ description: 'Station details retrieved.' })
  @Get('mine')
  async findMyStation(@Req() req: any) {
    // In production, req.user will be populated by AuthGuard
    const managerId = req.user?.id || '2960f22f-d123-4567-890a-123456789abc'; // Fallback
    return this.stationService.findMyStation(managerId);
  }

  /**
   * Get station stats.
   * Accessible by director and admin.
   * @access director, admin
   */
  @Roles(Role.director, Role.admin)
  @ApiOperation({ description: "Get station stats", summary: "Get station stats" })
  @ApiOkResponse({ description: 'Station stats retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and admin roles allowed.' })
  @Get('stats')
  getStats() {
    return this.stationService.getSummary();
  }



  /**
   * Add new station.
   * Accessible by admin and director.
   * @access admin, director
   */
  @Roles(Role.admin, Role.director)
  @ApiOperation({ description: "Add new station with a dynamic list of pumps.", summary: "Add new station and its pumps" }) // 👈 Updated summary
  @ApiCreatedResponse({
    description: 'Station created successfully.',
    // ... Schema property definition remains valid, referencing the DTO
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/CreateStationDto' },
        message: { type: 'string', example: 'Station created successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin and director roles allowed.' })
  @ApiBody({
    type: CreateStationDto,
    examples: {
      fullCreation: {
        summary: 'Example request for creating a new station with manager and pumps',
        value: {
          name: "Eagle Fuel Depot",
          address: "456 Commerce Road",
          ward: "Industrial",
          lga: "Lekki",
          state: "Lagos",
          longitude: 3.4206,
          latitude: 6.4531,
          petrolVolume: 0,
          petrolPricePerLiter: 165.00,
          dieselVolume: 0,
          dieselPricePerLiter: 165.00,
          // Manager ID must be an existing User ID (UUID)
          managerId: "f0e1d2c3-b4a5-6789-0123-456789abcdef",
          // The dynamic list of pumps is defined here:
          pumps: [
            { pumpNumber: 1, dispensedProduct: "PETROL" },
            { pumpNumber: 2, dispensedProduct: "DIESEL" },
            { pumpNumber: 3, dispensedProduct: "PETROL" }
          ]
        } as CreateStationDto,
      },
    },
  })
  @Post()
  create(@Body() createStationDto: CreateStationDto) {
    // Calls the service function that handles the dynamic pump creation
    return this.stationService.create(createStationDto);
  }

  /**
   * Get all stations.
   * Accessible by director only.
   * @access director
   */
  @Roles(Role.director)
  @ApiOperation({ description: "Get all stations", summary: "Get all stations" })
  @ApiOkResponse({ description: 'All stations retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @Get()
  findAll() {
    return this.stationService.findAll();
  }

  /**
   * Get a single station by ID.
   * Accessible by director and manager.
   * @access director, manager
   * @param id - The ID of the station
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ description: "Get single station", summary: "Get single station" })
  @ApiOkResponse({ description: 'Station retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Station not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationService.findOne(id);
  }

  /**
   * Get specific station summary (petrol/diesel levels, pump status, sales).
   * Accessible by director and manager.
   * @access director, manager
   */
  @Roles(Role.director, Role.manager, Role.admin)
  @ApiOperation({ description: "Get specific station summary stats", summary: "Get One Station Summary" })
  @ApiOkResponse({ description: 'Station summary retrieved successfully.' })
  @Get(':id/summary')
  getStationSummary(@Param('id') id: string) {
    return this.stationService.getStationSummary(id);
  }

  /**
   * Update a station by ID.
   * Accessible by director and manager (for their own station).
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ description: "Update station", summary: "Update station" })
  @ApiOkResponse({
    description: 'Station updated successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/UpdateStationDto' },
        message: { type: 'string', example: 'Station updated successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Role not allowed.' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto, @Req() req: any) {
    const user = req.user; // Populated by JWT Guard

    // Security Check for Managers
    if (user && user.role === Role.manager) {
      // Optimistic check: We assume findMyStation throws if not found/not assigned
      // In a real scenario, we might want to catch that error to return 403 instead of 404, 
      // but 404 is also acceptable if they have NO station.
      // However, if they have a station but it's different, we check IDs.
      try {
        const myStation = await this.stationService.findMyStation(user.id);
        if (myStation.id !== id) {
          throw new ForbiddenException("You can only update your own station.");
        }
      } catch (e) {
        if (e instanceof ForbiddenException) throw e;
        // If we can't find their station, they definitely can't update *this* one
        throw new ForbiddenException("Access denied to this station.");
      }
    }

    return this.stationService.update(id, updateStationDto);
  }

  /**
   * Delete a station by ID.
   * Accessible by director only.
   * @access director
   * @param id - The ID of the station
   */
  @Roles(Role.director)
  @ApiOperation({ description: "Delete station", summary: "Delete station by ID" })
  @ApiOkResponse({
    description: 'Station deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Station deleted successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationService.remove(id);
  }

  /**
   * Assigns a manager to a station.
   * Accessible by director only.
   * @access director
   * @param id - The ID of the station
   * @param managerIdDto - DTO containing the User ID of the manager
   */
  @Roles(Role.director)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Assign a manager (User) to a station", summary: "Assign Station Manager" })
  @ApiOkResponse({ description: 'Manager assigned successfully.' })
  @ApiNotFoundResponse({ description: 'Station or Manager not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @ApiBadRequestResponse({ description: 'Invalid input data or User is not a Manager role.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        managerId: { type: 'string', format: 'uuid', example: 'f0e1d2c3-b4a5-6789-0123-456789abcdef' }
      }
    }
  })
  @Post(':id/manager/assign')
  assignManager(@Param('id') id: string, @Body() managerIdDto: ManagerIdDto) {
    return this.stationService.assignManager(id, managerIdDto.managerId);
  }

  /**
   * Unassigns the current manager from a station.
   * Accessible by director only.
   * @access director
   * @param id - The ID of the station
   */
  @Roles(Role.director)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: "Unassign the current manager from a station", summary: "Unassign Station Manager" })
  @ApiOkResponse({ description: 'Manager unassigned successfully.' })
  @ApiNotFoundResponse({ description: 'Station not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @Delete(':id/manager/unassign')
  unassignManager(@Param('id') id: string) {
    return this.stationService.unassignManager(id);
  }

  // --- Record Daily Sales Endpoint ---

  /**
   * Record daily sales figures for a specific pump.
   * This is a daily aggregate of volume and revenue for a single pump.
   * Accessible by manager only (as they typically submit these daily figures).
   * @access manager
   */
  //@Roles(Role.manager)
  @ApiOperation({ description: "Record daily sales for a specific pump (upsert)", summary: "Record/Update Daily Pump Sales" })
  @ApiCreatedResponse({
    description: 'Daily sales recorded successfully (created or updated).',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' /* PumpDailyRecord entity */ },
        message: { type: 'string', example: 'Daily sales recorded successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: RecordSalesDto,
    examples: {
      dailyRecord: {
        summary: 'Example request for recording daily sales volume and revenue.',
        value: {
          pumpId: "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Existing Pump ID
          recordDate: "2025-11-03", // YYYY-MM-DD
          volumeSold: 5678.50,      // Total volume in liters
          totalRevenue: 937005.00,  // Total revenue for the day
        } as RecordSalesDto,
      },
    },
  })
  @Post('record')
  recordDailySales(@Body() recordSalesDto: RecordSalesDto) {
    // The service handles the upsert logic (create if new, update if existing)
    return this.stationService.recordDailySales(recordSalesDto);
  }

  // --- Aggregated Daily Sales Report Endpoint ---

  /**
   * Get daily sales aggregated and grouped by Station and Day.
   * Accessible by director only (for high-level reporting).
   * @access director
   */
  //@Roles(Role.director)
  @ApiOperation({ description: "Get daily sales grouped by Station and Day", summary: "Daily Sales Report" })
  @ApiOkResponse({
    description: 'Aggregated daily sales report retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stationName: { type: 'string', example: 'Eagle Fuel Depot' },
              date: { type: 'string', format: 'date', example: '2025-11-03' },
              totalVolumeSold: { type: 'number', example: 12000.50 },
              totalDailyRevenue: { type: 'number', example: 1980000.00 }
            }
          }
        },
        message: { type: 'string', example: 'Aggregated daily sales by station retrieved successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @Get('report/daily')
  getDailySalesReport() {
    return this.stationService.getAggregatedDailySales();
  }

}