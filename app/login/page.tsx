/**
 * Login Page - Phase 3 Redesign
 * Split-screen modern authentication page with design system integration
 */

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { trackLogin, trackError, trackButtonClick } from '@/lib/analytics';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if demo credentials should be shown
  const showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
        trackError('Login Failed', 'Invalid credentials', 'Login Page');
      } else {
        // Determine role
        const role = username.startsWith('it_') ? 'it_staff' : 'end_user';
        trackLogin('credentials', role);
        
        // Redirect based on role
        if (role === 'it_staff') {
          router.push('/dashboard');
        } else {
          router.push('/submit');
        }
      }
    } catch (err: any) {
      setError('An error occurred during login');
      trackError('Login Error', err?.message || 'Unknown error', 'Login Page');
    } finally {
      setIsLoading(false);
    }
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
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
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
                }}>
                  JD
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>95% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8" style={{
        backgroundColor: 'var(--gray-100)'
      }}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
              color: 'var(--primary-600)'
            }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-2xl font-black" style={{ color: 'var(--gray-900)' }}>SwiftTriage</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--gray-900)' }}>
              Welcome Back
            </h1>
            <p className="text-lg" style={{ color: 'var(--gray-600)' }}>
              Sign in to access your account
            </p>
          </div>

          {/* Login Card */}
          <div className="card p-8 mb-6">
            <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  placeholder="Enter your username"
                  data-testid="login-username"
                  required
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--gray-500)' }}>
                  💡 Tip: IT staff usernames start with &quot;it_&quot;
                </p>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-600)' }}>
                    Forgot password?
                  </a>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="Enter your password"
                  data-testid="login-password"
                  required
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{
                    accentColor: 'var(--primary-600)'
                  }}
                />
                <label htmlFor="remember" className="ml-2 text-sm" style={{ color: 'var(--gray-700)' }}>
                  Remember me for 30 days
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-lg flex items-start gap-3" data-testid="login-error" style={{
                  backgroundColor: 'var(--error-100)',
                  border: `1px solid var(--error-200)`
                }}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{
                    color: 'var(--error-600)'
                  }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--error-700)' }}>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--gray-300)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-sm" style={{
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-500)'
                }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="btn flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-700)',
                  border: `2px solid var(--gray-300)`
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="btn flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--white)',
                  color: 'var(--gray-700)',
                  border: `2px solid var(--gray-300)`
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          {/* Demo Credentials - Only show when explicitly enabled */}
          {showDemoCredentials && (
            <div className="card p-6" data-testid="demo-credentials">
              <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'var(--gray-700)' }}>
                Demo Credentials
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg" style={{
                  backgroundColor: 'var(--gray-200)'
                }}>
                  <span style={{ color: 'var(--gray-600)' }}>End User:</span>
                  <code className="font-mono" style={{ color: 'var(--gray-900)' }}>user / password</code>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg" style={{
                  backgroundColor: 'var(--primary-100)'
                }}>
                  <span style={{ color: 'var(--gray-600)' }}>IT Staff:</span>
                  <code className="font-mono" style={{ color: 'var(--gray-900)' }}>it_admin / password</code>
                </div>
              </div>
            </div>
          )}

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
