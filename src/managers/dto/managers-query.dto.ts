import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { UserStatus } from '../../users/enums/user-status.enum';

export class ManagersQueryDto {
  @ApiPropertyOptional({ enum: UserStatus, description: 'Filter by status. Omit for all managers.' })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
