/**
 * Bug Condition Exploration Tests - Credential Visibility
 * 
 * **Validates: Requirements 1.18, 1.19**
 * 
 * CRITICAL: These tests MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the tests or the code when they fail
 * 
 * These tests encode the expected behavior - they will validate the fixes when they pass after implementation
 * 
 * GOAL: Surface counterexamples that demonstrate the credential visibility bug exists
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as fc from 'fast-check';

// Mock Next.js modules
vi.mock('next-auth/react');
vi.mock('next/navigation');

describe('Bug Condition Exploration - Credential Visibility', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    
    // Mock router
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    // Mock signIn
    vi.mocked(signIn).mockResolvedValue({
      error: undefined,
      status: 200,
      ok: true,
      url: null,
    });
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  /**
   * Property 1: Bug Condition - Credentials Should Be Hidden in Production
   * 
   * Demo credentials should NOT be visible when:
   * 1. SHOW_DEMO_CREDENTIALS is undefined
   * 2. SHOW_DEMO_CREDENTIALS is 'false'
   * 3. Environment is production
   * 
   * This test will FAIL on unfixed code because credentials are always visible.
   */

  describe('Credential Visibility - Production Environment', () => {
    it('should hide demo credentials when SHOW_DEMO_CREDENTIALS is undefined', () => {
      // Setup: No environment variable set
      delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

      render(<LoginPage />);

      // EXPECTED BEHAVIOR (will fail on unfixed code):
      // Demo credentials card should NOT be rendered
      
      // Look for the demo credentials section
      const demoCredentialsHeading = screen.queryByText(/Demo Credentials/i);
      const userCredential = screen.queryByText(/user \/ password/i);
      const itAdminCredential = screen.queryByText(/it_admin \/ password/i);

      // All credential elements should be null (not rendered)
      expect(demoCredentialsHeading).toBeNull();
      expect(userCredential).toBeNull();
      expect(itAdminCredential).toBeNull();
    });

    it('should hide demo credentials when SHOW_DEMO_CREDENTIALS is "false"', () => {
      // Setup: Environment variable explicitly set to false
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = 'false';

      render(<LoginPage />);

      // EXPECTED BEHAVIOR (will fail on unfixed code):
      // Demo credentials card should NOT be rendered
      
      const demoCredentialsHeading = screen.queryByText(/Demo Credentials/i);
      const userCredential = screen.queryByText(/user \/ password/i);
      const itAdminCredential = screen.queryByText(/it_admin \/ password/i);

      expect(demoCredentialsHeading).toBeNull();
      expect(userCredential).toBeNull();
      expect(itAdminCredential).toBeNull();
    });

    it('should hide demo credentials when SHOW_DEMO_CREDENTIALS is empty string', () => {
      // Setup: Environment variable set to empty string
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = '';

      render(<LoginPage />);

      // EXPECTED BEHAVIOR (will fail on unfixed code):
      // Demo credentials card should NOT be rendered
      
      const demoCredentialsHeading = screen.queryByText(/Demo Credentials/i);
      const userCredential = screen.queryByText(/user \/ password/i);
      const itAdminCredential = screen.queryByText(/it_admin \/ password/i);

      expect(demoCredentialsHeading).toBeNull();
      expect(userCredential).toBeNull();
      expect(itAdminCredential).toBeNull();
    });

    it('should hide demo credentials when NODE_ENV is production', () => {
      // Setup: Production environment
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

      render(<LoginPage />);

      // EXPECTED BEHAVIOR (will fail on unfixed code):
      // Demo credentials card should NOT be rendered in production
      
      const demoCredentialsHeading = screen.queryByText(/Demo Credentials/i);
      const userCredential = screen.queryByText(/user \/ password/i);
      const itAdminCredential = screen.queryByText(/it_admin \/ password/i);

      expect(demoCredentialsHeading).toBeNull();
      expect(userCredential).toBeNull();
      expect(itAdminCredential).toBeNull();
    });
  });

  /**
   * Property 2: Credentials Should Be Visible Only When Explicitly Enabled
   * 
   * Demo credentials should ONLY be visible when SHOW_DEMO_CREDENTIALS is explicitly 'true'
   */
  describe('Credential Visibility - Development Environment', () => {
    it('should show demo credentials when SHOW_DEMO_CREDENTIALS is "true"', () => {
      // Setup: Environment variable explicitly set to true
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = 'true';

      render(<LoginPage />);

      // EXPECTED BEHAVIOR:
      // Demo credentials card SHOULD be rendered
      
      const demoCredentialsHeading = screen.getByText(/Demo Credentials/i);
      const userCredential = screen.getByText(/user \/ password/i);
      const itAdminCredential = screen.getByText(/it_admin \/ password/i);

      expect(demoCredentialsHeading).toBeInTheDocument();
      expect(userCredential).toBeInTheDocument();
      expect(itAdminCredential).toBeInTheDocument();
    });
  });

  /**
   * Property-Based Test: Credentials Hidden for All Non-True Values
   * 
   * This property test generates various environment variable values
   * and verifies credentials are hidden for all values except 'true'
   */
  it('property: credentials should be hidden for all environment values except "true"', () => {
    const nonTrueValues = [
      undefined,
      '',
      'false',
      'False',
      'FALSE',
      '0',
      'no',
      'off',
      'disabled',
      'True', // Case sensitive - only lowercase 'true' should work
      'TRUE',
      '1',
      'yes',
      'on',
      'enabled',
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...nonTrueValues),
        (envValue) => {
          // Setup environment
          if (envValue === undefined) {
            delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
          } else {
            process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = envValue;
          }

          const { container, unmount } = render(<LoginPage />);

          // EXPECTED: Credentials should be hidden
          const demoCredentialsHeading = screen.queryAllByText(/Demo Credentials/i);
          const userCredential = screen.queryAllByText(/user \/ password/i);
          const itAdminCredential = screen.queryAllByText(/it_admin \/ password/i);

          expect(demoCredentialsHeading.length).toBe(0);
          expect(userCredential.length).toBe(0);
          expect(itAdminCredential.length).toBe(0);

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 15 } // Test all non-true values
    );
  });

  /**
   * Preservation Test: Login Functionality Should Work Regardless of Credential Visibility
   * 
   * This test verifies that hiding credentials doesn't break login functionality
   */
  describe('Login Functionality Preservation', () => {
    it('should render login form when credentials are hidden', () => {
      // Setup: Credentials hidden
      delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

      render(<LoginPage />);

      // EXPECTED: Login form should still be present and functional
      const loginForm = screen.getByTestId('login-form');
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(loginForm).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should render login form when credentials are visible', () => {
      // Setup: Credentials visible
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = 'true';

      render(<LoginPage />);

      // EXPECTED: Login form should still be present and functional
      const loginForm = screen.getByTestId('login-form');
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      expect(loginForm).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });

    it('should render all other page elements when credentials are hidden', () => {
      // Setup: Credentials hidden
      delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

      render(<LoginPage />);

      // EXPECTED: All other page elements should be present
      const welcomeHeading = screen.getByText(/Welcome Back/i);
      const forgotPasswordLink = screen.getByText(/Forgot password\?/i);
      const backToHomeLink = screen.getByText(/Back to home/i);
      const socialLoginButtons = screen.getAllByRole('button', { name: /Google|Microsoft/i });

      expect(welcomeHeading).toBeInTheDocument();
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(backToHomeLink).toBeInTheDocument();
      expect(socialLoginButtons.length).toBeGreaterThan(0);
    });

    it('should render branding and testimonials on left side (desktop)', () => {
      // Setup: Credentials hidden
      delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;

      render(<LoginPage />);

      // EXPECTED: Branding elements should be present
      // Note: Text is split across elements with <br />, so we need to search more flexibly
      const brandingText = screen.getByText(/IT Support That/i);
      const testimonialText = screen.getByText(/SwiftTriage reduced our ticket resolution time by 70%/i);

      expect(brandingText).toBeInTheDocument();
      expect(testimonialText).toBeInTheDocument();
    });
  });

  /**
   * Property-Based Test: Login Form Always Functional
   * 
   * Verifies login form is always present regardless of credential visibility
   */
  it('property: login form should always be functional regardless of credential visibility', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(undefined, '', 'false', 'true'),
        (envValue) => {
          // Setup environment
          if (envValue === undefined) {
            delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
          } else {
            process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = envValue;
          }

          const { unmount } = render(<LoginPage />);

          // EXPECTED: Login form always present
          const loginForms = screen.getAllByTestId('login-form');
          const usernameInputs = screen.getAllByTestId('login-username');
          const passwordInputs = screen.getAllByTestId('login-password');
          const submitButtons = screen.getAllByRole('button', { name: /sign in/i });

          expect(loginForms.length).toBeGreaterThan(0);
          expect(usernameInputs.length).toBeGreaterThan(0);
          expect(passwordInputs.length).toBeGreaterThan(0);
          expect(submitButtons.length).toBeGreaterThan(0);

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });
});
