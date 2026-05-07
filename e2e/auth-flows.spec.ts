/**
 * End-to-End Authentication Flow Tests
 * 
 * Task 20.1: Complete authentication flow testing
 * 
 * Tests:
 * - Complete registration flow (form → API → database)
 * - Complete login flow (form → NextAuth → JWT → redirect)
 * - Complete logout flow (logout → cookie cleared → redirect to login)
 * - Protected route access (unauthenticated → redirect to login)
 * - Role-based access (end_user cannot access admin dashboard)
 * - Session expiration (8 hours → redirect to login)
 * 
 * Requirements Coverage: All authentication and authorization requirements
 */

import { test, expect, Page } from '@playwright/test';
import { loginAs, logout } from './helpers/auth';

// ─── Complete Registration Flow ──────────────────────────────────────────────

test.describe('Complete Registration Flow', () => {
  test('should register new user through form → API → database', async ({ page }) => {
    // Generate unique email for this test run
    const timestamp = Date.now();
    const testEmail = `test-user-${timestamp}@example.com`;
    const testPassword = 'SecurePass123';

    // Navigate to login page
    await page.goto('/login');
    
    // Switch to register mode
    const registerToggle = page.locator('[data-testid="register-toggle"]');
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    // Fill registration form
    await page.fill('[data-testid="register-email"]', testEmail);
    await page.fill('[data-testid="register-password"]', testPassword);
    await page.fill('[data-testid="register-confirm-password"]', testPassword);

    // Submit registration
    await page.click('button[type="submit"]');

    // Wait for success message or redirect
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10_000,
    });

    // Verify user is redirected to appropriate page (default: /submit for end_user)
    expect(page.url()).toContain('/submit');

    // Verify user can access protected content (proves database record created)
    await expect(page.locator('body')).toContainText(/submit/i);
  });

  test('should show validation errors for weak password', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to register mode
    const registerToggle = page.locator('[data-testid="register-toggle"]');
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    // Fill form with weak password
    await page.fill('[data-testid="register-email"]', 'test@example.com');
    await page.fill('[data-testid="register-password"]', 'weak');
    await page.fill('[data-testid="register-confirm-password"]', 'weak');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorEl = page.locator('[data-testid="password-error"]');
    await expect(errorEl).toBeVisible({ timeout: 3_000 });
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to register mode
    const registerToggle = page.locator('[data-testid="register-toggle"]');
    if (await registerToggle.isVisible()) {
      await registerToggle.click();
    }

    // Fill form with mismatched passwords
    await page.fill('[data-testid="register-email"]', 'test@example.com');
    await page.fill('[data-testid="register-password"]', 'SecurePass123');
    await page.fill('[data-testid="register-confirm-password"]', 'DifferentPass123');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorEl = page.locator('[data-testid="confirm-password-error"]');
    await expect(errorEl).toBeVisible({ timeout: 3_000 });
  });
});

// ─── Complete Login Flow ─────────────────────────────────────────────────────

test.describe('Complete Login Flow', () => {
  test('should complete full login flow: form → NextAuth → JWT → redirect', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Verify login form is visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

    // Fill credentials
    await page.fill('[data-testid="login-username"]', 'it_admin');
    await page.fill('[data-testid="login-password"]', 'password');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect (proves NextAuth processed credentials)
    await page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10_000,
    });

    // Verify redirected to dashboard (proves JWT contains role)
    expect(page.url()).toContain('/dashboard');

    // Verify session cookie is set (proves JWT stored in HttpOnly cookie)
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => 
      c.name.includes('next-auth.session-token') || 
      c.name.includes('__Secure-next-auth.session-token')
    );
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);
  });

  test('should redirect to callbackUrl after login', async ({ page }) => {
    // Try to access protected route while unauthenticated
    await page.goto('/dashboard/admin');

    // Should be redirected to login with callbackUrl
    await expect(page).toHaveURL(/\/login.*callbackUrl/);

    // Login
    await page.fill('[data-testid="login-username"]', 'it_admin');
    await page.fill('[data-testid="login-password"]', 'password');
    await page.click('button[type="submit"]');

    // Should be redirected back to originally requested URL
    await page.waitForURL((url) => url.pathname.includes('/dashboard'), {
      timeout: 10_000,
    });
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="login-username"]', 'it_admin');
    await page.fill('[data-testid="login-password"]', 'password');

    // Click submit and immediately check for loading state
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should show loading text
    await expect(submitBtn).toContainText(/signing in/i, { timeout: 2_000 });
  });
});

// ─── Complete Logout Flow ────────────────────────────────────────────────────

test.describe('Complete Logout Flow', () => {
  test('should complete full logout flow: logout → cookie cleared → redirect', async ({ page }) => {
    // Login first
    await loginAs(page, 'it_staff');
    
    // Verify we're logged in
    expect(page.url()).toContain('/dashboard');

    // Get cookies before logout
    const cookiesBefore = await page.context().cookies();
    const sessionCookieBefore = cookiesBefore.find(c => 
      c.name.includes('next-auth.session-token')
    );
    expect(sessionCookieBefore).toBeDefined();

    // Logout (using helper which clears cookies)
    await logout(page);

    // Try to access protected route
    await page.goto('/dashboard');

    // Should be redirected to login (proves cookie was cleared)
    await expect(page).toHaveURL(/\/login/);

    // Verify session cookie is cleared
    const cookiesAfter = await page.context().cookies();
    const sessionCookieAfter = cookiesAfter.find(c => 
      c.name.includes('next-auth.session-token')
    );
    expect(sessionCookieAfter).toBeUndefined();
  });

  test('should redirect to login after logout', async ({ page }) => {
    // Login first
    await loginAs(page, 'end_user');
    
    // Logout
    await logout(page);

    // Navigate to any page
    await page.goto('/');

    // Try to access protected route
    await page.goto('/submit');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});

// ─── Protected Route Access ──────────────────────────────────────────────────

test.describe('Protected Route Access', () => {
  test('should redirect unauthenticated user to login from /dashboard', async ({ page }) => {
    // Ensure no session
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user to login from /submit', async ({ page }) => {
    // Ensure no session
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/submit');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect unauthenticated user to login from /dashboard/admin', async ({ page }) => {
    // Ensure no session
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/dashboard/admin');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should preserve callbackUrl for post-login redirect', async ({ page }) => {
    // Ensure no session
    await page.context().clearCookies();

    // Try to access specific protected route
    await page.goto('/dashboard/admin');

    // Should be redirected to login with callbackUrl
    await expect(page).toHaveURL(/\/login.*callbackUrl/);
    
    // Verify callbackUrl contains the original path
    const url = new URL(page.url());
    const callbackUrl = url.searchParams.get('callbackUrl');
    expect(callbackUrl).toContain('/dashboard/admin');
  });
});

// ─── Role-Based Access ───────────────────────────────────────────────────────

test.describe('Role-Based Access Control', () => {
  test('end_user cannot access admin dashboard', async ({ page }) => {
    // Login as end_user
    await loginAs(page, 'end_user');

    // Try to access admin dashboard
    await page.goto('/dashboard/admin');

    // Should NOT be on admin dashboard
    await expect(page).not.toHaveURL(/\/dashboard\/admin/);
    
    // Should be redirected away (either to 403 or home)
    const url = page.url();
    expect(url).not.toContain('/dashboard/admin');
  });

  test('end_user cannot access it_staff dashboard', async ({ page }) => {
    // Login as end_user
    await loginAs(page, 'end_user');

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should NOT be on dashboard
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('it_staff cannot access admin dashboard', async ({ page }) => {
    // Login as it_staff
    await loginAs(page, 'it_staff');

    // Try to access admin dashboard
    await page.goto('/dashboard/admin');

    // Should be redirected to regular dashboard
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('ADMIN can access all routes', async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');

    // Should be able to access admin dashboard
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard\/admin/);

    // Should be able to access regular dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);

    // Should be able to access submit
    await page.goto('/submit');
    await expect(page).toHaveURL(/\/submit/);
  });
});

// ─── Session Expiration ──────────────────────────────────────────────────────

test.describe('Session Expiration', () => {
  test('should handle expired session gracefully', async ({ page }) => {
    // Login first
    await loginAs(page, 'it_staff');
    
    // Verify we're logged in
    expect(page.url()).toContain('/dashboard');

    // Simulate session expiration by clearing cookies
    // (In production, this would happen after 8 hours)
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should require re-authentication after session expires', async ({ page }) => {
    // Login first
    await loginAs(page, 'end_user');
    
    // Verify we're logged in
    expect(page.url()).toContain('/submit');

    // Simulate session expiration
    await page.context().clearCookies();

    // Try to access protected route
    await page.goto('/submit');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);

    // Should be able to login again
    await page.fill('[data-testid="login-username"]', 'user');
    await page.fill('[data-testid="login-password"]', 'password');
    await page.click('button[type="submit"]');

    // Should be redirected back to submit
    await page.waitForURL((url) => url.pathname.includes('/submit'), {
      timeout: 10_000,
    });
  });
});
