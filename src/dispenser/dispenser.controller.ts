import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DispenserService } from './dispenser.service';
import { CreateDispenserDto } from './dto/create-dispenser.dto';
import { UpdateDispenserDto } from './dto/update-dispenser.dto';
import { ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';

@Controller('dispenser')
export class DispenserController {
  constructor(private readonly dispenserService: DispenserService) {}

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

  @ApiOperation(
    {
      summary: "delete dispenser",
      description: "Delete existing dispenser"
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dispenserService.remove(+id);
  }
}
