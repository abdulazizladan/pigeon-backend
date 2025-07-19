// Controller for handling dispenser-related endpoints
import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { DispenserService } from './dispenser.service';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { UpdateDispenserDto } from './dto/update-dispenser.dto';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
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
   */
  @Roles(Role.admin, Role.director)
  @ApiOperation(
    {
      summary: "get dispenser stats",
      description: "Get dispenser stats"
    }
  )
  @Get('stats')
  getStats() {
    return this.dispenserService.getSummary();
  }

  /**
   * Create a new dispenser.
   * Accessible by manager role only.
   * @param createDispenserDto - DTO containing dispenser details
   */
  @Roles(Role.manager)
  @ApiOperation(
    {
      summary: "add dispenser",
      description: "Add new dispenser to the station"
    }
  )
  @Post()
  create(@Body() createDispenserDto: CreateDispenserDto) {
    return this.dispenserService.create(createDispenserDto);
  }

  /**
   * Get all dispensers in the station.
   * Accessible by director and manager roles.
   */
  @Roles(Role.director, Role.manager)
  @ApiOperation(
    {
      summary: "get all dispensers",
      description: "Get all dispensers in the station"
    }
  )
  @Get()
  findAll() {
    return this.dispenserService.findAll();
  }

  /**
   * Get a dispenser by its ID.
   * Accessible by director and manager roles.
   * @param id - The ID of the dispenser
   */
  @Roles(Role.director, Role.manager)
  @ApiNotFoundResponse({content: {}, description: "Return when not found"})
  @ApiOperation(
    {
      summary: "get dispenser by id",
      description: "Get dispenser by id"
    }
  )
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.dispenserService.findOne(id);
  }

  /**
   * Update an existing dispenser by its ID.
   * Accessible by manager role only.
   * @param id - The ID of the dispenser
   * @param updateDispenserDto - DTO containing updated dispenser data
   */
  @Roles(Role.manager)
  @ApiOperation(
    {
      summary: "update dispenser",
      description: "Update existing dispenser"
    }
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDispenserDto: UpdateDispenserDto) {
    return this.dispenserService.update(+id, updateDispenserDto);
  }

}
