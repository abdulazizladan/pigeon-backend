import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class SetPriceDto {
  @ApiProperty({ description: 'Selling price in Naira per litre', example: 880 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  pricePerLitre: number;
}
