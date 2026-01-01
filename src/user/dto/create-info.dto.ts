import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateInfoDto {

    @ApiProperty({})
    @IsString()
    firstName: string;

    @ApiProperty({})
    @IsString()
    lastName: string;

    @ApiProperty({})
    @IsNumber()
    @IsOptional()
    age: number;

    @ApiProperty({})
    @IsString()
    @IsOptional()
    image: string;
}