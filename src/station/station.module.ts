import { Module } from '@nestjs/common';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Station } from './entities/station.entity';
import { Pump } from './entities/pump.entity';
import { User } from 'src/user/entities/user.entity';
import { PumpDailyRecord } from './entities/pum-daily-record.entity';
import { Stock } from './entities/stock.entity';
import { Sale } from '../sale/entities/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Station,
        Pump,
        User,
        PumpDailyRecord,
        Stock,
        Sale
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
export class StationModule { }
