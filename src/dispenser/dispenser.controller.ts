import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DispenserService } from './dispenser.service';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { UpdateDispenserDto } from './dto/update-dispenser.dto';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags('Dispenser')
@ApiBearerAuth()
@Controller('dispenser')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DispenserController {
  constructor(private readonly dispenserService: DispenserService) {}

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

  /** 
  @ApiOperation(
    {
      summary: "delete dispenser",
      description: "Delete existing dispenser"
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispenserService.remove(+id);
  }**/
}
