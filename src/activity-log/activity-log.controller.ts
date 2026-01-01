import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../user/enums/role.enum';
import { ActivityLog } from './entities/activity-log.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Activity Log')
@ApiBearerAuth()
@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
    constructor(private readonly activityLogService: ActivityLogService) { }

    @Get()
    @Roles(Role.admin)
    @ApiOperation({ summary: 'Retrieve all activity logs' })
    @ApiResponse({ status: 200, description: 'Return all activity logs.', type: [ActivityLog] })
    @ApiResponse({ status: 403, description: 'Forbidden. Only admins can access.' })
    findAll() {
        return this.activityLogService.findAll();
    }
}
