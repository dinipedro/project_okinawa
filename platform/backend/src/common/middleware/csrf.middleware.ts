import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_COOKIE = 'csrf-token';
const CSRF_SECRET_COOKIE = 'csrf-secret';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF check for safe methods
    if (this.safeMethods.includes(req.method)) {
      // Generate and set CSRF token for GET requests
      this.setNewCsrfToken(res);
      return next();
    }

    // Origin/Referer validation for state-changing requests
    // Reject requests whose Origin does not match the allowed CORS_ORIGIN
    const origin = req.headers.origin;
    if (origin) {
      const corsOrigin = process.env.CORS_ORIGIN || '';
      const allowedOrigins = corsOrigin
        ? corsOrigin.split(',').map((o) => o.trim().toLowerCase())
        : [];

      // In development, also allow common local origins
      if (process.env.NODE_ENV !== 'production') {
        allowedOrigins.push(
          'http://localhost:3000',
          'http://localhost:8081',
          'http://localhost:19006',
        );
      }

      const normalizedOrigin = origin.toLowerCase();
      if (allowedOrigins.length > 0 && !allowedOrigins.includes(normalizedOrigin)) {
        throw new ForbiddenException(
          'Origin not allowed: request origin does not match CORS_ORIGIN',
        );
      }
    }

    // Skip CSRF check for API requests with valid Bearer token (mobile/API clients)
    // NOTE: This only bypasses CSRF — the JWT guard will still validate the token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 7) {
      const token = authHeader.substring(7).trim();
      // Basic JWT structure validation (3 base64url segments separated by dots)
      const jwtRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
      if (jwtRegex.test(token)) {
        return next();
      }
    }

    // Validate CSRF token for state-changing requests
    const tokenFromHeader = req.headers[CSRF_TOKEN_HEADER] as string;
    const tokenFromCookie = req.cookies?.[CSRF_TOKEN_COOKIE];
    const secretFromCookie = req.cookies?.[CSRF_SECRET_COOKIE];

    if (!tokenFromHeader || !tokenFromCookie || !secretFromCookie) {
      throw new ForbiddenException('CSRF token missing');
    }

    // Verify token matches
    const expectedToken = this.generateToken(secretFromCookie);
    if (!this.secureCompare(tokenFromHeader, expectedToken) ||
        !this.secureCompare(tokenFromCookie, expectedToken)) {
      throw new ForbiddenException('CSRF token invalid');
    }

    // Rotate token after successful validation
    this.setNewCsrfToken(res);
    next();
  }

  private setNewCsrfToken(res: Response): void {
    const secret = crypto.randomBytes(32).toString('hex');
    const token = this.generateToken(secret);

    // Set cookies with secure flags - both httpOnly for security
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    };

    // Secret cookie - httpOnly to prevent XSS access
    res.cookie(CSRF_SECRET_COOKIE, secret, cookieOptions);
    // Token cookie - also httpOnly, client reads from response header instead
    res.cookie(CSRF_TOKEN_COOKIE, token, cookieOptions);
    // Client should read token from this header and store in memory/state
    res.setHeader(CSRF_TOKEN_HEADER, token);
  }

  private generateToken(secret: string): string {
    const csrfKey = process.env.CSRF_SECRET;
    if (!csrfKey) {
      throw new Error(
        'CSRF_SECRET environment variable is required. ' +
        'Must be a unique secret, separate from JWT_SECRET.',
      );
    }
    return crypto
      .createHmac('sha256', secret)
      .update(csrfKey)
      .digest('hex');
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}

export const CSRF_EXCLUDED_ROUTES = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/webhooks',
  '/api/health',
];
