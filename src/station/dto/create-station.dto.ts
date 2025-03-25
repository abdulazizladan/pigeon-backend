import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateStationDto {
    @ApiProperty({})
    @IsString()
    name: string;

    @ApiProperty({})
    @IsString()
    address: string;

    @ApiProperty({})
    @IsString()
    ward: string;

    @ApiProperty({})
    @IsString()
    lga: string;

    @ApiProperty({})
    @IsString()
    state: string;

    @ApiProperty({})
    @IsNumber()
    longitude: number;

    @ApiProperty({})
    @IsNumber()
    latitude: number;

    @ApiProperty({})
    @IsNumber()
    pricePerLiter: number;
}
