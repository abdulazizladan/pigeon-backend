import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../enums/role.enum';

/** Digits with optional leading +, spaces, dashes, dots or parentheses; 7–20 chars. */
export const PHONE_NUMBER_PATTERN = /^\+?[0-9][0-9\s().-]{5,18}[0-9]$/;

export class CreateUserDto {
  @ApiProperty({
    description: 'The unique username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: 'First name', example: 'John', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number in international or local format',
    example: '+1 555 123 4567',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(PHONE_NUMBER_PATTERN, { message: 'phoneNumber must be a valid phone number' })
  phoneNumber?: string;

  @ApiProperty({
    description: 'The password of the user (minimum 6 characters)',
    example: 'Password123!',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'The role assigned to the user',
    enum: Role,
    example: Role.MANAGER,
  })
  @IsEnum(Role)
  role: Role;
}
