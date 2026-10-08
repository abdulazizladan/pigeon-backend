import { Module } from '@nestjs/common';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { UsersModule } from '../users/users.module';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [UsersModule, StationsModule],
  controllers: [ManagersController],
  providers: [ManagersService],
  exports: [ManagersService],
})
export class ManagersModule {}
