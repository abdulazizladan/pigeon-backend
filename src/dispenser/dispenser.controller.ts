// Controller for handling dispenser-related endpoints
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DispenserService } from './dispenser.service';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { UpdateDispenserDto } from './dto/update-dispenser.dto';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiForbiddenResponse, ApiUnauthorizedResponse, ApiBody, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

// Swagger tag for grouping endpoints and requiring Bearer Auth
@ApiTags('Dispenser')
@ApiBearerAuth()
// Main controller for dispenser endpoints, protected by JWT and role guards
@Controller('dispenser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DispenserController {
  
  // Injects the DispenserService to handle business logic
  constructor(private readonly dispenserService: DispenserService) {}

  /**
   * Get dispenser statistics (total, active, inactive).
   * Accessible by admin and director roles only.
   * @access admin, director
   */
  @Roles(Role.admin, Role.director)
  @ApiOperation({ summary: "get dispenser stats", description: "Get dispenser stats" })
  @ApiOkResponse({ 
    description: 'Dispenser stats retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            active: { type: 'number', example: 20 },
            inactive: { type: 'number', example: 5 }
          }
        },
        message: { type: 'string', example: 'Dispenser stats found' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin and director roles allowed.' })
  @Get('stats')
  getStats() {
    return this.dispenserService.getSummary();
  }

  /**
   * Create a new dispenser.
   * Accessible by manager role only.
   * @access manager
   * @param createDispenserDto - DTO containing dispenser details
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: "add dispenser", description: "Add new dispenser to the station" })
  @ApiCreatedResponse({ 
    description: 'Dispenser created successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/CreateDispenserDto' },
        message: { type: 'string', example: 'Dispenser added successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: CreateDispenserDto,
    examples: {
      default: {
        summary: 'Sample create dispenser payload',
        value: {
          firstName: 'John',
          middleName: 'Michael',
          lastName: 'Doe',
          dateAdded: '2024-01-15T10:30:00Z',
          phone: '+15551234567'
        }
      }
    }
  })
  @Post()
  create(@Body() createDispenserDto: CreateDispenserDto) {
    return this.dispenserService.create(createDispenserDto);
  }

  /**
   * Get all dispensers in the station.
   * Accessible by director and manager roles.
   * @access director, manager
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: "get all dispensers", description: "Get all dispensers in the station" })
  @ApiOkResponse({ 
    description: 'All dispensers retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              firstName: { type: 'string', example: 'John' },
              middleName: { type: 'string', example: 'Michael' },
              lastName: { type: 'string', example: 'Doe' },
              image: { type: 'string', example: 'https://example.com/avatar.jpg' },
              dateAdded: { type: 'string', format: 'date-time' },
              phone: { type: 'string', example: '+15551234567' },
              status: { type: 'string', example: 'active' }
            }
          }
        },
        message: { type: 'string', example: 'dispensers fetched successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get()
  findAll() {
    return this.dispenserService.findAll();
  }

  /**
   * Get a dispenser by its ID.
   * Accessible by director and manager roles.
   * @access director, manager
   * @param id - The ID of the dispenser
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation({ summary: "get dispenser by id", description: "Get dispenser by id" })
  @ApiOkResponse({ 
    description: 'Dispenser retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            firstName: { type: 'string', example: 'John' },
            middleName: { type: 'string', example: 'Michael' },
            lastName: { type: 'string', example: 'Doe' },
            image: { type: 'string', example: 'https://example.com/avatar.jpg' },
            dateAdded: { type: 'string', format: 'date-time' },
            phone: { type: 'string', example: '+15551234567' },
            status: { type: 'string', example: 'active' },
            sales: { type: 'array', items: { type: 'object' } }
          }
        },
        message: { type: 'string', example: 'dispenser fetched successfully' }
      }
    }
  })
  @ApiNotFoundResponse({ content: {}, description: "Return when not found" })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dispenserService.findOne(id);
  }

  /**
   * Update an existing dispenser by its ID.
   * Accessible by manager role only.
   * @access manager
   * @param id - The ID of the dispenser
   * @param updateDispenserDto - DTO containing updated dispenser data
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: "update dispenser", description: "Update existing dispenser" })
  @ApiOkResponse({ 
    description: 'Dispenser updated successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/UpdateDispenserDto' },
        message: { type: 'string', example: 'Dispenser updated successfully' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: UpdateDispenserDto,
    examples: {
      default: {
        summary: 'Sample update dispenser payload',
        value: {
          firstName: 'Jane',
          phone: '+15559876543'
        }
      }
    }
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispenserDto: UpdateDispenserDto) {
    return this.dispenserService.update(id, updateDispenserDto);
  }

  /**
   * Delete a dispenser by its ID.
   * Accessible by manager role only.
   * @access manager
   * @param id - The ID of the dispenser
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: "delete dispenser", description: "Delete dispenser by ID" })
  @ApiOkResponse({ 
    description: 'Dispenser deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Dispenser deleted successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispenserService.remove(id);
  }

}
