import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PumpReadingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  pumpId: string;

  @ApiProperty({ description: 'Totaliser at the start of the day, litres', example: 125430.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  openingReading: number;

  @ApiProperty({ description: 'Totaliser at the end of the day, litres', example: 127980 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  closingReading: number;
}

export class ReservoirReadingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reservoirId: string;

  @ApiProperty({ description: 'Dip level at the start of the day, litres', example: 21000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  openingLevel: number;

  @ApiPropertyOptional({ description: 'Litres received from a tanker during the day', default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  deliveredLitres?: number;

  @ApiProperty({ description: 'Dip level at the close of the day, litres', example: 18420 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  closingLevel: number;
}

export class CreateDailyRecordDto {
  @ApiPropertyOptional({ description: 'Station the day belongs to. Managers may omit it: their own station is used.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiProperty({ description: 'Trading day, YYYY-MM-DD', example: '2026-10-07' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'recordedOn must be YYYY-MM-DD' })
  recordedOn: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({ type: [PumpReadingDto], description: 'One entry for every active pump at the station' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PumpReadingDto)
  pumps: PumpReadingDto[];

  @ApiProperty({ type: [ReservoirReadingDto], description: 'One entry for every reservoir at the station' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReservoirReadingDto)
  reservoirs: ReservoirReadingDto[];
}
