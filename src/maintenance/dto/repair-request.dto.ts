import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RepairDecision, RepairPriority, RepairStatus } from '../maintenance.enums';

export class CreateRepairRequestDto {
  @ApiPropertyOptional({ description: 'Station the fault is at. Managers may omit it: their own station is used.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Pump id when the faulty facility is a pump' })
  @IsOptional()
  @IsString()
  pumpId?: string;

  @ApiProperty({ description: 'What is faulty', example: 'Canopy lights', maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  facility: string;

  @ApiProperty({ description: 'What is wrong and what repair is needed', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ enum: RepairPriority, description: 'high = high / urgent' })
  @IsEnum(RepairPriority)
  priority: RepairPriority;

  @ApiPropertyOptional({ description: 'Health check that surfaced the fault' })
  @IsOptional()
  @IsString()
  healthCheckId?: string;
}

export class DecideRepairRequestDto {
  @ApiProperty({ enum: RepairDecision })
  @IsEnum(RepairDecision)
  decision: RepairDecision;

  @ApiPropertyOptional({ maxLength: 1000, description: 'Reason or instructions for the manager' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

export class RepairRequestsQueryDto {
  @ApiPropertyOptional({ description: 'Station to list. Managers may omit it. Directors and admins see every station when omitted.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ enum: RepairStatus })
  @IsOptional()
  @IsEnum(RepairStatus)
  status?: RepairStatus;

  @ApiPropertyOptional({ enum: RepairPriority })
  @IsOptional()
  @IsEnum(RepairPriority)
  priority?: RepairPriority;
}
