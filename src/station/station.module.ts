import { Module } from '@nestjs/common';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station } from './entities/station.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Station
      ]
    )
  ],
  controllers: [
    StationController
  ],
  providers: [
    StationService
  ],
  exports: [
    StationService
  ]
})
export class StationModule {}
