import { Module } from '@nestjs/common';
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';
import { DispenserModule } from 'src/dispenser/dispenser.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';

@Module({
  imports: [
    DispenserModule,
    TypeOrmModule.forFeature(
      [
        Sale
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
