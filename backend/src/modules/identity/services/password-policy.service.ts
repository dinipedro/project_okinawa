/**
 * PasswordPolicyService - Validates passwords against security policies
 *
 * Part of Identity Module (AUDIT-010)
 */

import { Injectable } from '@nestjs/common';

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: number; // 0-100
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  disallowCommonPasswords: boolean;
  disallowUserInfo: boolean;
  minStrengthScore: number;
}

@Injectable()
export class PasswordPolicyService {
  private readonly DEFAULT_POLICY: PasswordPolicy = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    disallowCommonPasswords: true,
    disallowUserInfo: true,
    minStrengthScore: 50,
  };

  // Common weak passwords to reject
  private readonly COMMON_PASSWORDS = new Set([
    'password', 'password1', 'password123', '123456', '12345678',
    '123456789', '1234567890', 'qwerty', 'qwerty123', 'abc123',
    'monkey', 'master', 'dragon', 'letmein', 'login', 'admin',
    'welcome', 'password1!', 'Password1', 'Password1!', 'passw0rd',
    'iloveyou', 'sunshine', 'princess', 'football', 'baseball',
    'superman', 'batman', 'trustno1', 'shadow', 'michael',
    'jennifer', 'jordan', 'thomas', 'michelle', 'hunter',
    'charlie', 'andrew', 'matthew', 'daniel', 'ashley',
  ]);

  // Regex patterns for validation
  private readonly PATTERNS = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    numbers: /[0-9]/,
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/,
    repeatingChars: /(.)\1{2,}/,
    sequentialNumbers: /(012|123|234|345|456|567|678|789|890|098|987|876|765|654|543|432|321|210)/,
    sequentialLetters: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
  };

  /**
   * Validate a password against the policy
   */
  validate(
    password: string,
    userInfo?: { email?: string; name?: string; username?: string },
    policy: Partial<PasswordPolicy> = {},
  ): PasswordValidationResult {
    const finalPolicy = { ...this.DEFAULT_POLICY, ...policy };
    const errors: string[] = [];
    let score = 0;

    // Length checks
    if (password.length < finalPolicy.minLength) {
      errors.push(`Password must be at least ${finalPolicy.minLength} characters`);
    } else {
      score += 10;
    }

    if (password.length > finalPolicy.maxLength) {
      errors.push(`Password must be at most ${finalPolicy.maxLength} characters`);
    }

    // Longer passwords get more points
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (password.length >= 20) score += 5;

    // Character type checks
    if (finalPolicy.requireUppercase && !this.PATTERNS.uppercase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (this.PATTERNS.uppercase.test(password)) {
      score += 10;
    }

    if (finalPolicy.requireLowercase && !this.PATTERNS.lowercase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (this.PATTERNS.lowercase.test(password)) {
      score += 10;
    }

    if (finalPolicy.requireNumbers && !this.PATTERNS.numbers.test(password)) {
      errors.push('Password must contain at least one number');
    } else if (this.PATTERNS.numbers.test(password)) {
      score += 10;
    }

    if (finalPolicy.requireSpecialChars && !this.PATTERNS.specialChars.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    } else if (this.PATTERNS.specialChars.test(password)) {
      score += 15;
    }

    // Pattern checks (warnings, not errors)
    if (this.PATTERNS.repeatingChars.test(password)) {
      score -= 10;
    }

    if (this.PATTERNS.sequentialNumbers.test(password)) {
      score -= 10;
    }

    if (this.PATTERNS.sequentialLetters.test(password)) {
      score -= 10;
    }

    // Common password check
    if (finalPolicy.disallowCommonPasswords) {
      const lowerPassword = password.toLowerCase();
      if (this.COMMON_PASSWORDS.has(lowerPassword)) {
        errors.push('Password is too common. Please choose a more unique password');
        score -= 30;
      }
    }

    // User info check
    if (finalPolicy.disallowUserInfo && userInfo) {
      const lowerPassword = password.toLowerCase();

      if (userInfo.email) {
        const emailParts = userInfo.email.toLowerCase().split('@');
        if (lowerPassword.includes(emailParts[0])) {
          errors.push('Password cannot contain your email address');
          score -= 20;
        }
      }

      if (userInfo.name) {
        const nameParts = userInfo.name.toLowerCase().split(/\s+/);
        for (const part of nameParts) {
          if (part.length > 2 && lowerPassword.includes(part)) {
            errors.push('Password cannot contain parts of your name');
            score -= 20;
            break;
          }
        }
      }

      if (userInfo.username) {
        if (lowerPassword.includes(userInfo.username.toLowerCase())) {
          errors.push('Password cannot contain your username');
          score -= 20;
        }
      }
    }

    // Entropy bonus for character diversity
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) {
      score += 10;
    }

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Check minimum strength
    if (errors.length === 0 && score < finalPolicy.minStrengthScore) {
      errors.push('Password is too weak. Try adding more variety in characters');
    }

    // Determine strength label
    let strength: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) {
      strength = 'weak';
    } else if (score < 50) {
      strength = 'fair';
    } else if (score < 75) {
      strength = 'good';
    } else {
      strength = 'strong';
    }

    return {
      valid: errors.length === 0,
      errors,
      strength,
      score,
    };
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + special;

    // Ensure at least one of each type
    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Check if password needs to be changed (age-based)
   */
  isPasswordExpired(
    lastChangedAt: Date,
    maxAgeDays: number = 90,
  ): boolean {
    const now = new Date();
    const ageMs = now.getTime() - lastChangedAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    return ageDays > maxAgeDays;
  }

  /**
   * Get password requirements as a user-friendly list
   */
  getRequirements(policy: Partial<PasswordPolicy> = {}): string[] {
    const finalPolicy = { ...this.DEFAULT_POLICY, ...policy };
    const requirements: string[] = [];

    requirements.push(`At least ${finalPolicy.minLength} characters`);

    if (finalPolicy.requireUppercase) {
      requirements.push('At least one uppercase letter');
    }

    if (finalPolicy.requireLowercase) {
      requirements.push('At least one lowercase letter');
    }

    if (finalPolicy.requireNumbers) {
      requirements.push('At least one number');
    }

    if (finalPolicy.requireSpecialChars) {
      requirements.push('At least one special character (!@#$%^&*...)');
    }

    if (finalPolicy.disallowCommonPasswords) {
      requirements.push('Not a commonly used password');
    }

    if (finalPolicy.disallowUserInfo) {
      requirements.push('Cannot contain your email, name, or username');
    }

    return requirements;
  }
}
