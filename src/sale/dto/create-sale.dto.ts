// src/sale/dto/create-sale.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  IsOptional,
  IsNotEmpty,
} from "class-validator";

enum Product {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    GAS = 'GAS', // Assumes LPG or similar
    KEROSENE = 'KEROSENE',
  }

  export class CreateSaleDto {
    @ApiProperty({
      description: 'Type of fuel product sold.',
      enum: Product,
      example: Product.PETROL,
    })
    @IsEnum(Product)
    @IsNotEmpty()
    product: Product;
  
    @ApiProperty({
      description: 'Price per liter at the time of transaction.',
      example: 650.5,
    })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    pricePerLitre: number;
  
    @ApiProperty({
      description: 'Meter reading before the transaction started.',
      example: 1000.0,
    })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    openingMeterReading: number;
  
    @ApiProperty({
      description: 'Meter reading after the transaction concluded (must be > opening reading).',
      example: 1200.0,
    })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    closingMeterReading: number;
  
    @ApiProperty({
      description: 'ID of the specific pump used for the transaction.',
      format: 'uuid',
      example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    @IsNotEmpty()
    pumpId: string; // Changed from dispenserId for consistency
  }
  