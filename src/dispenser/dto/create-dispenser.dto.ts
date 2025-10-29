// src/dispenser/dto/create-dispenser.dto.ts

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsPhoneNumber,
    Matches,
    IsDateString // Used for date input from JSON
} from "class-validator";
import { Status } from "../enum/status.enum";
// Assuming the Status enum is defined, though not strictly required for creation

export class CreateDispenserDto {

    /**
     * @description First name of the employee/attendant
     */
    @ApiProperty({ description: "First name of the employee/attendant.", example: "John" })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    /**
     * @description Middle name of the employee/attendant
     */
    @ApiProperty({ description: "Middle name of the employee/attendant.", example: "Kofi" })
    @IsString()
    @IsNotEmpty()
    middleName: string;

    /**
     * @description Last name of the employee/attendant
     */
    @ApiProperty({ description: "Last name of the employee/attendant.", example: "Doe" })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    /**
     * @description Phone number of the employee/attendant. Using regex for simple validation.
     */
    @ApiProperty({ description: "Employee's phone number.", example: "+2348001234567" })
    @IsString()
    @IsNotEmpty()
    // Using a more robust validator for phone numbers
    @IsPhoneNumber()
    phone: string;

    /**
     * @description Date the employee/attendant was added (string format for input)
     */
    @ApiProperty({ description: "Date the employee/attendant was added (YYYY-MM-DD format).", example: "2024-10-25" })
    @IsNotEmpty()
    @IsDateString() // Use IsDateString for receiving date input from a JSON body
    dateAdded: string;

    /**
     * @description UUID of the station this employee/attendant belongs to.
     */
    @ApiProperty({ description: "UUID of the station this employee/attendant belongs to.", example: "a1b2c3d4-e5f6-7890-1234-567890abcdef" })
    @IsUUID()
    @IsNotEmpty()
    stationId: string;

    /**
     * @description URL or path to the employee/attendant's image (optional)
     */
    @ApiPropertyOptional({ description: "URL or path to the employee's image.", example: "https://example.com/images/john.jpg" })
    @IsOptional()
    @IsString()
    image?: string;
}