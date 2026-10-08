import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { Product } from '../../products/product.enum';

export class CreateReservoirDto {
  @ApiProperty({ enum: Product })
  @IsEnum(Product)
  product: Product;

  @ApiProperty({ description: 'Tank capacity in litres', example: 33000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  capacityLitres: number;
}
