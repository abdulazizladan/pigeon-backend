import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { PumpCondition, StationCondition } from '../maintenance.enums';

export class PumpCheckDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pumpId: string;

  @ApiProperty({ enum: PumpCondition })
  @IsEnum(PumpCondition)
  condition: PumpCondition;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateHealthCheckDto {
  @ApiPropertyOptional({ description: 'Station checked. Managers may omit it: their own station is used.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Day of the check, YYYY-MM-DD. Defaults to today.' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'recordedOn must be YYYY-MM-DD' })
  recordedOn?: string;

  @ApiProperty({ enum: StationCondition })
  @IsEnum(StationCondition)
  stationCondition: StationCondition;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ type: [PumpCheckDto], description: 'One entry for every pump at the station' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PumpCheckDto)
  pumps: PumpCheckDto[];
}

export class UpdateHealthCheckDto {
  @ApiProperty({ enum: StationCondition })
  @IsEnum(StationCondition)
  stationCondition: StationCondition;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ type: [PumpCheckDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PumpCheckDto)
  pumps: PumpCheckDto[];
}

export class HealthChecksQueryDto {
  @ApiPropertyOptional({ description: 'Station to list. Managers may omit it. Directors and admins see every station when omitted.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Start day (inclusive), YYYY-MM-DD. Defaults to 29 days before `to`.' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ description: 'End day (inclusive), YYYY-MM-DD. Defaults to today.' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}
