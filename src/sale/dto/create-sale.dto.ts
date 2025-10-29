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
    /**
     * The unique identifier of the dispenser (pump) used for the sale.
     * Maps to the 'dispenser' relationship in the entity.
     */
    @ApiProperty({
        description: 'UUID of the dispenser used for the sale.',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    })
    @IsUUID()
    @IsNotEmpty()
    dispenserId: string;

    /**
     * The type of fuel product sold. (e.g., PETROL, DIESEL)
     */
    @ApiProperty({
        description: 'The type of fuel product sold.',
        enum: Product,
        example: Product.PETROL,
    })
    @IsEnum(Product)
    product: Product;
    
    /**
     * Price per unit volume (e.g., per liter) at the time of transaction.
     */
    @ApiProperty({
        description: 'Price per liter at the time of sale.',
        example: 1.55,
        type: Number, // Swagger type correction
    })
    @IsNumber({ maxDecimalPlaces: 4 }, { message: 'Price must be a number with up to 4 decimal places.' })
    @Min(0.01)
    pricePerLitre: number;

    /**
     * The reading on the dispenser before the transaction started.
     */
    @ApiProperty({
        description: 'Meter reading before the fuel dispensing started.',
        example: 10000.000,
        type: Number,
    })
    @IsNumber({ maxDecimalPlaces: 3 })
    @Min(0)
    openingMeterReading: number;

    /**
     * The reading on the dispenser after the transaction concluded.
     * Must be greater than or equal to openingMeterReading.
     */
    @ApiProperty({
        description: 'Meter reading after the fuel dispensing concluded.',
        example: 10050.500,
        type: Number,
    })
    @IsNumber({ maxDecimalPlaces: 3 })
    @Min(0)
    closingMeterReading: number;

}