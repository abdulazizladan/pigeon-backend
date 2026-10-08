import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { StationStatus } from '../enums/station-status.enum';
import { NIGERIAN_STATES } from '../../common/nigeria';

export class UpdateStationDto {
  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ maxLength: 1000, nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  address?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  lga?: string;

  @ApiPropertyOptional({ enum: NIGERIAN_STATES })
  @IsOptional()
  @IsIn(NIGERIAN_STATES as readonly string[], { message: 'state must be a Nigerian state' })
  state?: string;

  @ApiPropertyOptional({ enum: StationStatus })
  @IsOptional()
  @IsEnum(StationStatus)
  status?: StationStatus;

  @ApiPropertyOptional({ description: 'Manager user id, or null to unassign', nullable: true })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  managerId?: string | null;
}
