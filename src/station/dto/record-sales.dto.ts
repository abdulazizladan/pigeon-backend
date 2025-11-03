import { IsUUID, IsDateString, IsNumber, Min } from "class-validator";

export class RecordSalesDto {
    @IsUUID()
    pumpId: string;
  
    @IsDateString()
    recordDate: string; // YYYY-MM-DD format
  
    @IsNumber()
    @Min(0)
    volumeSold: number;
  
    @IsNumber()
    @Min(0)
    totalRevenue: number;
  }