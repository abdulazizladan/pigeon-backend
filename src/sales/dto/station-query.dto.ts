import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StationQueryDto {
  @ApiPropertyOptional({ description: 'Station id. Managers may omit it: their own station is used.' })
  @IsOptional()
  @IsString()
  stationId?: string;
}
