import { ApiProperty } from "@nestjs/swagger";

export class CreatePumpDto {
    @ApiProperty({ description: "Pump number", example: "1", required: true })
    number: number;
}
