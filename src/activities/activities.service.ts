import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateUtils } from 'typeorm/util/DateUtils';
import { Activity } from './entities/activity.entity';
import { JwtPayload } from '../auth/auth.service';

export interface LogActivityInput {
  actor: Pick<JwtPayload, 'sub' | 'username' | 'role'>;
  action: string;
  description: string;
  target?: { type: string; id: string | null; label: string | null } | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly repository: Repository<Activity>,
  ) {}

  /** Records an activity. Never throws: an audit failure must not fail the action it describes. */
  async log(input: LogActivityInput): Promise<void> {
    try {
      await this.repository.save(
        this.repository.create({
          actorId: input.actor.sub,
          actorUsername: input.actor.username,
          actorRole: input.actor.role,
          action: input.action,
          description: input.description.slice(0, 300),
          targetType: input.target?.type ?? null,
          targetId: input.target?.id ?? null,
          targetLabel: input.target?.label?.slice(0, 160) ?? null,
          metadata: input.metadata ?? null,
          // Set explicitly: the column default (datetime('now')) has only second precision, which
          // would leave actions performed within the same second in arbitrary order.
          createdAt: new Date(),
        }),
      );
    } catch (err) {
      this.logger.warn(`Could not record activity "${input.action}": ${(err as Error).message}`);
    }
  }

  /**
   * A user's activities, newest first. To page, pass the createdAt and id of the oldest row already
   * shown: ordering is (createdAt, id) so rows that share a second are neither skipped nor repeated.
   */
  findForActor(actorId: string, limit = 50, before?: string, beforeId?: string): Promise<Activity[]> {
    const qb = this.repository
      .createQueryBuilder('a')
      .where('a.actorId = :actorId', { actorId })
      .orderBy('a.createdAt', 'DESC')
      .addOrderBy('a.id', 'DESC')
      .take(limit);
    if (before) {
      // Rows written before millisecond stamping hold "YYYY-MM-DD HH:mm:ss"; newer ones add ".SSS".
      // strftime('%f') renders both as "SS.SSS", so every row compares against the cursor the same way.
      const ts = DateUtils.mixedDateToUtcDatetimeString(new Date(before));
      const norm = "strftime('%Y-%m-%d %H:%M:%f', a.createdAt)";
      if (beforeId) {
        qb.andWhere(`(${norm} < :ts OR (${norm} = :ts AND a.id < :id))`, { ts, id: beforeId });
      } else {
        qb.andWhere(`${norm} < :ts`, { ts });
      }
    }
    return qb.getMany();
  }
}
