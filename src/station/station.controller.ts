import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/enums/role.enum';

@ApiTags('Station')
@ApiBearerAuth()
@Controller('station')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @ApiOperation(
    {
      description: "Add new station",
      summary: "Add new station"
    }
  )
  @Post()
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @ApiOperation(
    {
      description: "Get all stations",
      summary: "Get all stations" 
    }
  )
  @Get()
  findAll() {
    return this.stationService.findAll();
  }

  @Roles(Role.admin, Role.director)
  @ApiOperation(
    {
      description: "Get single station",
      summary: "Get single station"
    }
  )
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationService.findOne(+id);
  }

  @ApiOperation(
    {
      description: "Update station",
      summary: "Update station"
    }
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
    return this.stationService.update(+id, updateStationDto);
  }

  @ApiOperation(
    {
      description: "Remove station",
      summary: "Remove station"
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stationService.remove(+id);
  }
}