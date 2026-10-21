import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthCheck } from './entities/health-check.entity';
import { PumpCheck } from './entities/pump-check.entity';
import { RepairRequest } from './entities/repair-request.entity';
import { HealthChecksService } from './health-checks.service';
import { RepairRequestsService } from './repair-requests.service';
import { HealthChecksController } from './health-checks.controller';
import { RepairRequestsController } from './repair-requests.controller';
import { StationsModule } from '../stations/stations.module';
import { PumpsModule } from '../pumps/pumps.module';

@Module({
  imports: [TypeOrmModule.forFeature([HealthCheck, PumpCheck, RepairRequest]), StationsModule, PumpsModule],
  controllers: [HealthChecksController, RepairRequestsController],
  providers: [HealthChecksService, RepairRequestsService],
  exports: [HealthChecksService, RepairRequestsService],
})
export class MaintenanceModule {}
