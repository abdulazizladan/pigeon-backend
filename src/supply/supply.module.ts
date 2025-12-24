import { Module } from '@nestjs/common';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supply } from './entities/supply.entity';
import { StationModule } from 'src/station/station.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supply]),
    StationModule,
    UserModule
  ],
  controllers: [SupplyController],
  providers: [SupplyService],
})
export class SupplyModule { }
