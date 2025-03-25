import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../enums/role.enum";
import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({example: '****@*****.***'})
    @IsEmail({})
    email: string;

    @ApiProperty({example: '********', minLength: 8})
    @IsString({})
    password: string;
}