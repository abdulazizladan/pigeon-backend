import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateReservoirDto {
  @ApiPropertyOptional({ description: 'Tank capacity in litres', example: 33000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  capacityLitres?: number;
}
