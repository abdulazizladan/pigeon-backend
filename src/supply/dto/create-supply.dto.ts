import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
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
    quantity: number;
}
