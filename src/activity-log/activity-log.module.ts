import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogInterceptor } from './activity-log.interceptor';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ActivityLog]),
        UserModule
    ],
    controllers: [ActivityLogController],
    providers: [ActivityLogService, ActivityLogInterceptor],
    exports: [ActivityLogService, ActivityLogInterceptor]
})
export class ActivityLogModule { }
