import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { DispenserModule } from 'src/dispenser/dispenser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Dispenser } from 'src/dispenser/entities/dispenser.entity';
import { Pump } from 'src/station/entities/pump.entity';
import { User } from 'src/user/entities/user.entity';
import { Station } from 'src/station/entities/station.entity';
import { UserModule } from 'src/user/user.module';
import { PumpDailyRecord } from 'src/station/entities/pum-daily-record.entity';

@Module({
  imports: [
    DispenserModule,
    TypeOrmModule.forFeature(
      [
        Sale,
        Dispenser,
        Pump,
        User,
        Station,
        PumpDailyRecord
      ]
    ),
    UserModule
  ],
  controllers: [
    SaleController
  ],
  providers: [
    SaleService
  ],
})
export class SaleModule { }
