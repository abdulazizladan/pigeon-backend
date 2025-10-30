import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePumpDto } from './create-pump.dto';

export class CreateStationDto {
    @ApiProperty({ description: 'Name of the station', example: 'Mega Station 1' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Physical address', example: '123 Main St' })
    @IsString()
    address: string;

    @ApiProperty({ description: 'Ward location', example: 'Central Ward' })
    @IsString()
    ward: string;

    @ApiProperty({ description: 'Local Government Area', example: 'Abuja Municipal' })
    @IsString()
    lga: string;

    @ApiProperty({ description: 'State location', example: 'FCT' })
    @IsString()
    state: string;

    @ApiProperty({ description: 'Longitude coordinate', example: 7.4913 })
    @IsNumber()
    longitude: number;

    @ApiProperty({ description: 'Latitude coordinate', example: 9.0579 })
    @IsNumber()
    latitude: number;

    @ApiProperty({ description: 'Price per liter', example: 150.5 })
    @IsNumber()
    pricePerLiter: number;

    @ApiProperty({ 
        description: 'Optional ID of the User assigned as manager', 
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        required: false
    })
    @IsOptional()
    @IsUUID()
    managerId?: string; // Foreign key reference to User ID

    @ApiProperty({ 
        description: 'List of pumps to be created for this station', 
        type: [CreatePumpDto],
        required: false 
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePumpDto)
    pumps?: CreatePumpDto[]; // Nested pump creation
}
