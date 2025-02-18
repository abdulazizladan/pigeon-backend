import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PumpService } from './pump.service';
import { CreatePumpDto } from './dto/create-pump.dto';
import { UpdatePumpDto } from './dto/update-pump.dto';

@Controller('pump')
export class PumpController {
  constructor(private readonly pumpService: PumpService) {}

  @Post()
  create(@Body() createPumpDto: CreatePumpDto) {
    return this.pumpService.create(createPumpDto);
  }

  @Get()
  findAll() {
    return this.pumpService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pumpService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePumpDto: UpdatePumpDto) {
    return this.pumpService.update(+id, updatePumpDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pumpService.remove(+id);
  }
}
