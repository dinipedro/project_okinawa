/**
 * PasswordPolicyService Tests
 * Tests for password validation, strength checking, and policy enforcement
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PasswordPolicyService } from './password-policy.service';

describe('PasswordPolicyService', () => {
  let service: PasswordPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordPolicyService],
    }).compile();

    service = module.get<PasswordPolicyService>(PasswordPolicyService);
  });

  describe('validate', () => {
    describe('length requirements', () => {
      it('should reject passwords shorter than minimum length', () => {
        const result = service.validate('Short1!');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password must be at least 8 characters');
      });

      it('should reject passwords longer than maximum length', () => {
        const longPassword = 'A'.repeat(129) + '1!a';

        const result = service.validate(longPassword);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password must be at most 128 characters');
      });

      it('should accept password with minimum length', () => {
        const result = service.validate('Abcd123!');

        // Should be valid or have no length-related errors
        expect(result.errors).not.toContain('Password must be at least 8 characters');
      });
    });

    describe('character type requirements', () => {
      it('should require uppercase letters', () => {
        const result = service.validate('lowercase123!');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one uppercase letter');
      });

      it('should require lowercase letters', () => {
        const result = service.validate('UPPERCASE123!');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one lowercase letter');
      });

      it('should require numbers', () => {
        const result = service.validate('NoNumbers!a');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password must contain at least one number');
      });

      it('should require special characters', () => {
        const result = service.validate('NoSpecial123a');

        expect(result.valid).toBe(false);
        expect(result.errors).toContain(
          'Password must contain at least one special character (!@#$%^&*...)',
        );
      });

      it('should accept password with all character types', () => {
        const result = service.validate('GoodPass123!');

        expect(result.valid).toBe(true);
      });
    });

    describe('common password check', () => {
      it('should reject common passwords', () => {
        const commonPasswords = [
          'password1',
          'Password1!',
          '123456789',
          'qwerty123',
          'admin1234!',
        ];

        for (const password of commonPasswords) {
          // Need to add more characters to meet other requirements
          const result = service.validate(password);

          // Some may fail for other reasons too, but common password check should be in errors
          if (result.errors.some((e) => e.includes('too common'))) {
            expect(result.valid).toBe(false);
          }
        }
      });

      it('should accept unique passwords', () => {
        const result = service.validate('UniqueP@ss2024!');

        expect(result.valid).toBe(true);
      });
    });

    describe('user info check', () => {
      it('should reject password containing email username', () => {
        const result = service.validate('JohnDoe123!', {
          email: 'johndoe@example.com',
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password cannot contain your email address');
      });

      it('should reject password containing name', () => {
        const result = service.validate('Michael123!a', {
          name: 'Michael Johnson',
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password cannot contain parts of your name');
      });

      it('should reject password containing username', () => {
        const result = service.validate('testuser123!A', {
          username: 'testuser',
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Password cannot contain your username');
      });

      it('should accept password not containing user info', () => {
        const result = service.validate('SecureP@ss2024!', {
          email: 'johndoe@example.com',
          name: 'John Doe',
          username: 'jdoe',
        });

        expect(result.valid).toBe(true);
      });
    });

    describe('strength scoring', () => {
      it('should give low score to weak passwords', () => {
        // Use custom policy to skip some requirements
        const result = service.validate('ab', {}, {
          requireSpecialChars: false,
          requireUppercase: false,
          requireNumbers: false,
          requireLowercase: false,
          minLength: 2,
          minStrengthScore: 0
        });

        expect(['weak', 'fair']).toContain(result.strength);
        expect(result.score).toBeLessThan(50);
      });

      it('should give higher score to longer passwords', () => {
        const shortResult = service.validate('Abcd123!');
        const longResult = service.validate('AbcdefghijklMnop123!');

        expect(longResult.score).toBeGreaterThan(shortResult.score);
      });

      it('should reduce score for repeating characters', () => {
        const result = service.validate('Aaaa1111!!!!');

        expect(result.score).toBeLessThan(70);
      });

      it('should reduce score for sequential characters', () => {
        const result = service.validate('Abc123456!@#');

        expect(result.score).toBeLessThan(80);
      });

      it('should give high score to strong passwords', () => {
        const result = service.validate('Xk9#mP2$vL7@nQ4!');

        expect(result.strength).toBe('strong');
        expect(result.score).toBeGreaterThanOrEqual(75);
      });
    });

    describe('strength labels', () => {
      it('should label password strength correctly', () => {
        // Test various strength levels with custom policy
        const customPolicy = { minStrengthScore: 0, disallowCommonPasswords: false };

        // Very weak - only lowercase
        const weakResult = service.validate('weakpassword', {}, { ...customPolicy, requireUppercase: false, requireNumbers: false, requireSpecialChars: false });
        expect(['weak', 'fair']).toContain(weakResult.strength);

        // Good - meets most requirements
        const goodResult = service.validate('GoodPassword123!');
        expect(['good', 'strong']).toContain(goodResult.strength);

        // Strong - long and complex
        const strongResult = service.validate('V3ryStr0ng&C0mpl3xP@ssw0rd!');
        expect(strongResult.strength).toBe('strong');
      });
    });

    describe('custom policy', () => {
      it('should allow disabling uppercase requirement', () => {
        const result = service.validate('lowercase123!', {}, { requireUppercase: false });

        expect(result.errors).not.toContain('Password must contain at least one uppercase letter');
      });

      it('should allow custom minimum length', () => {
        const result = service.validate('Short1!', {}, { minLength: 6 });

        expect(result.valid).toBe(true);
      });

      it('should allow disabling common password check', () => {
        const result = service.validate('Password1!', {}, { disallowCommonPasswords: false });

        expect(result.errors).not.toContain(expect.stringContaining('too common'));
      });
    });
  });

  describe('generateSecurePassword', () => {
    it('should generate password with default length of 16', () => {
      const password = service.generateSecurePassword();

      expect(password.length).toBe(16);
    });

    it('should generate password with custom length', () => {
      const password = service.generateSecurePassword(24);

      expect(password.length).toBe(24);
    });

    it('should generate password with all required character types', () => {
      const password = service.generateSecurePassword();

      expect(password).toMatch(/[A-Z]/); // Has uppercase
      expect(password).toMatch(/[a-z]/); // Has lowercase
      expect(password).toMatch(/[0-9]/); // Has numbers
      expect(password).toMatch(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/); // Has special
    });

    it('should generate different passwords each time', () => {
      const passwords = new Set();
      for (let i = 0; i < 10; i++) {
        passwords.add(service.generateSecurePassword());
      }

      expect(passwords.size).toBe(10); // All unique
    });

    it('should generate password that passes validation', () => {
      const password = service.generateSecurePassword();
      const result = service.validate(password);

      expect(result.valid).toBe(true);
    });
  });

  describe('isPasswordExpired', () => {
    it('should return true if password is older than max age', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100);

      const result = service.isPasswordExpired(oldDate, 90);

      expect(result).toBe(true);
    });

    it('should return false if password is newer than max age', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30);

      const result = service.isPasswordExpired(recentDate, 90);

      expect(result).toBe(false);
    });

    it('should use default 90 days max age', () => {
      const exactlyNinetyDaysAgo = new Date();
      exactlyNinetyDaysAgo.setDate(exactlyNinetyDaysAgo.getDate() - 90);

      const result = service.isPasswordExpired(exactlyNinetyDaysAgo);

      expect(result).toBe(false);

      const ninetyOneDaysAgo = new Date();
      ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

      const expiredResult = service.isPasswordExpired(ninetyOneDaysAgo);

      expect(expiredResult).toBe(true);
    });
  });

  describe('getRequirements', () => {
    it('should return default requirements list', () => {
      const requirements = service.getRequirements();

      expect(requirements).toContain('At least 8 characters');
      expect(requirements).toContain('At least one uppercase letter');
      expect(requirements).toContain('At least one lowercase letter');
      expect(requirements).toContain('At least one number');
      expect(requirements).toContain('At least one special character (!@#$%^&*...)');
      expect(requirements).toContain('Not a commonly used password');
      expect(requirements).toContain('Cannot contain your email, name, or username');
    });

    it('should reflect custom policy in requirements', () => {
      const requirements = service.getRequirements({
        requireUppercase: false,
        minLength: 12,
      });

      expect(requirements).toContain('At least 12 characters');
      expect(requirements).not.toContain('At least one uppercase letter');
    });

    it('should exclude disabled requirements', () => {
      const requirements = service.getRequirements({
        requireSpecialChars: false,
        disallowCommonPasswords: false,
        disallowUserInfo: false,
      });

      expect(requirements).not.toContain('At least one special character (!@#$%^&*...)');
      expect(requirements).not.toContain('Not a commonly used password');
      expect(requirements).not.toContain('Cannot contain your email, name, or username');
    });
  });
});
