import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class UpdateStationStatusDto {
    @ApiProperty({ description: 'Status of the station', enum: ['active', 'suspended'] })
    @IsString()
    @IsEnum(['active', 'suspended'])
    status: 'active' | 'suspended';
}
