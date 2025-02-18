import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../enums/role.enum";

export class LoginDto {
    @ApiProperty({})
    email: string;

    @ApiProperty({})
    password: string;
}