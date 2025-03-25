import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation(
    {
      summary: 'Create a new report',
      description: 'Create a new report',
    }
  )
  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  @Roles(Role.admin)
  @ApiOperation(
    {
      summary: 'Get all reports',
      description: 'Get all reports',
    }
  )
  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation(
    {
      summary: 'Get a report by id',
      description: 'Get a report by id',
    }
  )
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  @ApiOperation(
    {
      summary: 'Update a report',
      description: 'Update a report',
    }
  )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

  @ApiOperation(
    {
      summary: 'Delete a report',
      description: 'Delete a report',
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
