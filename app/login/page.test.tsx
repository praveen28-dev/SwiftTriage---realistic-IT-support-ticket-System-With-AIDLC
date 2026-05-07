/**
 * Login Page Component Tests
 * 
 * Tests cover:
 * - Mode toggle functionality
 * - Email validation
 * - Password validation
 * - Confirm password validation
 * - Form submission disabled state
 * - Loading states
 * - ARIA attributes for accessibility
 * 
 * Requirements Coverage:
 * - 2.1: Modern UI with proper rendering
 * - 2.5: Field-specific error messages
 * - 7.5: Frontend validation displays errors
 * - 7.6: Form submission prevention until validation passes
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginPage from './page';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  trackLogin: vi.fn(),
  trackError: vi.fn(),
}));

describe('LoginPage', () => {
  const mockPush = vi.fn();
  const mockGet = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup default mocks
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useSearchParams as any).mockReturnValue({ get: mockGet });
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    mockGet.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Mode Toggle', () => {
    it('should start in signin mode by default', () => {
      render(<LoginPage />);
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your account')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in to your account/i })).toBeInTheDocument();
    });

    it('should switch to register mode when toggle is clicked', async () => {
      render(<LoginPage />);
      
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByText('Get started with SwiftTriage today')).toBeInTheDocument();
      });
    });

    it('should show confirm password field in register mode', async () => {
      render(<LoginPage />);
      
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('auth-confirm-password')).toBeInTheDocument();
      });
    });

    it('should hide confirm password field in signin mode', () => {
      render(<LoginPage />);
      
      expect(screen.queryByTestId('auth-confirm-password')).not.toBeInTheDocument();
    });

    it('should clear errors when switching modes', async () => {
      render(<LoginPage />);
      
      // Enter invalid email
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
      
      // Switch mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });

    it('should clear password fields when switching modes', async () => {
      render(<LoginPage />);
      
      // Enter password
      const passwordInput = screen.getByTestId('auth-password');
      fireEvent.change(passwordInput, { target: { value: 'TestPassword123' } });
      
      // Switch mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        expect(passwordInput).toHaveValue('');
      });
    });
  });

  describe('Email Validation', () => {
    it('should display error for invalid email format', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should display error for email without @ symbol', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'invalidemail.com' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should display error for email without domain', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'user@' } });
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should not display error for valid email', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      
      await waitFor(() => {
        expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes for email field', () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      expect(emailInput).toHaveAttribute('aria-label', 'Email address');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when email has error', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Password Validation', () => {
    it('should display error for password less than 8 characters in register mode', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        fireEvent.change(passwordInput, { target: { value: 'Short1' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should display error for password without uppercase letter', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
      });
    });

    it('should display error for password without lowercase letter', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        fireEvent.change(passwordInput, { target: { value: 'PASSWORD123' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
      });
    });

    it('should display error for password without number', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        fireEvent.change(passwordInput, { target: { value: 'PasswordOnly' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      });
    });

    it('should not display error for valid password in register mode', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText(/Password must/)).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes for password field', () => {
      render(<LoginPage />);
      
      const passwordInput = screen.getByTestId('auth-password');
      expect(passwordInput).toHaveAttribute('aria-label', 'Password');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Confirm Password Validation', () => {
    it('should display error when passwords do not match', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should not display error when passwords match', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const passwordInput = screen.getByTestId('auth-password');
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes for confirm password field', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        expect(confirmPasswordInput).toHaveAttribute('aria-label', 'Confirm password');
        expect(confirmPasswordInput).toHaveAttribute('aria-required', 'true');
      });
    });
  });

  describe('Form Submission', () => {
    it('should disable submit button when form is invalid in signin mode', () => {
      render(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /sign in to your account/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid in signin mode', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      const passwordInput = screen.getByTestId('auth-password');
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign in to your account/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should disable submit button when form is invalid in register mode', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create your account/i });
        expect(submitButton).toBeDisabled();
      });
    });

    it('should enable submit button when form is valid in register mode', async () => {
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const emailInput = screen.getByTestId('auth-email');
        const passwordInput = screen.getByTestId('auth-password');
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
      });
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /create your account/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading state during signin submission', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as any).mockResolvedValue({ error: null });
      
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      const passwordInput = screen.getByTestId('auth-password');
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });

    it('should display loading state during registration submission', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Success', user: {} }),
      });
      
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const emailInput = screen.getByTestId('auth-email');
        const passwordInput = screen.getByTestId('auth-password');
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
      });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
      });
    });

    it('should disable submit button during submission', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as any).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      const passwordInput = screen.getByTestId('auth-password');
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign in to your account/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Error Messages ARIA Attributes', () => {
    it('should have role="alert" for general error messages', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as any).mockResolvedValue({ error: 'Invalid credentials' });
      
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      const passwordInput = screen.getByTestId('auth-password');
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        const errorElement = screen.getByTestId('auth-error');
        expect(errorElement).toHaveAttribute('role', 'alert');
      });
    });

    it('should have aria-live="polite" for error messages', async () => {
      const { signIn } = await import('next-auth/react');
      (signIn as any).mockResolvedValue({ error: 'Invalid credentials' });
      
      render(<LoginPage />);
      
      const emailInput = screen.getByTestId('auth-email');
      const passwordInput = screen.getByTestId('auth-password');
      
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password' } });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        const errorElement = screen.getByTestId('auth-error');
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should have role="alert" for success messages', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Success', user: {} }),
      });
      
      render(<LoginPage />);
      
      // Switch to register mode
      const toggleButton = screen.getByTestId('mode-toggle');
      fireEvent.click(toggleButton);
      
      await waitFor(() => {
        const emailInput = screen.getByTestId('auth-email');
        const passwordInput = screen.getByTestId('auth-password');
        const confirmPasswordInput = screen.getByTestId('auth-confirm-password');
        
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123' } });
      });
      
      const form = screen.getByTestId('auth-form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        const successElement = screen.getByTestId('auth-success');
        expect(successElement).toHaveAttribute('role', 'alert');
        expect(successElement).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile logo on small screens', () => {
      render(<LoginPage />);
      
      const mobileLogos = screen.getAllByText('SwiftTriage');
      expect(mobileLogos.length).toBeGreaterThan(0);
    });

    it('should render form with proper structure', () => {
      render(<LoginPage />);
      
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
      expect(screen.getByTestId('auth-email')).toBeInTheDocument();
      expect(screen.getByTestId('auth-password')).toBeInTheDocument();
    });
  });
});
