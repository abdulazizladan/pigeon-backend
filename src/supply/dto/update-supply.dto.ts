import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SupplyStatus } from '../entities/supply.entity';

export class UpdateSupplyDto {
    @ApiProperty({ enum: SupplyStatus, example: SupplyStatus.APPROVED })
    @IsEnum(SupplyStatus)
    status: SupplyStatus;
}
