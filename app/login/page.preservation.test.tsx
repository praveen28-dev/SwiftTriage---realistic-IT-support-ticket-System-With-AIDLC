/**
 * Preservation Property Tests - Login Functionality
 * 
 * **Validates: Requirements 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16**
 * 
 * IMPORTANT: These tests verify working login functionality that must be preserved after fixes
 * These tests should PASS on UNFIXED code - they capture baseline behavior
 * 
 * GOAL: Ensure login functionality remains unchanged after implementing credential visibility fix
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import * as fc from 'fast-check';

// Mock Next.js modules
vi.mock('next-auth/react');
vi.mock('next/navigation');

describe('Preservation Property Tests - Login Functionality', () => {
  const originalEnv = process.env;
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
    
    // Mock router
    mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    // Mock signIn - default to success
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
    vi.clearAllMocks();
  });

  /**
   * Property 4: Preservation - Login Form Always Renders
   * 
   * The login form should always be present and functional regardless of
   * credential visibility settings.
   */

  describe('Login Form Rendering Preservation', () => {
    it('should render complete login form with all elements', () => {
      render(<LoginPage />);

      // Observe: All form elements are present
      const loginForm = screen.getByTestId('login-form');
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      expect(loginForm).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(rememberCheckbox).toBeInTheDocument();
    });

    it('should render username field with correct attributes', () => {
      render(<LoginPage />);

      // Observe: Username field has correct properties
      const usernameInput = screen.getByTestId('login-username');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('placeholder', 'Enter your username');
      expect(usernameInput).toBeRequired();
    });

    it('should render password field with correct attributes', () => {
      render(<LoginPage />);

      // Observe: Password field has correct properties
      const passwordInput = screen.getByTestId('login-password');
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
      expect(passwordInput).toBeRequired();
    });

    it('should render submit button', () => {
      render(<LoginPage />);

      // Observe: Submit button is present and enabled
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
      expect(submitButton).not.toBeDisabled();
    });
  });

  /**
   * Preservation: Valid Credentials Authentication
   * 
   * Valid credentials should authenticate successfully and redirect appropriately.
   */

  describe('Valid Credentials Authentication Preservation', () => {
    it('should authenticate successfully with valid end user credentials', async () => {
      const user = userEvent.setup();
      
      // Setup: Mock successful authentication
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      // Observe: User can enter credentials and submit
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'user');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Observe: signIn was called with correct credentials
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          username: 'user',
          password: 'password',
          redirect: false,
        });
      });
    });

    it('should authenticate successfully with valid IT staff credentials', async () => {
      const user = userEvent.setup();
      
      // Setup: Mock successful authentication
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      // Observe: User can enter IT staff credentials and submit
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'it_admin');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Observe: signIn was called with correct credentials
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          username: 'it_admin',
          password: 'password',
          redirect: false,
        });
      });
    });
  });

  /**
   * Preservation: Invalid Credentials Error Handling
   * 
   * Invalid credentials should show an error message without crashing.
   */

  describe('Invalid Credentials Error Handling Preservation', () => {
    it('should display error message for invalid credentials', async () => {
      const user = userEvent.setup();
      
      // Setup: Mock authentication failure
      vi.mocked(signIn).mockResolvedValue({
        error: 'CredentialsSignin',
        status: 401,
        ok: false,
        url: null,
      });

      render(<LoginPage />);

      // Observe: User enters invalid credentials
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'invalid');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      // Observe: Error message is displayed
      await waitFor(() => {
        const errorMessage = screen.getByTestId('login-error');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/invalid credentials/i);
      });
    });

    it('should clear error message on new submission attempt', async () => {
      const user = userEvent.setup();
      
      // Setup: First attempt fails, second succeeds
      vi.mocked(signIn)
        .mockResolvedValueOnce({
          error: 'CredentialsSignin',
          status: 401,
          ok: false,
          url: null,
        })
        .mockResolvedValueOnce({
          error: undefined,
          status: 200,
          ok: true,
          url: null,
        });

      render(<LoginPage />);

      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt - fails
      await user.type(usernameInput, 'invalid');
      await user.type(passwordInput, 'wrong');
      await user.click(submitButton);

      // Observe: Error appears
      await waitFor(() => {
        expect(screen.getByTestId('login-error')).toBeInTheDocument();
      });

      // Second attempt - succeeds
      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'user');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Observe: Error is cleared
      await waitFor(() => {
        expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
      });
    });
  });

  /**
   * Preservation: Role-Based Redirect
   * 
   * IT staff should redirect to /dashboard, end users to /submit.
   */

  describe('Role-Based Redirect Preservation', () => {
    it('should redirect IT staff to /dashboard after successful login', async () => {
      const user = userEvent.setup();
      
      // Setup: Mock successful authentication
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      // Observe: IT staff logs in
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'it_admin');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Observe: Redirects to /dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect end users to /submit after successful login', async () => {
      const user = userEvent.setup();
      
      // Setup: Mock successful authentication
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        status: 200,
        ok: true,
        url: null,
      });

      render(<LoginPage />);

      // Observe: End user logs in
      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'user');
      await user.type(passwordInput, 'password');
      await user.click(submitButton);

      // Observe: Redirects to /submit
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/submit');
      });
    });

    it('property: role-based redirect works for any username pattern', async () => {
      // Test with specific examples instead of property-based to avoid cleanup issues
      const testCases = [
        { username: 'user', password: 'password', expectedRedirect: '/submit' },
        { username: 'it_admin', password: 'password', expectedRedirect: '/dashboard' },
        { username: 'it_staff', password: 'password', expectedRedirect: '/dashboard' },
        { username: 'enduser', password: 'password', expectedRedirect: '/submit' },
        { username: 'it_', password: 'password', expectedRedirect: '/dashboard' },
      ];

      for (const testCase of testCases) {
        const user = userEvent.setup();
        
        // Setup: Mock successful authentication
        vi.mocked(signIn).mockResolvedValue({
          error: undefined,
          status: 200,
          ok: true,
          url: null,
        });

        const { unmount } = render(<LoginPage />);

        const usernameInput = screen.getByTestId('login-username');
        const passwordInput = screen.getByTestId('login-password');
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(usernameInput, testCase.username);
        await user.type(passwordInput, testCase.password);
        await user.click(submitButton);

        // Observe: Redirect based on username pattern
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(testCase.expectedRedirect);
        });

        // Cleanup
        unmount();
        vi.clearAllMocks();
      }
    });
  });

  /**
   * Preservation: Branding and Testimonials Display
   * 
   * Left side branding, testimonials, and trust badges should render correctly.
   */

  describe('Branding and Testimonials Preservation', () => {
    it('should render branding section with main heading', () => {
      render(<LoginPage />);

      // Observe: Main branding heading is present
      const brandingHeading = screen.getByText(/IT Support That/i);
      expect(brandingHeading).toBeInTheDocument();
    });

    it('should render key benefits section', () => {
      render(<LoginPage />);

      // Observe: Key benefits are displayed
      const aiPowered = screen.getByText(/AI-Powered Automation/i);
      const realTime = screen.getByText(/Real-Time Analytics/i);
      const security = screen.getByText(/Enterprise Security/i);

      expect(aiPowered).toBeInTheDocument();
      expect(realTime).toBeInTheDocument();
      expect(security).toBeInTheDocument();
    });

    it('should render testimonial section', () => {
      render(<LoginPage />);

      // Observe: Testimonial is displayed
      const testimonialText = screen.getByText(/SwiftTriage reduced our ticket resolution time by 70%/i);
      const testimonialAuthor = screen.getByText(/Praveen A/i);
      const testimonialTitle = screen.getByText(/IT Director, TechCorp/i);

      expect(testimonialText).toBeInTheDocument();
      expect(testimonialAuthor).toBeInTheDocument();
      expect(testimonialTitle).toBeInTheDocument();
    });

    it('should render trust badges', () => {
      render(<LoginPage />);

      // Observe: Trust badges are displayed
      const socBadge = screen.getByText(/SOC 2 Certified/i);
      const satisfactionBadge = screen.getByText(/95% Satisfaction/i);

      expect(socBadge).toBeInTheDocument();
      expect(satisfactionBadge).toBeInTheDocument();
    });
  });

  /**
   * Preservation: Social Login Buttons
   * 
   * Social login buttons should be displayed.
   */

  describe('Social Login Buttons Preservation', () => {
    it('should render Google login button', () => {
      render(<LoginPage />);

      // Observe: Google button is present
      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toBeInTheDocument();
    });

    it('should render Microsoft login button', () => {
      render(<LoginPage />);

      // Observe: Microsoft button is present
      const microsoftButton = screen.getByRole('button', { name: /microsoft/i });
      expect(microsoftButton).toBeInTheDocument();
    });

    it('should render social login divider', () => {
      render(<LoginPage />);

      // Observe: Divider text is present
      const divider = screen.getByText(/Or continue with/i);
      expect(divider).toBeInTheDocument();
    });
  });

  /**
   * Preservation: Forgot Password and Back to Home Links
   * 
   * Navigation links should be present and functional.
   */

  describe('Navigation Links Preservation', () => {
    it('should render "Forgot password?" link', () => {
      render(<LoginPage />);

      // Observe: Forgot password link is present
      const forgotPasswordLink = screen.getByText(/Forgot password\?/i);
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '#');
    });

    it('should render "Back to home" link', () => {
      render(<LoginPage />);

      // Observe: Back to home link is present
      const backToHomeLink = screen.getByText(/Back to home/i);
      expect(backToHomeLink).toBeInTheDocument();
      expect(backToHomeLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  /**
   * Preservation: Welcome Message and Headers
   * 
   * Page headers and welcome message should render correctly.
   */

  describe('Page Headers Preservation', () => {
    it('should render "Welcome Back" heading', () => {
      render(<LoginPage />);

      // Observe: Welcome heading is present
      const welcomeHeading = screen.getByText(/Welcome Back/i);
      expect(welcomeHeading).toBeInTheDocument();
    });

    it('should render sign in instruction text', () => {
      render(<LoginPage />);

      // Observe: Instruction text is present
      const instructionText = screen.getByText(/Sign in to access your account/i);
      expect(instructionText).toBeInTheDocument();
    });
  });

  /**
   * Preservation: Credentials Display in Development
   * 
   * When SHOW_DEMO_CREDENTIALS is explicitly set to 'true', credentials should display.
   */

  describe('Credentials Display in Development Preservation', () => {
    it('should display demo credentials when SHOW_DEMO_CREDENTIALS is "true"', () => {
      // Setup: Environment variable explicitly set to true
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = 'true';

      render(<LoginPage />);

      // Observe: Demo credentials card is rendered
      const demoCredentialsHeading = screen.getByText(/Demo Credentials/i);
      const userCredential = screen.getByText(/user \/ password/i);
      const itAdminCredential = screen.getByText(/it_admin \/ password/i);

      expect(demoCredentialsHeading).toBeInTheDocument();
      expect(userCredential).toBeInTheDocument();
      expect(itAdminCredential).toBeInTheDocument();
    });

    it('should display both end user and IT staff credentials', () => {
      // Setup: Environment variable explicitly set to true
      process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = 'true';

      render(<LoginPage />);

      // Observe: Both credential types are shown
      const endUserLabel = screen.getByText(/End User:/i);
      const itStaffLabel = screen.getByText(/IT Staff:/i);

      expect(endUserLabel).toBeInTheDocument();
      expect(itStaffLabel).toBeInTheDocument();
    });
  });

  /**
   * Property-Based Test: Login Form Always Functional
   * 
   * Verifies that the login form is always present and functional regardless
   * of environment configuration.
   */

  it('property: login form is always functional regardless of environment', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(undefined, '', 'false', 'true', 'production', 'development'),
        (envValue) => {
          // Setup environment
          if (envValue === undefined) {
            delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
          } else {
            process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = envValue;
          }

          const { unmount } = render(<LoginPage />);

          // EXPECTED: Login form always present
          const loginForm = screen.getByTestId('login-form');
          const usernameInput = screen.getByTestId('login-username');
          const passwordInput = screen.getByTestId('login-password');
          const submitButton = screen.getByRole('button', { name: /sign in/i });

          expect(loginForm).toBeInTheDocument();
          expect(usernameInput).toBeInTheDocument();
          expect(passwordInput).toBeInTheDocument();
          expect(submitButton).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property-Based Test: All Page Elements Always Present
   * 
   * Verifies that all non-credential page elements are always rendered.
   */

  it('property: all page elements render correctly regardless of credential visibility', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(undefined, 'false', 'true'),
        (envValue) => {
          // Setup environment
          if (envValue === undefined) {
            delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
          } else {
            process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = envValue;
          }

          const { unmount } = render(<LoginPage />);

          // EXPECTED: All core page elements always present
          const welcomeHeading = screen.getByText(/Welcome Back/i);
          const forgotPasswordLink = screen.getByText(/Forgot password\?/i);
          const backToHomeLink = screen.getByText(/Back to home/i);
          const googleButton = screen.getByRole('button', { name: /google/i });
          const microsoftButton = screen.getByRole('button', { name: /microsoft/i });

          expect(welcomeHeading).toBeInTheDocument();
          expect(forgotPasswordLink).toBeInTheDocument();
          expect(backToHomeLink).toBeInTheDocument();
          expect(googleButton).toBeInTheDocument();
          expect(microsoftButton).toBeInTheDocument();

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property-Based Test: Authentication Flow Works Consistently
   * 
   * Verifies that authentication works the same way regardless of
   * credential visibility settings.
   */

  it('property: authentication flow works consistently regardless of credential visibility', async () => {
    // Test with specific examples instead of property-based to avoid cleanup issues
    const testCases = [
      { envValue: undefined, username: 'user', password: 'password' },
      { envValue: 'false', username: 'it_admin', password: 'password' },
      { envValue: 'true', username: 'testuser', password: 'testpass' },
    ];

    for (const testCase of testCases) {
      const user = userEvent.setup();
      
      // Setup environment
      if (testCase.envValue === undefined) {
        delete process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
      } else {
        process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS = testCase.envValue;
      }

      // Setup: Mock successful authentication
      vi.mocked(signIn).mockResolvedValue({
        error: undefined,
        status: 200,
        ok: true,
        url: null,
      });

      const { unmount } = render(<LoginPage />);

      const usernameInput = screen.getByTestId('login-username');
      const passwordInput = screen.getByTestId('login-password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, testCase.username);
      await user.type(passwordInput, testCase.password);
      await user.click(submitButton);

      // EXPECTED: Authentication called correctly
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('credentials', {
          username: testCase.username,
          password: testCase.password,
          redirect: false,
        });
      });

      // Cleanup
      unmount();
      vi.clearAllMocks();
    }
  });
});
