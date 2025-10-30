import { IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum Product {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    GAS = 'GAS', // Assumes LPG or similar
    KEROSENE = 'KEROSENE',
  }

export class CreatePumpDto {
    @ApiProperty({ description: 'Sequential identifier for the pump', example: 1 })
    @IsInt()
    @Min(1)
    pumpNumber: number;

    @ApiProperty({ enum: Product, description: 'The type of fuel dispensed', example: Product.PETROL })
    @IsEnum(Product)
    dispensedProduct: Product;
}
