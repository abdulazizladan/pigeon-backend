import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsString } from "class-validator";

export class CreateDispenserDto {
    @ApiProperty({})
    @IsString()
    firstName: string;

    @ApiProperty({})
    @IsString()
    middleName: string;

    @ApiProperty({})
    @IsString()
    lastName: string;

    @ApiProperty({})
    @IsDate()
    dateAdded: Date;

    @ApiProperty({description: "Dispenser phone number"})
    @IsString()
    phone: string;
}
