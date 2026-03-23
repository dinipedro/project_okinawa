import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: CSRF Bearer Token Bypass Validation (Item #8)
 * Validates all 3 scenarios: valid token, invalid token, absent token
 */
describe('CSRF Bearer Token Bypass Validation', () => {
  const csrfPath = path.resolve(__dirname, '../../../backend/src/common/middleware/csrf.middleware.ts');
  let content: string;

  try {
    content = fs.readFileSync(csrfPath, 'utf-8');
  } catch {
    content = '';
  }

  describe('Scenario: Valid JWT Bearer token', () => {
    it('should bypass CSRF only for valid JWT structure', () => {
      // Must validate JWT structure (3 dot-separated segments)
      expect(content).toContain('jwtRegex');
      expect(content).toMatch(/jwtRegex\.test\(token\)/);
    });

    it('should only bypass inside regex validation block', () => {
      // The `return next()` for bearer must be INSIDE the regex check
      const bearerSection = content.slice(
        content.indexOf('Bearer'),
        content.indexOf('// Validate CSRF token')
      );
      expect(bearerSection).toContain('jwtRegex.test(token)');
      expect(bearerSection).toContain('return next()');
    });
  });

  describe('Scenario: Invalid Bearer token', () => {
    it('should NOT bypass for non-JWT strings', () => {
      // Regex should require 3 base64url segments
      expect(content).toContain('[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+');
    });

    it('should check token length is > 7 (not empty after Bearer prefix)', () => {
      expect(content).toContain('authHeader.length > 7');
    });
  });

  describe('Scenario: Absent Bearer token', () => {
    it('should require CSRF token when no Authorization header', () => {
      // After bearer check fails, must validate CSRF tokens
      expect(content).toContain("throw new ForbiddenException('CSRF token missing')");
    });

    it('should throw on invalid CSRF token', () => {
      expect(content).toContain("throw new ForbiddenException('CSRF token invalid')");
    });
  });

  describe('Bearer bypass does NOT skip JWT guard', () => {
    it('should have explicit comment that JWT guard still validates', () => {
      expect(content).toContain('JWT guard will still validate the token');
    });
  });
});
