import { ApiProperty } from "@nestjs/swagger";

export class CreateInfoDto {
    
    @ApiProperty({})
    firstName: string;
    
    @ApiProperty({})
    lastName: string;
    
    @ApiProperty({})
    age: number;

    @ApiProperty({})
    image: string;
}