import { ApiProperty } from "@nestjs/swagger";
import { CreateDateColumn } from "typeorm";
import { Status } from "../enum/status.enum";
import { CreateReplyDto } from "./create-reply.dto";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateTicketDto {
    @ApiProperty({ description: 'Title of the ticket' })
    @IsNotEmpty({ message: 'Title is required' })
    @IsString({ message: 'Title must be a string' })
    title: string;
  
    @ApiProperty({ description: 'Description of the ticket', required: false })
    @IsOptional()
    @IsString()
    description?: string;
  
    @ApiProperty({
      description: 'Status of the ticket',
      enum: Status,
      default: Status.active,
    })
    @IsOptional()
    @IsEnum(Status)
    status?: Status = Status.active; // Default to "active" if not provided
  }