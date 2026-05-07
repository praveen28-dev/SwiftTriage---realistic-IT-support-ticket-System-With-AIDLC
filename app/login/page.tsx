/**
 * Login Page - Secure Authentication System
 * Toggleable Sign In / Create Account form with Zod validation
 * 
 * Security Features:
 * - Frontend validation with Zod schemas
 * - HttpOnly cookies for token storage
 * - Loading states and error boundaries
 * - No social OAuth buttons (credentials only)
 * - CSRF protection via NextAuth
 * - XSS prevention through input sanitization
 * 
 * Accessibility Features:
 * - WCAG 2.1 AA compliant
 * - ARIA labels and attributes
 * - Keyboard navigation support
 * - Screen reader friendly error messages
 * - Focus rings with sufficient contrast
 * 
 * Requirements Coverage:
 * - 2.1: Modern, clean UI design
 * - 2.2: Toggleable signin/register form
 * - 2.3: Form submission with loading states
 * - 2.4: Registration functionality
 * - 2.5: Field-specific error messages
 * - 2.6: ARIA labels for accessibility
 * - 2.7: Responsive design
 * - 7.1-7.7: Frontend validation and sanitization
 * - 9.1-9.2: API integration
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { trackLogin, trackError } from '@/lib/analytics';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

type FormMode = 'signin' | 'register';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function LoginPageContent() {
  // Form mode state
  const [mode, setMode] = useState<FormMode>('signin');
  
  // Form field states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Get callbackUrl from query parameters
  const callbackUrl = searchParams.get('callbackUrl');

  // Handle role-based redirection after successful authentication
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userRole = (session.user as any).role;
      
      // If there's a callbackUrl, redirect there (takes precedence)
      if (callbackUrl) {
        router.push(callbackUrl);
        return;
      }
      
      // Otherwise, redirect based on role
      switch (userRole) {
        case 'ADMIN':
          router.push('/dashboard/admin');
          break;
        case 'it_staff':
          router.push('/dashboard');
          break;
        case 'end_user':
          router.push('/submit');
          break;
        default:
          router.push('/submit'); // Default fallback
      }
    }
  }, [status, session, callbackUrl, router]);

  /**
   * Sanitize input to prevent XSS attacks
   * Escapes HTML special characters
   */
  const sanitizeInput = (input: string): string => {
    return input
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#x27;')
      .replaceAll('/', '&#x2F;');
  };

  /**
   * Validate form fields in real-time
   */
  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    try {
      if (mode === 'signin') {
        // Validate login fields
        if (field === 'email') {
          loginSchema.shape.email.parse(value);
        } else if (field === 'password') {
          loginSchema.shape.password.parse(value);
        }
        return undefined;
      }
      
      // Validate registration fields
      // Use .innerType() to access shape when schema has .refine()
      const baseSchema = registerSchema.innerType();
      
      if (field === 'email') {
        baseSchema.shape.email.parse(value);
      } else if (field === 'password') {
        baseSchema.shape.password.parse(value);
      } else if (field === 'confirmPassword') {
        // For confirmPassword, check it against the password field
        if (value !== password) {
          return 'Passwords do not match';
        }
      }
      return undefined;
    } catch (error) {
      if (error instanceof ZodError) {
        return error.errors[0]?.message;
      }
      return 'Invalid input';
    }
  };

  /**
   * Handle input change with real-time validation
   */
  const handleInputChange = (field: keyof FormErrors, value: string) => {
    // Update field value
    if (field === 'email') setEmail(value);
    else if (field === 'password') setPassword(value);
    else if (field === 'confirmPassword') setConfirmPassword(value);

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }

    // Validate field and update errors
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Handle mode toggle between signin and register
   */
  const handleModeToggle = () => {
    setMode(prev => prev === 'signin' ? 'register' : 'signin');
    setErrors({});
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  /**
   * Validate entire form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    try {
      if (mode === 'signin') {
        loginSchema.parse({ email, password });
      } else {
        registerSchema.parse({ email, password, confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach(err => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  /**
   * Handle form submission for signin
   */
  const handleSignIn = async () => {
    try {
      const result = await signIn('credentials', {
        email: sanitizeInput(email),
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid credentials. Please try again.' });
        trackError('Login Failed', 'Invalid credentials', 'Login Page');
      } else {
        trackLogin('credentials', 'unknown');
        // Redirection handled by useEffect
      }
    } catch (err: any) {
      setErrors({ general: 'An error occurred during login' });
      trackError('Login Error', err?.message || 'Unknown error', 'Login Page');
    }
  };

  /**
   * Handle form submission for registration
   */
  const handleRegister = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(email),
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ email: 'Email already exists' });
        } else if (response.status === 400 && data.details) {
          // Handle validation errors from backend
          const newErrors: FormErrors = {};
          Object.entries(data.details).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              newErrors[field as keyof FormErrors] = messages[0];
            }
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
        trackError('Registration Failed', data.error || 'Unknown error', 'Login Page');
        return;
      }

      // Registration successful
      setSuccessMessage('Account created successfully! Signing you in...');
      
      // Automatically sign in after successful registration
      setTimeout(async () => {
        await signIn('credentials', {
          email: sanitizeInput(email),
          password,
          redirect: false,
        });
      }, 1000);
    } catch (err: any) {
      setErrors({ general: 'An error occurred during registration' });
      trackError('Registration Error', err?.message || 'Unknown error', 'Login Page');
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrors({});
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await handleSignIn();
      } else {
        await handleRegister();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if form is valid for submission
   */
  const isFormValid = (): boolean => {
    if (mode === 'signin') {
      return email.length > 0 && password.length > 0 && !errors.email && !errors.password;
    } else {
      return (
        email.length > 0 &&
        password.length > 0 &&
        confirmPassword.length > 0 &&
        !errors.email &&
        !errors.password &&
        !errors.confirmPassword
      );
    }
  };

  /**
   * Get button text based on mode and submission state
   */
  const getButtonText = (): string => {
    if (isSubmitting) {
      return mode === 'signin' ? 'Signing in...' : 'Creating account...';
    }
    return mode === 'signin' ? 'Sign In' : 'Create Account';
  };

  return (
    <main className="min-h-screen flex">
      {/* Left Side - Branding & Testimonials */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-900) 100%)'
      }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-2xl font-black">SwiftTriage</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black mb-4 leading-tight">
                IT Support That
                <br />
                Never Sleeps
              </h2>
              <p className="text-xl text-white/90">
                AI-powered ticket triage in seconds, not hours
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">AI-Powered Automation</h3>
                  <p className="text-white/80">Automatically categorize and prioritize tickets</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Real-Time Analytics</h3>
                  <p className="text-white/80">Customizable dashboards with live metrics</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Enterprise Security</h3>
                  <p className="text-white/80">SOC 2 compliant with role-based access</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="p-6 rounded-xl" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex gap-1 mb-3" role="img" aria-label="5 star rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-white/90 mb-3 italic">
                &quot;SwiftTriage reduced our ticket resolution time by 70%. The AI triage is incredibly accurate.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }} aria-hidden="true">
                  PA
                </div>
                <div>
                  <p className="font-semibold">Praveen A</p>
                  <p className="text-sm text-white/70">IT Director, TechCorp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>95% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{
        backgroundColor: 'var(--gray-100)'
      }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
              color: 'var(--primary-600)'
            }} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-2xl font-black" style={{ color: 'var(--gray-900)' }}>SwiftTriage</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--gray-900)' }}>
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-lg" style={{ color: 'var(--gray-600)' }}>
              {mode === 'signin' 
                ? 'Sign in to access your account' 
                : 'Get started with SwiftTriage today'}
            </p>
          </div>

          {/* Form Card */}
          <div className="card p-8 mb-6">
            <form onSubmit={handleSubmit} data-testid="auth-form" className="space-y-6" noValidate>
              {/* Email Field */}
              <Input
                id="email"
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                required
                fullWidth
                aria-label="Email address"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                data-testid="auth-email"
              />

              {/* Password Field */}
              <Input
                id="password"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                placeholder={mode === 'signin' ? 'Enter your password' : 'Min 8 chars, 1 uppercase, 1 number'}
                required
                fullWidth
                aria-label="Password"
                aria-required="true"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                data-testid="auth-password"
              />

              {/* Confirm Password Field (Register mode only) */}
              {mode === 'register' && (
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Re-enter your password"
                  required
                  fullWidth
                  aria-label="Confirm password"
                  aria-required="true"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  data-testid="auth-confirm-password"
                />
              )}

              {/* Forgot Password Link (Sign in mode only) */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor: 'var(--primary-600)'
                      }}
                      aria-label="Remember me for 30 days"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm" style={{ color: 'var(--gray-700)' }}>
                      Remember me for 30 days
                    </label>
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium hover:underline"
                    style={{ color: 'var(--primary-600)' }}
                    onClick={() => {
                      // Password reset functionality is planned for future implementation (Requirement 14)
                      alert('Password reset functionality coming soon!');
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* General Error Message */}
              {errors.general && (
                <div 
                  className="p-4 rounded-lg flex items-start gap-3" 
                  data-testid="auth-error" 
                  role="alert"
                  aria-live="polite"
                  style={{
                    backgroundColor: 'var(--error-100)',
                    border: `1px solid var(--error-200)`
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                    color: 'var(--error-600)'
                  }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--error-700)' }}>{errors.general}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div 
                  className="p-4 rounded-lg flex items-start gap-3" 
                  data-testid="auth-success"
                  role="alert"
                  aria-live="polite"
                  style={{
                    backgroundColor: 'var(--success-100)',
                    border: `1px solid var(--success-200)`
                  }}
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                    color: 'var(--success-600)'
                  }} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--success-700)' }}>{successMessage}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={!isFormValid() || isSubmitting}
                className="w-full"
                aria-label={mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
              >
                {getButtonText()}
              </Button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center">
              <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
                {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                {' '}
                <button
                  type="button"
                  onClick={handleModeToggle}
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--primary-600)' }}
                  data-testid="mode-toggle"
                  aria-label={mode === 'signin' ? 'Switch to create account' : 'Switch to sign in'}
                >
                  {mode === 'signin' ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm hover:underline transition-colors" style={{
              color: 'var(--gray-600)'
            }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Login Page with Suspense Boundary
 * Wraps LoginPageContent in Suspense to handle useSearchParams()
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-600)' }}></div>
          <p className="mt-4 text-lg" style={{ color: 'var(--gray-600)' }}>Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
