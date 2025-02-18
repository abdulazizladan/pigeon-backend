import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { PumpModule } from 'src/pump/pump.module';
import { DispenserModule } from 'src/dispenser/dispenser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Sale
      ]
    ),
    PumpModule,
    DispenserModule
  ],
  controllers: [
    SaleController
  ],
  providers: [
    SaleService
  ],
})
export class SaleModule {}
