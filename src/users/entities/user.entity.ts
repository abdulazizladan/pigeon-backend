import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enums/role.enum';
import { UserStatus } from '../enums/user-status.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  // Nullable at the DB level so rows created before these columns existed survive
  // the schema sync. New users are required to supply both names via the DTO.
  @Column({ type: 'varchar', length: 50, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber: string | null;

  @Column()
  password?: string; // Optional/hidden when returning to clients, but needed for verification

  @Column({
    type: 'varchar',
    default: Role.MANAGER,
  })
  role: Role;

  /** Soft-delete flag: inactive users cannot log in and are excluded from assignments. */
  @Column({ type: 'varchar', default: UserStatus.ACTIVE })
  status: UserStatus;
}
