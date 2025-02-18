import { Test, TestingModule } from '@nestjs/testing';
import { PumpController } from './pump.controller';
import { PumpService } from './pump.service';

describe('PumpController', () => {
  let controller: PumpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PumpController],
      providers: [PumpService],
    }).compile();

    controller = module.get<PumpController>(PumpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
