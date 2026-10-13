import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { ACTIVITY_KEY, ActivitySpec } from './activity.decorator';
import { ActivitiesService } from './activities.service';

/** Writes an Activity row after any handler decorated with @LogActivity completes successfully. */
@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activities: ActivitiesService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const spec = this.reflector.get<ActivitySpec | undefined>(ACTIVITY_KEY, context.getHandler());
    if (!spec) return next.handle();

    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap((result) => {
        const user = request.user;
        if (!user?.sub) return;
        const ctx = { result, body: request.body ?? {}, params: request.params ?? {}, user };
        try {
          void this.activities.log({
            actor: user,
            action: spec.action,
            description: spec.describe(ctx),
            target: spec.target?.(ctx) ?? null,
            metadata: spec.metadata?.(ctx) ?? null,
          });
        } catch {
          // A describe() bug must never break the request that just succeeded.
        }
      }),
    );
  }
}
