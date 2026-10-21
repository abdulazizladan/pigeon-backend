import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';

export class ReservoirLevelInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservoirId: string;

  @ApiProperty({ description: 'Litres in the tank at close of business', example: 18420 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  level: number;
}

export class RecordLevelsDto {
  @ApiPropertyOptional({ description: 'Station. Managers may omit it: their own station is used.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Day of the reading, YYYY-MM-DD. Defaults to today.' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'recordedOn must be YYYY-MM-DD' })
  recordedOn?: string;

  @ApiProperty({ type: [ReservoirLevelInputDto], description: 'One entry per reservoir read' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReservoirLevelInputDto)
  levels: ReservoirLevelInputDto[];
}
