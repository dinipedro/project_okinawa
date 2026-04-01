import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * FiscalEventService -- event emitter for fiscal events.
 *
 * Delegates to EventEmitter2 so that @OnEvent listeners can react
 * to fiscal.nfce.authorized / fiscal.nfce.failed / fiscal.nfce.cancelled.
 */
@Injectable()
export class FiscalEventService {
  private readonly logger = new Logger(FiscalEventService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit(event: string, payload: Record<string, any>): void {
    this.logger.log(
      `[FISCAL EVENT] ${event} | ${JSON.stringify(payload)}`,
    );
    this.eventEmitter.emit(event, payload);
  }
}
