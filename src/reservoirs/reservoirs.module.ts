import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservoir } from './entities/reservoir.entity';
import { ReservoirsService } from './reservoirs.service';
import { ReservoirsController } from './reservoirs.controller';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [TypeOrmModule.forFeature([Reservoir]), StationsModule],
  controllers: [ReservoirsController],
  providers: [ReservoirsService],
  exports: [ReservoirsService],
})
export class ReservoirsModule {}
