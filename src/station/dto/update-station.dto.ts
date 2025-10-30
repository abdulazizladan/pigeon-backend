import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStationDto } from './create-station.dto';
import { IsOptional } from 'class-validator';

export class UpdateStationDto extends PartialType(CreateStationDto) {
    @ApiProperty({  description: 'Status of the station', required: false })
    @IsOptional()
    status?: string;
}
