import { CreateDateColumn, UpdateDateColumn, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Station } from "src/station/entities/station.entity";
import { User } from "src/user/entities/user.entity";

export enum SupplyStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    DELIVERED = 'DELIVERED',
}

export enum ProductType {
    PETROL = 'PETROL',
    DIESEL = 'DIESEL',
    GAS = 'GAS',
    KEROSENE = 'KEROSENE'
}

@Entity({ name: 'Supply' })
export class Supply {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Station)
    @JoinColumn({ name: 'stationId' })
    station: Station;

    @Column()
    stationId: string; // Explicit column for query optimization

    @ManyToOne(() => User)
    @JoinColumn({ name: 'requestedById' })
    requestedBy: User;

    @Column({
        type: 'varchar', // Use varchar for SQLite compatibility or enum for Postgres/MySQL
        default: ProductType.PETROL
    })
    product: ProductType;

    @Column('decimal', { precision: 10, scale: 2 })
    quantity: number;

    @Column({
        type: 'varchar',
        default: SupplyStatus.PENDING
    })
    status: SupplyStatus;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approvedById' })
    approvedBy: User;

    @Column({ type: 'datetime', nullable: true })
    deliveryDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
