import { Module } from '@nestjs/common';
import { PumpService } from './pump.service';
import { PumpController } from './pump.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pump } from './entities/pump.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Pump
      ]
    )
  ],
  controllers: [
    PumpController
  ],
  providers: [
    PumpService
  ],
  exports: [
    PumpService
  ]
})
export class PumpModule {}
