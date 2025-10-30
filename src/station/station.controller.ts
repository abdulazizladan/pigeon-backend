import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse, ApiBody, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/enums/role.enum';

@ApiTags('Station')
@ApiBearerAuth()
@Controller('station')
//@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StationController {
  
  constructor(private readonly stationService: StationService) {}

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
  @ApiOperation({ description: "Add new station", summary: "Add new station" })
  @ApiCreatedResponse({ 
    description: 'Station created successfully.',
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
          pricePerLiter: 165.00,
          // Manager ID must be an existing User ID (UUID)
          managerId: "f0e1d2c3-b4a5-6789-0123-456789abcdef", 
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
   * Update a station by ID.
   * Accessible by director only.
   * @access director
   * @param id - The ID of the station
   * @param updateStationDto - DTO containing updated station data
   */
  @Roles(Role.director)
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
  @ApiForbiddenResponse({ description: 'Forbidden. Only director role allowed.' })
  @ApiBody({
    type: UpdateStationDto,
    examples: {
        updateCoreDetailsAndManager: {
            summary: 'Update price, location, and reassign the station manager',
            value: {
                pricePerLiter: 168.00,
                lga: "Ikeja",
                status: "active",
                // Reassign manager to an existing User ID (UUID)
                managerId: "12345678-abcd-ef01-2345-67890abcdef0",
            } as UpdateStationDto,
        },
        unassignManager: {
            summary: 'Unassign the current manager and update the address',
            value: {
                address: "New Address Road 789",
                managerId: null, // Set managerId to null/empty string to unassign the manager
            } as UpdateStationDto,
        }
    }
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
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

}