import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class SalesSummaryQueryDto {
  @ApiPropertyOptional({ description: 'Start day (inclusive), YYYY-MM-DD. Defaults to 29 days before `to`.', example: '2026-09-07' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({ description: 'End day (inclusive), YYYY-MM-DD. Defaults to today.', example: '2026-10-06' })
  @IsOptional()
  @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
  to?: string;

  @ApiPropertyOptional({ description: 'Restrict to one station. Omit for all stations.' })
  @IsOptional()
  @IsString()
  stationId?: string;
}
