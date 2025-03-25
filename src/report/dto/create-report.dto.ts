import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class CreateReportDto {
        @ApiProperty({description: "integer between 1 and 12", minimum: 1, maximum: 12})
        @IsNumber({})
        month: number; // 1-12

        @ApiProperty({example: 2020})
        @IsNumber({})
        year: number;
    
        @ApiProperty({}) 
        @IsNumber()
        totalFuelDispensed: number;
    
        @ApiProperty({})
        @IsNumber()
        totalSalesRevenue: number;
    
        @ApiProperty({})
        @IsNumber()
        totalExpenses: number;
    
        @ApiProperty({})
        @IsNumber()
        netProfit: number | null;
    
        @ApiProperty({})
        @IsString()
        notes: string;
    
        @ApiProperty({})
        @IsDate()
        createdAt: Date;
    
        @ApiProperty({default: false})
        @IsBoolean()
        readStatus: boolean;
}
