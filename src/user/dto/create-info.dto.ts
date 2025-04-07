import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateInfoDto {
    
    @ApiProperty({})
    @IsString()
    firstName: string;
    
    @ApiProperty({})
    @IsString()
    lastName: string;
    
    @ApiProperty({})
    @IsString()
    age: number;

    @ApiProperty({})
    @IsString()
    image: string;
}