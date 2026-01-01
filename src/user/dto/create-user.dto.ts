import { ApiProperty } from "@nestjs/swagger";
import { CreateInfoDto } from "./create-info.dto";
import { Role } from "../enums/role.enum";
import { CreateContactDto } from "./create-contact.dto";
import { IsEmail, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {
    @ApiProperty({})
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty(
        {
            enum: [
                "admin",
                "director",
                "manager"
            ],
            default: "manager"
        }
    )
    @IsEnum(Role)
    role: Role;

    @ApiProperty({})
    @ValidateNested()
    @Type(() => CreateInfoDto)
    info: CreateInfoDto

    @ApiProperty({})
    @ValidateNested()
    @Type(() => CreateContactDto)
    contact: CreateContactDto;
}
