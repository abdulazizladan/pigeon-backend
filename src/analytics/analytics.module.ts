import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from 'src/sale/entities/sale.entity';
import { Station } from 'src/station/entities/station.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Sale, Station])],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule { }
