import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

/**
 * Decorator to get the current language from the request
 * Usage: @Lang() lang: string
 */
export const Lang = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const i18n = I18nContext.current(ctx);
    return i18n?.lang || 'pt';
  },
);

/**
 * Decorator to get the I18nContext
 * Usage: @I18n() i18n: I18nContext
 */
export const I18n = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): I18nContext | undefined => {
    return I18nContext.current(ctx);
  },
);
