/**
 * Unit Tests for Authentication Validation Schemas
 * 
 * Tests validation rules for loginSchema and registerSchema
 * Covers email format, password complexity, and field length requirements
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.8, 8.3**
 */

import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from './auth';

describe('Authentication Validation Schemas', () => {
  describe('loginSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid email and password', () => {
        const validInput: LoginInput = {
          email: 'user@example.com',
          password: 'anypassword',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('user@example.com');
          expect(result.data.password).toBe('anypassword');
        }
      });

      it('should accept email with subdomain', () => {
        const validInput = {
          email: 'user@mail.example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept email with plus addressing', () => {
        const validInput = {
          email: 'user+tag@example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept email with dots in local part', () => {
        const validInput = {
          email: 'first.last@example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept email with numbers', () => {
        const validInput = {
          email: 'user123@example456.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept single character password (login allows any password)', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'x',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should trim and lowercase email', () => {
        const validInput = {
          email: '  USER@EXAMPLE.COM  ',
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('user@example.com');
        }
      });

      it('should accept email at maximum length (255 chars)', () => {
        // Create email with 255 characters total
        const localPart = 'a'.repeat(64); // Max local part is 64 chars
        const domain = 'b'.repeat(186) + '.com'; // Total: 64 + 1 (@) + 190 = 255
        const validInput = {
          email: `${localPart}@${domain}`,
          password: 'pass',
        };

        const result = loginSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });
    });

    describe('invalid email formats', () => {
      it('should reject email without @ symbol', () => {
        const invalidInput = {
          email: 'userexample.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid email');
        }
      });

      it('should reject email without domain', () => {
        const invalidInput = {
          email: 'user@',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid email');
        }
      });

      it('should reject email without local part', () => {
        const invalidInput = {
          email: '@example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid email');
        }
      });

      it('should reject email with spaces', () => {
        const invalidInput = {
          email: 'user name@example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject email with multiple @ symbols', () => {
        const invalidInput = {
          email: 'user@@example.com',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject email exceeding 255 characters', () => {
        const localPart = 'a'.repeat(64);
        const domain = 'b'.repeat(187) + '.com'; // Total: 64 + 1 (@) + 191 = 256
        const invalidInput = {
          email: `${localPart}@${domain}`,
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('must not exceed 255 characters');
        }
      });

      it('should reject empty email', () => {
        const invalidInput = {
          email: '',
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('invalid password', () => {
      it('should reject empty password', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: '',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Password is required');
        }
      });
    });

    describe('missing fields', () => {
      it('should reject missing email', () => {
        const invalidInput = {
          password: 'pass',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject missing password', () => {
        const invalidInput = {
          email: 'user@example.com',
        };

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject empty object', () => {
        const invalidInput = {};

        const result = loginSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('registerSchema', () => {
    describe('valid inputs', () => {
      it('should accept valid registration with strong password', () => {
        const validInput: RegisterInput = {
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('newuser@example.com');
          expect(result.data.password).toBe('Password123');
          expect(result.data.confirmPassword).toBe('Password123');
        }
      });

      it('should accept password with special characters', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'Pass123!@#',
          confirmPassword: 'Pass123!@#',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept password at minimum length (8 chars)', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'Pass123a',
          confirmPassword: 'Pass123a',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept password at maximum length (128 chars)', () => {
        const longPassword = 'A1' + 'a'.repeat(126); // 128 chars with uppercase, lowercase, number
        const validInput = {
          email: 'user@example.com',
          password: longPassword,
          confirmPassword: longPassword,
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept password with multiple uppercase letters', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'PASSWORD123abc',
          confirmPassword: 'PASSWORD123abc',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should accept password with multiple numbers', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'Password123456',
          confirmPassword: 'Password123456',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should trim and lowercase email', () => {
        const validInput = {
          email: '  NEWUSER@EXAMPLE.COM  ',
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('newuser@example.com');
        }
      });
    });

    describe('password complexity requirements', () => {
      it('should reject password without uppercase letter', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('uppercase letter');
        }
      });

      it('should reject password without lowercase letter', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'PASSWORD123',
          confirmPassword: 'PASSWORD123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('lowercase letter');
        }
      });

      it('should reject password without number', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'PasswordABC',
          confirmPassword: 'PasswordABC',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('number');
        }
      });

      it('should reject password with only uppercase and numbers', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'PASSWORD123',
          confirmPassword: 'PASSWORD123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject password with only lowercase and numbers', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject password with only uppercase and lowercase', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'PasswordABC',
          confirmPassword: 'PasswordABC',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('password length requirements', () => {
      it('should reject password shorter than 8 characters', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Pass12',
          confirmPassword: 'Pass12',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 8 characters');
        }
      });

      it('should reject password with 7 characters', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Pass123',
          confirmPassword: 'Pass123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject password exceeding 128 characters', () => {
        const longPassword = 'A1' + 'a'.repeat(127); // 129 chars
        const invalidInput = {
          email: 'user@example.com',
          password: longPassword,
          confirmPassword: longPassword,
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('must not exceed 128 characters');
        }
      });

      it('should reject empty password', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: '',
          confirmPassword: '',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('password confirmation matching', () => {
      it('should reject when passwords do not match', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password456',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
        if (!result.success) {
          const confirmPasswordError = result.error.issues.find(
            (issue) => issue.path.includes('confirmPassword')
          );
          expect(confirmPasswordError?.message).toContain('Passwords do not match');
        }
      });

      it('should reject when confirmPassword is empty', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: '',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject when passwords differ by case', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject when passwords differ by whitespace', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123 ',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('email validation (same as loginSchema)', () => {
      it('should reject invalid email format', () => {
        const invalidInput = {
          email: 'invalid-email',
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject email exceeding 255 characters', () => {
        const localPart = 'a'.repeat(64);
        const domain = 'b'.repeat(187) + '.com'; // Total: 256 chars
        const invalidInput = {
          email: `${localPart}@${domain}`,
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject empty email', () => {
        const invalidInput = {
          email: '',
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('missing fields', () => {
      it('should reject missing email', () => {
        const invalidInput = {
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject missing password', () => {
        const invalidInput = {
          email: 'user@example.com',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject missing confirmPassword', () => {
        const invalidInput = {
          email: 'user@example.com',
          password: 'Password123',
        };

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });

      it('should reject empty object', () => {
        const invalidInput = {};

        const result = registerSchema.safeParse(invalidInput);
        expect(result.success).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle password with unicode characters', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'Pässwörd123',
          confirmPassword: 'Pässwörd123',
        };

        const result = registerSchema.safeParse(validInput);
        // Should succeed if it meets complexity requirements
        expect(result.success).toBe(true);
      });

      it('should handle email with international domain', () => {
        const validInput = {
          email: 'user@example.co.uk',
          password: 'Password123',
          confirmPassword: 'Password123',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });

      it('should handle password with all complexity requirements at minimum', () => {
        const validInput = {
          email: 'user@example.com',
          password: 'Aa1aaaaa', // Exactly 8 chars, 1 upper, 1 lower, 1 number
          confirmPassword: 'Aa1aaaaa',
        };

        const result = registerSchema.safeParse(validInput);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('TypeScript type inference', () => {
    it('should infer correct types for LoginInput', () => {
      const loginInput: LoginInput = {
        email: 'user@example.com',
        password: 'pass',
      };

      // Type check - this should compile without errors
      expect(loginInput.email).toBeDefined();
      expect(loginInput.password).toBeDefined();
    });

    it('should infer correct types for RegisterInput', () => {
      const registerInput: RegisterInput = {
        email: 'user@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      };

      // Type check - this should compile without errors
      expect(registerInput.email).toBeDefined();
      expect(registerInput.password).toBeDefined();
      expect(registerInput.confirmPassword).toBeDefined();
    });
  });
});
