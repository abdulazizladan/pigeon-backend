import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { StationStatus } from '../enums/station-status.enum';
import { NIGERIAN_STATES } from '../../common/nigeria';

export class CreateStationDto {
  @ApiProperty({ example: 'Lekki Station', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @ApiPropertyOptional({ description: 'Short unique code. Generated from the name when omitted.', example: 'LKK-01', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Za-z0-9-]+$/, { message: 'code may only contain letters, numbers and dashes' })
  code?: string;

  @ApiPropertyOptional({ example: 'Flagship station serving Lekki Phase 1.', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Street address', example: '12 Admiralty Way, Lekki Phase 1', maxLength: 160 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  address: string;

  @ApiProperty({ description: 'Local Government Area', example: 'Eti-Osa', maxLength: 80 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lga: string;

  @ApiProperty({ description: 'Nigerian state', example: 'Lagos', enum: NIGERIAN_STATES })
  @IsString()
  @IsIn(NIGERIAN_STATES as readonly string[], { message: 'state must be a Nigerian state' })
  state: string;

  @ApiPropertyOptional({ enum: StationStatus, default: StationStatus.ACTIVE })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;

  @ApiPropertyOptional({ description: 'Id of the manager to assign' })
  @IsOptional()
  @IsString()
  managerId?: string;
}
