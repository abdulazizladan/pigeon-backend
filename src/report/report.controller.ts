import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ClassSerializerInterceptor, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse, ApiBody, ApiCreatedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
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

  /**
   * Create a new report.
   * Accessible by manager only.
   * @access manager
   * @param createReportDto - DTO containing report details
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Create a new report', description: 'Create a new report' })
  @ApiCreatedResponse({ 
    description: 'Report created successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { $ref: '#/components/schemas/CreateReportDto' },
        message: { type: 'string', example: 'Report generated successfully.' }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @ApiBody({
    type: CreateReportDto,
    examples: {
      default: {
        summary: 'Sample create report payload',
        value: {
          month: 1,
          year: 2024,
          totalFuelDispensed: 50000.0,
          totalSalesRevenue: 32500000.0,
          totalExpenses: 28000000.0,
          netProfit: 4500000.0,
          notes: 'Monthly report for January 2024',
          createdAt: '2024-02-01T00:00:00Z',
          readStatus: false
        }
      }
    }
  })
  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportService.create(createReportDto);
  }

  /**
   * Get all reports.
   * Accessible by admin and director.
   * @access admin, director
   */
  @Roles(Role.admin, Role.director)
  @ApiOperation({ summary: 'Get all reports', description: 'Get all reports' })
  @ApiOkResponse({ description: 'All reports retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only admin and director roles allowed.' })
  @Get()
  findAll() {
    return this.reportService.findAll();
  }

  /**
   * Get a report by ID.
   * Accessible by director and manager.
   * @access director, manager
   * @param id - The ID of the report
   */
  @Roles(Role.director, Role.manager)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get a report by id', description: 'Get a report by id' })
  @ApiOkResponse({ description: 'Report retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Report not found.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only director and manager roles allowed.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportService.findOne(+id);
  }

  /**
   * Update a report by ID.
   * Accessible by manager only.
   * @access manager
   * @param id - The ID of the report
   * @param updateReportDto - DTO containing updated report data
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Update a report', description: 'Update a report' })
  @ApiOkResponse({ description: 'Report updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportService.update(+id, updateReportDto);
  }

    /**
   * Delete a report by ID.
   * Accessible by manager only.
   * @access manager
   * @param id - The ID of the report
   */
  @Roles(Role.manager)
  @ApiOperation({ summary: 'Delete a report', description: 'Delete a report' })
  @ApiOkResponse({ 
    description: 'Report deleted successfully.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Report deleted successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized. JWT is missing or invalid.' })
  @ApiForbiddenResponse({ description: 'Forbidden. Only manager role allowed.' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportService.remove(+id);
  }
}
