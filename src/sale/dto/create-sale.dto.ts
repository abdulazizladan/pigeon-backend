import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber } from "class-validator";

export class CreateSaleDto {

    @ApiProperty({}) 
    @IsNumber({})
    pumpId: number;

    @ApiProperty({})
    @IsNumber()
    pricePerLitre: number;

    @ApiProperty({})
    @IsNumber()
    openingMeterReading: number;

    @ApiProperty({})
    @IsNumber()
    closingMeterReading: number;

    @ApiProperty({})
    @IsDate()
    transactionDate: Date;

    @ApiProperty({})
    @IsNumber()
    dispenserId: number;    
}
