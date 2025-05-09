import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@ApiTags()
@ApiBearerAuth()
@Controller('report')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ReportController {

  constructor(private readonly reportService: ReportService) {}

  @Roles(Role.manager)
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

  @Roles(Role.admin, Role.director)
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

  @Roles(Role.director, Role.manager)
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

  @Roles(Role.manager)
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

  /** 
  @ApiOperation(
    {
      summary: 'Delete a report',
      description: 'Delete a report',
    }
  )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }**/
}
