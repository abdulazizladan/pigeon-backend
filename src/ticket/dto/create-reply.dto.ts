import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";
import { Status } from "../enum/status.enum";

export class CreateReplyDto {
  @ApiProperty({ description: 'The message content of the reply' })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({ description: 'The status of the reply/ticket', enum: Status, required: false })
  @IsOptional()
  @IsEnum(Status)
  status: Status;
}