import { Controller, Get, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { Lang } from '@/common/decorators/language.decorator';
import { supportedLanguages } from '@/config/i18n.config';

@ApiTags('i18n')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get list of supported languages' })
  @ApiResponse({
    status: 200,
    description: 'List of supported languages',
    schema: {
      type: 'object',
      properties: {
        languages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'pt' },
              name: { type: 'string', example: 'Português' },
              nativeName: { type: 'string', example: 'Português' },
            },
          },
        },
        default: { type: 'string', example: 'pt' },
      },
    },
  })
  getSupportedLanguages() {
    const languageInfo: Record<string, { name: string; nativeName: string }> = {
      pt: { name: 'Portuguese', nativeName: 'Português' },
      en: { name: 'English', nativeName: 'English' },
      es: { name: 'Spanish', nativeName: 'Español' },
    };

    return {
      languages: supportedLanguages.map((code) => ({
        code,
        ...languageInfo[code],
      })),
      default: 'pt',
    };
  }

  @Get('translations/:lang')
  @ApiOperation({ summary: 'Get all translations for a language' })
  @ApiParam({ name: 'lang', description: 'Language code (pt, en, es)' })
  @ApiResponse({
    status: 200,
    description: 'All translations for the specified language',
  })
  getTranslations(@Param('lang') lang: string) {
    if (!supportedLanguages.includes(lang)) {
      throw new BadRequestException(`Language '${lang}' is not supported. Supported languages: ${supportedLanguages.join(', ')}`);
    }

    const namespaces = [
      'common',
      'auth',
      'restaurant',
      'orders',
      'payments',
      'reservations',
      'loyalty',
      'notifications',
      'reviews',
    ];

    const translations: Record<string, any> = {};

    for (const namespace of namespaces) {
      try {
        translations[namespace] = this.i18nService.translate(namespace, { lang });
      } catch {
        translations[namespace] = {};
      }
    }

    return {
      language: lang,
      translations,
    };
  }

  @Get('translations/:lang/:namespace')
  @ApiOperation({ summary: 'Get translations for a specific namespace' })
  @ApiParam({ name: 'lang', description: 'Language code (pt, en, es)' })
  @ApiParam({ name: 'namespace', description: 'Translation namespace (common, auth, orders, etc.)' })
  @ApiResponse({
    status: 200,
    description: 'Translations for the specified namespace',
  })
  getNamespaceTranslations(
    @Param('lang') lang: string,
    @Param('namespace') namespace: string,
  ) {
    if (!supportedLanguages.includes(lang)) {
      throw new BadRequestException(`Language '${lang}' is not supported`);
    }

    try {
      const translations = this.i18nService.translate(namespace, { lang });
      return {
        language: lang,
        namespace,
        translations,
      };
    } catch {
      return {
        language: lang,
        namespace,
        translations: {},
      };
    }
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current language from request' })
  @ApiResponse({
    status: 200,
    description: 'Current language detected from request',
    schema: {
      type: 'object',
      properties: {
        language: { type: 'string', example: 'pt' },
      },
    },
  })
  getCurrentLanguage(@Lang() lang: string) {
    return {
      language: lang,
    };
  }
}
