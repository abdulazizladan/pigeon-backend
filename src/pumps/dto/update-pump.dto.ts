import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Product } from '../../products/product.enum';
import { PumpStatus } from '../pump-status.enum';

export class UpdatePumpDto {
  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  name?: string;

  @ApiPropertyOptional({ enum: Product })
  @IsOptional()
  @IsEnum(Product)
  product?: Product;

  @ApiPropertyOptional({ enum: PumpStatus })
  @IsOptional()
  @IsEnum(PumpStatus)
  status?: PumpStatus;
}
