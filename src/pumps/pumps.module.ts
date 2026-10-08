import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pump } from './entities/pump.entity';
import { PumpsService } from './pumps.service';
import { PumpsController } from './pumps.controller';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pump]), StationsModule],
  controllers: [PumpsController],
  providers: [PumpsService],
  exports: [PumpsService],
})
export class PumpsModule {}
