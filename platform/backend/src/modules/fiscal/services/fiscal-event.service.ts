import { Injectable, Logger } from '@nestjs/common';

/**
 * FiscalEventService -- lightweight event emitter for fiscal events.
 *
 * Replaces EventEmitter2 dependency until @nestjs/event-emitter is installed.
 * Logs all events for auditability. In production, integrate with
 * EventEmitter2, Redis PubSub, or a message queue.
 */
@Injectable()
export class FiscalEventService {
  private readonly logger = new Logger(FiscalEventService.name);

  emit(event: string, payload: Record<string, any>): void {
    this.logger.log(
      `[FISCAL EVENT] ${event} | ${JSON.stringify(payload)}`,
    );
    // TODO: Emit via EventEmitter2 when @nestjs/event-emitter is added.
    // this.eventEmitter.emit(event, payload);
  }
}
