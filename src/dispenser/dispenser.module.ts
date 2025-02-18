import { Module } from '@nestjs/common';
import { DispenserService } from './dispenser.service';
import { DispenserController } from './dispenser.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispenser } from './entities/dispenser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Dispenser
      ]
    )
  ],
  controllers: [
    DispenserController
  ],
  providers: [
    DispenserService
  ],
  exports: [
    DispenserService
  ]
})
export class DispenserModule {}
