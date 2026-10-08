import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Product } from '../../products/product.enum';
import { PumpStatus } from '../pump-status.enum';

export class CreatePumpDto {
  @ApiProperty({ description: 'Label on the pump, unique within the station', example: 'Pump 1', maxLength: 40 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;

  @ApiProperty({ enum: Product, description: 'The one product this pump dispenses' })
  @IsEnum(Product)
  product: Product;

  @ApiPropertyOptional({ enum: PumpStatus, default: PumpStatus.ACTIVE })
  @IsOptional()
  @IsEnum(PumpStatus)
  status?: PumpStatus;
}
