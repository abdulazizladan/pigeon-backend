import { OmitType } from '@nestjs/swagger';
import { CreateDailyRecordDto } from './create-daily-record.dto';

/** Replaces every reading on an existing day. The station and date cannot change. */
export class UpdateDailyRecordDto extends OmitType(CreateDailyRecordDto, ['stationId', 'recordedOn'] as const) {}
