import { PartialType } from '@nestjs/swagger';
import { CreatePumpDto } from './create-pump.dto';

export class UpdatePumpDto extends PartialType(CreatePumpDto) {}
