import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { ActivityInterceptor } from './activity.interceptor';
import { UsersModule } from '../users/users.module';

/** Global so any module can inject ActivitiesService; the interceptor runs app-wide. */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Activity]), UsersModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, { provide: APP_INTERCEPTOR, useClass: ActivityInterceptor }],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
