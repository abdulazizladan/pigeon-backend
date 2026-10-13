import { SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.service';

export const ACTIVITY_KEY = 'activity';

/** Context handed to the describe/target functions after the handler has produced its result. */
export interface ActivityContext<TResult = any> {
  result: TResult;
  body: any;
  params: Record<string, string>;
  user: JwtPayload;
}

export interface ActivityTarget {
  type: string;
  id: string | null;
  label: string | null;
}

export interface ActivitySpec<TResult = any> {
  action: string;
  describe: (ctx: ActivityContext<TResult>) => string;
  target?: (ctx: ActivityContext<TResult>) => ActivityTarget | null;
  metadata?: (ctx: ActivityContext<TResult>) => Record<string, unknown> | null;
}

/**
 * Marks a controller handler as an auditable action. After the handler succeeds, ActivityInterceptor
 * writes one Activity row for the authenticated user. A failing handler logs nothing.
 */
export const LogActivity = <TResult = any>(spec: ActivitySpec<TResult>) => SetMetadata(ACTIVITY_KEY, spec);
