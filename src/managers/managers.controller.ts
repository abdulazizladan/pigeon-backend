import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ManagersService } from './managers.service';
import { CreateManagerDto } from './dto/create-manager.dto';
import { ManagersQueryDto } from './dto/managers-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { JwtPayload } from '../auth/auth.service';
import { LogActivity } from '../activities/activity.decorator';

@ApiTags('Managers')
@ApiBearerAuth('JWT-auth')
@Controller('managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.DIRECTOR)
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get()
  @ApiOperation({ summary: 'List managers with their assigned station. Optional ?status=active|inactive.' })
  @ApiResponse({ status: 200, description: 'List of managers' })
  findAll(@Query() query: ManagersQueryDto) {
    return this.managersService.findAll(query.status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a manager by id' })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  findOne(@Param('id') id: string) {
    return this.managersService.findOne(id);
  }

  @Post()
  @LogActivity({
    action: 'manager.created',
    describe: ({ result }) => `Created manager @${result.username}`,
    target: ({ result }) => ({ type: 'user', id: result.id, label: result.username }),
  })
  @ApiOperation({ summary: 'Create a manager account' })
  @ApiResponse({ status: 201, description: 'Manager created' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  create(@Body() dto: CreateManagerDto, @Request() req: { user: JwtPayload }) {
    return this.managersService.create(dto, req.user.role as Role);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @LogActivity({
    action: 'manager.deactivated',
    describe: ({ result }) => `Deactivated manager @${result.username}`,
    target: ({ result }) => ({ type: 'user', id: result.id, label: result.username }),
  })
  @ApiOperation({
    summary: 'Remove a manager',
    description: 'Soft delete: sets status to inactive, blocks login and unassigns them from their station. Returns the updated manager.',
  })
  @ApiResponse({ status: 200, description: 'Manager deactivated' })
  @ApiResponse({ status: 404, description: 'Manager not found' })
  remove(@Param('id') id: string) {
    return this.managersService.remove(id);
  }
}
