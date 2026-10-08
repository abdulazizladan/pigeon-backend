import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyRecord } from './entities/daily-record.entity';
import { PumpReading } from './entities/pump-reading.entity';
import { ReservoirReading } from './entities/reservoir-reading.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { StationsModule } from '../stations/stations.module';
import { PumpsModule } from '../pumps/pumps.module';
import { ReservoirsModule } from '../reservoirs/reservoirs.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DailyRecord, PumpReading, ReservoirReading]),
    StationsModule,
    PumpsModule,
    ReservoirsModule,
    ProductsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
