import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { IdempotencyService } from './idempotency.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private idempotencyService: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.idempotencyKey;

    if (!idempotencyKey) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Mark as completed with response
        await this.idempotencyService.complete(idempotencyKey, response);
      }),
      catchError(async (error) => {
        // Mark as failed to allow retry
        await this.idempotencyService.fail(idempotencyKey);
        throw error;
      }),
    );
  }
}
