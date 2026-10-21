import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservoir } from './entities/reservoir.entity';
import { ReservoirLevel } from './entities/reservoir-level.entity';
import { ReservoirLevelsService } from './reservoir-levels.service';
import { ReservoirLevelsController } from './reservoir-levels.controller';
import { ReservoirReading } from '../sales/entities/reservoir-reading.entity';
import { PumpReading } from '../sales/entities/pump-reading.entity';
import { ReservoirsService } from './reservoirs.service';
import { ReservoirsController } from './reservoirs.controller';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservoir, ReservoirLevel, ReservoirReading, PumpReading]), StationsModule],
  controllers: [ReservoirsController, ReservoirLevelsController],
  providers: [ReservoirsService, ReservoirLevelsService],
  exports: [ReservoirsService, ReservoirLevelsService],
})
export class ReservoirsModule {}
