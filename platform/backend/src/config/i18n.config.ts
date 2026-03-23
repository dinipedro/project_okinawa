import { ConfigService } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  QueryResolver,
  CookieResolver,
} from 'nestjs-i18n';
import * as path from 'path';

export const i18nConfig = (configService: ConfigService) => ({
  fallbackLanguage: configService.get<string>('DEFAULT_LANGUAGE') || 'pt',
  loaderOptions: {
    path: path.join(__dirname, '../i18n/'),
    watch: configService.get<string>('NODE_ENV') === 'development',
  },
  resolvers: [
    { use: QueryResolver, options: ['lang', 'locale', 'l'] },
    new HeaderResolver(['x-custom-lang', 'x-lang', 'accept-language']),
    AcceptLanguageResolver,
    new CookieResolver(['lang', 'locale']),
  ],
  typesOutputPath: path.join(__dirname, '../generated/i18n.generated.ts'),
});

export const supportedLanguages = ['pt', 'en', 'es'];

export type SupportedLanguage = 'pt' | 'en' | 'es';
