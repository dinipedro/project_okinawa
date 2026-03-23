import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: JWT Token Expiration Policy (Item #7)
 */
describe('JWT Token Expiration Policy', () => {
  it('validation schema should default access token to 15m', () => {
    const validationPath = path.resolve(__dirname, '../../../backend/src/config/validation.config.ts');
    const content = fs.readFileSync(validationPath, 'utf-8');
    
    const jwtExpiresLine = content.split('\n').find(l => l.includes('JWT_EXPIRES_IN') && l.includes('default'));
    expect(jwtExpiresLine).toBeTruthy();
    expect(jwtExpiresLine).toContain("'15m'");
  });

  it('validation schema should default refresh token to 7d', () => {
    const validationPath = path.resolve(__dirname, '../../../backend/src/config/validation.config.ts');
    const content = fs.readFileSync(validationPath, 'utf-8');
    
    const refreshLine = content.split('\n').find(l => l.includes('JWT_REFRESH_EXPIRES_IN') && l.includes('default'));
    expect(refreshLine).toBeTruthy();
    expect(refreshLine).toContain("'7d'");
  });

  it('auth.module.ts should NOT have 7d fallback for access token', () => {
    const authModulePath = path.resolve(__dirname, '../../../backend/src/modules/auth/auth.module.ts');
    const content = fs.readFileSync(authModulePath, 'utf-8');
    
    // Must not contain old 7d fallback
    expect(content).not.toContain("|| '7d'");
    // Should use JWT_EXPIRES_IN (not JWT_EXPIRATION) with 15m fallback
    expect(content).toContain("JWT_EXPIRES_IN");
    expect(content).toContain("'15m'");
  });

  it('.env.example should document 15m access token', () => {
    const envPath = path.resolve(__dirname, '../../../backend/.env.example');
    const content = fs.readFileSync(envPath, 'utf-8');
    
    expect(content).toContain('JWT_EXPIRES_IN=15m');
  });

  it('.env.example should document 7d refresh token', () => {
    const envPath = path.resolve(__dirname, '../../../backend/.env.example');
    const content = fs.readFileSync(envPath, 'utf-8');
    
    expect(content).toContain('JWT_REFRESH_EXPIRES_IN=7d');
  });

  it('SECURITY.md should reflect 15 minute access token', () => {
    const securityPath = path.resolve(__dirname, '../../../SECURITY.md');
    const content = fs.readFileSync(securityPath, 'utf-8');
    
    expect(content).toContain('15 minute');
    expect(content).not.toMatch(/Access Token.*7 day/i);
  });

  it('docker-compose JWT_EXPIRATION should be 15m', () => {
    const dockerPath = path.resolve(__dirname, '../../../backend/docker-compose.yml');
    const content = fs.readFileSync(dockerPath, 'utf-8');
    
    if (content.includes('JWT_EXPIRATION')) {
      expect(content).toContain('JWT_EXPIRATION: 15m');
    }
  });
});
