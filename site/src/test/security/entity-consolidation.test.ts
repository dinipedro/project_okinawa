import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tests: Entity Consolidation Auth/Identity (Item #9)
 * Validates that duplicated entities have been consolidated
 */
describe('Entity Consolidation — Auth/Identity', () => {
  const authEntitiesDir = path.resolve(__dirname, '../../../backend/src/modules/auth/entities');
  const identityEntitiesDir = path.resolve(__dirname, '../../../backend/src/modules/identity/entities');

  const duplicatedEntities = [
    'user-credential.entity.ts',
    'audit-log.entity.ts',
    'password-reset-token.entity.ts',
  ];

  describe('Identity module should be the canonical source', () => {
    for (const entity of duplicatedEntities) {
      it(`${entity} in identity should have full entity definition`, () => {
        const filePath = path.join(identityEntitiesDir, entity);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Should have @Entity decorator (full definition)
        expect(content).toContain('@Entity(');
        expect(content).toContain('@PrimaryGeneratedColumn');
      });
    }
  });

  describe('Auth module entities should be re-exports only', () => {
    for (const entity of duplicatedEntities) {
      it(`${entity} in auth should re-export from identity`, () => {
        const filePath = path.join(authEntitiesDir, entity);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Should be a re-export, not a full entity definition
        expect(content).toContain('export {');
        expect(content).toContain('@/modules/identity');
        
        // Should NOT have its own @Entity decorator
        expect(content).not.toContain('@Entity(');
        expect(content).not.toContain('@PrimaryGeneratedColumn');
      });
    }
  });

  describe('Auth-specific entities should remain', () => {
    it('otp-token.entity.ts should still exist in auth', () => {
      const otpPath = path.join(authEntitiesDir, 'otp-token.entity.ts');
      expect(fs.existsSync(otpPath)).toBe(true);
    });

    it('biometric-token.entity.ts should still exist in auth', () => {
      const bioPath = path.join(authEntitiesDir, 'biometric-token.entity.ts');
      expect(fs.existsSync(bioPath)).toBe(true);
    });
  });

  describe('Identity module barrel export', () => {
    it('index.ts should export all canonical entities', () => {
      const indexPath = path.join(identityEntitiesDir, 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');
      
      expect(content).toContain('user-credential.entity');
      expect(content).toContain('audit-log.entity');
      expect(content).toContain('password-reset-token.entity');
      expect(content).toContain('token-blacklist.entity');
    });
  });

  describe('Auth module imports from identity', () => {
    it('auth.module.ts should import from @/modules/identity', () => {
      const authModulePath = path.resolve(__dirname, '../../../backend/src/modules/auth/auth.module.ts');
      const content = fs.readFileSync(authModulePath, 'utf-8');
      
      expect(content).toContain("from '@/modules/identity'");
    });
  });
});
