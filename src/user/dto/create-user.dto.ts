import { ApiProperty } from "@nestjs/swagger";
import { CreateInfoDto } from "./create-info.dto";
import { Role } from "../enums/role.enum";

export class CreateUserDto {
    @ApiProperty({})
    email: string;
    
    @ApiProperty({})
    password: string;

    @ApiProperty({enum: ["admin", "director", "manager"], default: "manager"})
    role: Role;

    @ApiProperty({})
    info: CreateInfoDto
}
