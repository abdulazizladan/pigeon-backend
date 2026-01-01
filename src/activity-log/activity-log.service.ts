import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityStatus } from './entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
    constructor(
        @InjectRepository(ActivityLog)
        private activityLogRepository: Repository<ActivityLog>,
    ) { }

    async logActivity(userEmail: string, userName: string, action: string, description: string, status: ActivityStatus = ActivityStatus.SUCCESS): Promise<ActivityLog> {
        const log = this.activityLogRepository.create({
            userEmail,
            userName,
            action,
            description,
            status,
        });
        return this.activityLogRepository.save(log);
    }

    async findAll(): Promise<ActivityLog[]> {
        return this.activityLogRepository.find({
            order: {
                timestamp: 'DESC',
            },
        });
    }
}
