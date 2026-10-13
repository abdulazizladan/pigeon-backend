import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { ActivitiesQueryDto } from './dto/activities-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { UsersService } from '../users/users.service';

@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('users/:id/activities')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "A user's recorded activities, most recent first. Admin only." })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findForUser(@Param('id') id: string, @Query() query: ActivitiesQueryDto) {
    if (!(await this.usersService.findOneById(id))) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return this.activitiesService.findForActor(id, query.limit ?? 50, query.before, query.beforeId);
  }
}
