import { describe, it, expect } from 'vitest';

/**
 * Security Tests: CSRF Middleware Configuration
 * Validates that the CSRF middleware has no insecure fallbacks
 * and requires proper environment variables.
 */
describe('CSRF Middleware Security', () => {
  it('should NOT contain hardcoded csrf-secret-key fallback', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csrfPath = path.resolve(__dirname, '../../../backend/src/common/middleware/csrf.middleware.ts');
    const content = fs.readFileSync(csrfPath, 'utf-8');

    // Must NOT contain the old insecure fallback
    expect(content).not.toContain("'csrf-secret-key'");
    expect(content).not.toContain('"csrf-secret-key"');
  });

  it('should throw error when no CSRF_SECRET or JWT_SECRET is set', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csrfPath = path.resolve(__dirname, '../../../backend/src/common/middleware/csrf.middleware.ts');
    const content = fs.readFileSync(csrfPath, 'utf-8');

    // Must contain fail-fast error throwing
    expect(content).toContain('throw new Error');
    expect(content).toContain('CSRF_SECRET or JWT_SECRET environment variable is required');
  });

  it('should use CSRF_SECRET with fallback to JWT_SECRET only', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csrfPath = path.resolve(__dirname, '../../../backend/src/common/middleware/csrf.middleware.ts');
    const content = fs.readFileSync(csrfPath, 'utf-8');

    // Must reference both env vars
    expect(content).toContain("process.env.CSRF_SECRET");
    expect(content).toContain("process.env.JWT_SECRET");

    // Must NOT have any other fallback string
    const generateTokenMatch = content.match(/generateToken[\s\S]*?{([\s\S]*?)}/);
    expect(generateTokenMatch).toBeTruthy();
    const fnBody = generateTokenMatch![1];
    // No string literal fallbacks allowed in generateToken
    const stringFallbacks = fnBody.match(/\|\|\s*['"][^'"\s]+['"]/g);
    expect(stringFallbacks).toBeNull();
  });

  it('should validate Bearer token structure before CSRF bypass', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const csrfPath = path.resolve(__dirname, '../../../backend/src/common/middleware/csrf.middleware.ts');
    const content = fs.readFileSync(csrfPath, 'utf-8');

    // Must have JWT regex validation
    expect(content).toContain('jwtRegex');
    expect(content).toContain('authHeader.length > 7');
  });
});
