import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/** One thing a user did: who, what, to which record, when. Append-only. */
@Entity()
@Index(['actorId', 'createdAt'])
@Index(['createdAt'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  actorId: string;

  @Column({ type: 'varchar' })
  actorUsername: string;

  @Column({ type: 'varchar' })
  actorRole: string;

  /** Dotted verb such as `station.created` or `auth.login`. */
  @Column({ type: 'varchar', length: 60 })
  action: string;

  /** Human-readable sentence shown in the UI. */
  @Column({ type: 'varchar', length: 300 })
  description: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  targetType: string | null;

  @Column({ type: 'varchar', nullable: true })
  targetId: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  targetLabel: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt: Date;
}
