import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IdempotencyService, IDEMPOTENCY_KEY } from './idempotency.service';

@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private idempotencyService: IdempotencyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const headerName = this.reflector.get<string>(
      IDEMPOTENCY_KEY,
      context.getHandler(),
    );

    if (!headerName) {
      return true; // Not an idempotent endpoint
    }

    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers[headerName.toLowerCase()];

    if (!idempotencyKey) {
      throw new BadRequestException(
        `Missing required header: ${headerName}`,
      );
    }

    // Build unique key from user + idempotency key
    const userId = request.user?.id || 'anonymous';
    const uniqueKey = `${userId}:${request.method}:${request.path}:${idempotencyKey}`;

    const result = await this.idempotencyService.checkAndLock(uniqueKey);

    if (!result.isNew) {
      // Return cached response
      const response = context.switchToHttp().getResponse();
      response.status(200).json(result.existingResponse);
      return false;
    }

    // Store key for completion in interceptor
    request.idempotencyKey = uniqueKey;
    return true;
  }
}
