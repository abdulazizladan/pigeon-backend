import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PHONE_NUMBER_PATTERN } from '../../users/dto/create-user.dto';

/** Same shape as CreateUserDto minus the role, which is always manager. */
export class CreateManagerDto {
  @ApiProperty({ example: 'jane_doe', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @ApiProperty({ example: 'Jane', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiPropertyOptional({ example: '+234 801 234 5678', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(PHONE_NUMBER_PATTERN, { message: 'phoneNumber must be a valid phone number' })
  phoneNumber?: string;

  @ApiProperty({ minLength: 6, example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
