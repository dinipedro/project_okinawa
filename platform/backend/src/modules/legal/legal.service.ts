import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

export interface LegalDocument {
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
  contentHash: string;
}

export interface LegalContacts {
  support: string;
  privacy: string;
  security: string;
  legal: string;
  accessibility: string;
  address: string;
  phone: string;
}

type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['pt-BR', 'en-US', 'es-ES'];
const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR';

@Injectable()
export class LegalService {
  private readonly contentDir: string;
  private readonly cache = new Map<string, LegalDocument>();

  constructor() {
    this.contentDir = path.join(__dirname, 'legal-content');
    this.preloadContent();
  }

  /**
   * Pre-load all legal content into memory on startup.
   * Content is static and changes only on deployment.
   */
  private preloadContent(): void {
    const documents = ['privacy-policy', 'terms-of-service'];

    for (const doc of documents) {
      for (const lang of SUPPORTED_LANGUAGES) {
        const cacheKey = `${doc}.${lang}`;
        const filePath = path.join(this.contentDir, `${cacheKey}.json`);

        try {
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const parsed = JSON.parse(rawContent);
          const contentHash = crypto
            .createHash('sha256')
            .update(rawContent)
            .digest('hex');
          this.cache.set(cacheKey, { ...parsed, contentHash });
        } catch {
          // File may not exist for all languages; will fall back to default
        }
      }
    }
  }

  /**
   * Returns the privacy policy for the requested language.
   * Falls back to pt-BR if the requested language is not available.
   */
  getPrivacyPolicy(lang?: string): LegalDocument {
    return this.getDocument('privacy-policy', lang);
  }

  /**
   * Returns the terms of service for the requested language.
   * Falls back to pt-BR if the requested language is not available.
   */
  getTermsOfService(lang?: string): LegalDocument {
    return this.getDocument('terms-of-service', lang);
  }

  /**
   * Retrieves a legal document by type and language.
   */
  private getDocument(type: string, lang?: string): LegalDocument {
    const resolvedLang = this.resolveLanguage(lang);
    const cacheKey = `${type}.${resolvedLang}`;

    const doc = this.cache.get(cacheKey);
    if (doc) {
      return doc;
    }

    // Try default language as fallback
    const fallbackKey = `${type}.${DEFAULT_LANGUAGE}`;
    const fallbackDoc = this.cache.get(fallbackKey);
    if (fallbackDoc) {
      return fallbackDoc;
    }

    throw new NotFoundException(`Legal document "${type}" not found`);
  }

  /**
   * Returns the current versions of all legal documents.
   * Used by the terms-version middleware and the /legal/versions endpoint.
   */
  getCurrentVersions(): { termsVersion: string; privacyVersion: string } {
    const terms = this.getTermsOfService();
    const privacy = this.getPrivacyPolicy();
    return {
      termsVersion: terms.version,
      privacyVersion: privacy.version,
    };
  }

  /**
   * Returns the official contact channels for LGPD and legal inquiries.
   */
  getContacts(): LegalContacts {
    return {
      support: process.env.CONTACT_SUPPORT_EMAIL || 'help@noowebr.com',
      privacy: process.env.CONTACT_DPO_EMAIL || 'dpo@noowebr.com',
      security: process.env.CONTACT_SECURITY_EMAIL || 'security@noowebr.com',
      legal: process.env.CONTACT_LEGAL_EMAIL || 'legal@noowebr.com',
      accessibility: process.env.CONTACT_ACCESSIBILITY_EMAIL || 'accessibility@noowebr.com',
      address: process.env.CONTACT_ADDRESS || 'Av. Paulista, 1000 - São Paulo, SP - Brasil',
      phone: process.env.CONTACT_PHONE || '+55 (11) 0000-0000',
    };
  }

  /**
   * Resolves and validates the requested language.
   */
  private resolveLanguage(lang?: string): SupportedLanguage {
    if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      return lang as SupportedLanguage;
    }
    return DEFAULT_LANGUAGE;
  }
}
