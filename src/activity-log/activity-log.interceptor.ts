import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ActivityLogService } from './activity-log.service';
import { ActivityStatus } from './entities/activity-log.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ActivityLogInterceptor.name);

    constructor(
        private activityLogService: ActivityLogService,
        private userService: UserService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const method = request.method;
        const url = request.url;
        const action = `${method} ${url}`;

        // Don't log the log retrieval itself to avoid clutter? Or maybe we SHOULD log it.
        // The requirement says "logs all user activities".

        return next.handle().pipe(
            tap(async () => {
                if (user) {
                    try {
                        // Fetch detailed user info to get the name
                        // Note: request.user typically comes from JWT strategy which might only have id, email, role.
                        // We need to fetch the Info entity.
                        const fullUser = await this.userService.findByEmail(user.email);
                        let userName = 'Unknown';
                        if (fullUser && fullUser.data.info) {
                            userName = `${fullUser.data.info.firstName} ${fullUser.data.info.lastName}`;
                        } else if (fullUser && fullUser.data) {
                            // unexpected, maybe info is missing
                            userName = user.email; // Fallback
                        }

                        await this.activityLogService.logActivity(
                            user.email,
                            userName,
                            action,
                            JSON.stringify(request.body), // Log body or 'Successful Request'
                            ActivityStatus.SUCCESS
                        );
                    } catch (err) {
                        this.logger.error(`Failed to log success activity: ${err.message}`);
                    }
                }
            }),
            catchError(async (err) => {
                if (user) {
                    try {
                        const fullUser = await this.userService.findByEmail(user.email);
                        let userName = 'Unknown';
                        if (fullUser && fullUser.data.info) {
                            userName = `${fullUser.data.info.firstName} ${fullUser.data.info.lastName}`;
                        } else {
                            userName = user.email;
                        }

                        await this.activityLogService.logActivity(
                            user.email,
                            userName,
                            action,
                            err.message || 'Request Failed',
                            ActivityStatus.FAILED
                        );
                    } catch (loggingErr) {
                        this.logger.error(`Failed to log error activity: ${loggingErr.message}`);
                    }
                }
                return throwError(() => err);
            }),
        );
    }
}
