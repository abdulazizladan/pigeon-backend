import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class DailyRecordsQueryDto {
  @ApiPropertyOptional({ description: 'Station to list. Managers may omit it: their own station is used. Directors and admins see every station when omitted.' })
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Start day (inclusive), YYYY-MM-DD. Defaults to 29 days before `to`.' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ description: 'End day (inclusive), YYYY-MM-DD. Defaults to today.' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}
