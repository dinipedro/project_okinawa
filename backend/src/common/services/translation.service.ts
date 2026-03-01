import { Injectable } from '@nestjs/common';
import { I18nService, I18nContext } from 'nestjs-i18n';

/**
 * Simple in-memory cache for translations
 */
interface CacheEntry {
  value: string;
  timestamp: number;
}

@Injectable()
export class TranslationService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cached entries

  constructor(private readonly i18n: I18nService) {}

  /**
   * Get cached translation or null if not found/expired
   */
  private getCached(cacheKey: string): string | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.value;
  }

  /**
   * Store translation in cache
   */
  private setCache(cacheKey: string, value: string): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear the translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Translate a key with optional arguments
   * @param key - Translation key (e.g., 'common.success')
   * @param args - Arguments for interpolation
   * @param lang - Language code (optional, uses current context if not provided)
   */
  translate(key: string, args?: Record<string, any>, lang?: string): string {
    const currentLang = lang || I18nContext.current()?.lang || 'pt';

    // Only use cache for translations without arguments (they're static)
    if (!args || Object.keys(args).length === 0) {
      const cacheKey = `${currentLang}:${key}`;
      const cached = this.getCached(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = this.i18n.translate(key, { lang: currentLang, args }) as string;
      this.setCache(cacheKey, result);
      return result;
    }

    return this.i18n.translate(key, { lang: currentLang, args }) as string;
  }

  /**
   * Shorthand for translate
   */
  t(key: string, args?: Record<string, any>, lang?: string): string {
    return this.translate(key, args, lang);
  }

  /**
   * Translate validation error messages
   */
  translateValidationError(key: string, field: string, lang?: string): string {
    return this.translate(`common.validation.${key}`, { field }, lang);
  }

  /**
   * Translate error messages
   */
  translateError(key: string, args?: Record<string, any>, lang?: string): string {
    return this.translate(`common.errors.${key}`, args, lang);
  }

  /**
   * Get all translations for a namespace
   */
  getNamespaceTranslations(namespace: string, lang?: string): Record<string, any> {
    const currentLang = lang || I18nContext.current()?.lang || 'pt';
    try {
      return this.i18n.translate(namespace, { lang: currentLang }) as Record<string, any>;
    } catch {
      return {};
    }
  }

  /**
   * Check if a translation key exists
   */
  hasTranslation(key: string, lang?: string): boolean {
    const currentLang = lang || I18nContext.current()?.lang || 'pt';
    const translation = this.i18n.translate(key, { lang: currentLang });
    return translation !== key;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return ['pt', 'en', 'es'];
  }

  /**
   * Get language display names
   */
  getLanguageDisplayNames(): Record<string, string> {
    return {
      pt: 'Português',
      en: 'English',
      es: 'Español',
    };
  }
}
