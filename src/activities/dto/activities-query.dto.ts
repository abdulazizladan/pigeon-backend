import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, Max, Min } from 'class-validator';

export class ActivitiesQueryDto {
  @ApiPropertyOptional({ description: 'Page size', default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({ description: 'Cursor: the createdAt of the oldest activity already shown (ISO timestamp).' })
  @IsOptional()
  @IsISO8601()
  before?: string;

  @ApiPropertyOptional({ description: 'Cursor: the id of that same oldest activity, so rows sharing its second are not skipped or repeated.' })
  @IsOptional()
  @IsString()
  beforeId?: string;
}
