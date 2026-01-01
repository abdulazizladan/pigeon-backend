import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsDate, IsString, IsEnum } from "class-validator";

export enum ActivityStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

@Entity({ name: "ActivityLog" })
export class ActivityLog {
    /**
     * Unique identifier for the log (Primary Key)
     */
    @PrimaryGeneratedColumn('uuid')
    @IsString()
    id: string;

    /**
     * Email of the user who performed the activity
     */
    @Column()
    @IsString()
    userEmail: string;

    /**
     * Concatenated name of the user (FirstName + LastName)
     */
    @Column()
    @IsString()
    userName: string;

    /**
     * The action performed (e.g., "GET /stations")
     */
    @Column()
    @IsString()
    action: string;

    /**
     * Description of the activity or error message
     */
    @Column({ type: 'text', nullable: true })
    @IsString()
    description: string;

    /**
     * Status of the activity
     */
    @Column({
        type: 'simple-enum',
        enum: ActivityStatus,
        default: ActivityStatus.SUCCESS
    })
    @IsEnum(ActivityStatus)
    status: ActivityStatus;

    /**
     * Timestamp when the activity occurred
     */
    @CreateDateColumn()
    @IsDate()
    timestamp: Date;
}
