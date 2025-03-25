import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateReplyDto {
    @ApiProperty({ description: 'The message content of the reply' })
    @IsNotEmpty()
    @IsString()
    message: string;
  }