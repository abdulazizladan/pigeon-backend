import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
//import { FuelingStation } from './fueling-station.entity'; // Import the FuelingStation entity

@Entity({name: "MonthlyReport"})
export class MonthlyReport {
  
    @PrimaryGeneratedColumn({})
    id: number;

    @Column('int')
    month: number; // 1-12

    @Column('int')
    year: number;

    @Column() 
    totalFuelDispensed: number;

    @Column()
    totalSalesRevenue: number;

    @Column()
    totalExpenses: number;

    @Column()
    netProfit: number | null;


    @Column()
    notes: string;

    @CreateDateColumn() // Automatically tracks creation timestamp
    createdAt: Date;

    @ManyToOne((type) => User, user => user.reports)
    @JoinColumn({name: "user_id", referencedColumnName: "id"})
    createdBy: User;

    @Column()
    readStatus: boolean;

    // You might want to include a 'submittedBy' field later if you have user authentication
    // @ManyToOne(() => User, user => user.monthlyReports)
    // submittedBy: User;

    // Add other relevant fields as needed, e.g.,
    // - Starting fuel inventory
    // - Ending fuel inventory
    // - Fuel purchases
    // - Employee costs (if you want to include in expenses)

}