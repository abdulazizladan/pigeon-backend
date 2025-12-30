import { IsEnum, IsNumber, IsUUID, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from '../entities/supply.entity';

export class CreateSupplyDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'ID of the station requesting supply' })
    @IsUUID()
    stationId: string;

    @ApiProperty({ enum: ProductType, example: ProductType.PETROL })
    @IsEnum(ProductType)
    product: ProductType;

    @ApiProperty({ example: 5000, description: 'Quantity in liters' })
    @IsNumber()
    @Min(1)
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 2500, description: 'Current petrol level in liters', required: false })
    @IsNumber()
    @IsOptional()
    currentPetrolLevel?: number;

    @ApiProperty({ example: 3000, description: 'Current diesel level in liters', required: false })
    @IsNumber()
    @IsOptional()
    currentDieselLevel?: number;
}
