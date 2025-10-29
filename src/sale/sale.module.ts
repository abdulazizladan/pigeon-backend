import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { DispenserModule } from 'src/dispenser/dispenser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { Dispenser } from 'src/dispenser/entities/dispenser.entity';
import { Pump } from 'src/station/entities/pump.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    DispenserModule,
    TypeOrmModule.forFeature(
      [
        Sale,
        Dispenser,
        Pump,
        User
      ]
    ),
  ],
  controllers: [
    SaleController
  ],
  providers: [
    SaleService
  ],
})
export class SaleModule {}
