/**
 * TermsVersionMiddleware — LGPD Sprint 2: Re-consent enforcement.
 *
 * On every authenticated request this middleware checks whether the user
 * has accepted the current terms-of-service and privacy-policy versions.
 * If not, it returns HTTP 451 (Unavailable For Legal Reasons) so the
 * mobile client can show a re-consent screen.
 *
 * Excluded paths (always allowed through):
 *   /auth/*   — user must be able to log in / refresh tokens
 *   /legal/*  — user must be able to read the new legal documents
 *   /health/* — monitoring / load-balancer probes
 *   /users/me/consent* — the endpoint used to accept new terms
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConsentService } from '@/modules/identity/services/consent.service';
import { LegalService } from '@/modules/legal/legal.service';
import { ConsentType } from '@/modules/identity/entities/user-consent.entity';

/** Paths that bypass the terms-version check. */
const EXCLUDED_PATH_PREFIXES = [
  '/auth',
  '/legal',
  '/health',
  '/users/me/consent',
];

@Injectable()
export class TermsVersionMiddleware implements NestMiddleware {
  constructor(
    private readonly consentService: ConsentService,
    private readonly legalService: LegalService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Only check authenticated requests (JWT guard sets req.user)
    const user = (req as any).user;
    if (!user || !user.sub) {
      return next();
    }

    // Strip API prefix and version segments for cleaner path matching
    const rawPath = req.path
      .replace(/^\/api/, '')
      .replace(/^\/v\d+/, '');

    // Allow excluded paths through without checking consent
    const isExcluded = EXCLUDED_PATH_PREFIXES.some(
      (prefix) => rawPath === prefix || rawPath.startsWith(`${prefix}/`),
    );
    if (isExcluded) {
      return next();
    }

    try {
      // Get current document versions from LegalService
      const termsDoc = this.legalService.getTermsOfService();
      const privacyDoc = this.legalService.getPrivacyPolicy();

      const currentTermsVersion = termsDoc.version;
      const currentPrivacyVersion = privacyDoc.version;

      // Check if user has accepted both current versions
      const [hasAcceptedTerms, hasAcceptedPrivacy] = await Promise.all([
        this.consentService.hasAcceptedVersion(
          user.sub,
          ConsentType.TERMS_OF_SERVICE,
          currentTermsVersion,
        ),
        this.consentService.hasAcceptedVersion(
          user.sub,
          ConsentType.PRIVACY_POLICY,
          currentPrivacyVersion,
        ),
      ]);

      if (!hasAcceptedTerms || !hasAcceptedPrivacy) {
        // HTTP 451 — Unavailable For Legal Reasons
        return res.status(451).json({
          requiresConsent: true,
          currentTermsVersion,
          currentPrivacyVersion,
        });
      }
    } catch {
      // If consent checking fails (e.g. DB unavailable), let the request
      // through rather than blocking the entire API. The consent check is
      // a best-effort guard — the primary enforcement is at registration.
    }

    return next();
  }
}
