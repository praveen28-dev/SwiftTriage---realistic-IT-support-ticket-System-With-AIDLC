/**
 * Auth & RBAC E2E Tests
 *
 * Covers:
 * - Login happy path for each role
 * - Role-based redirect after login
 * - end_user cannot access it_staff routes
 * - it_staff cannot access ADMIN routes
 * - Unauthenticated access redirects to /login
 * - Invalid credentials show error message
 */

import { test, expect } from '@playwright/test';
import { loginAs, assertRedirectedToLogin, logout } from './helpers/auth';

// ─── Login happy paths ────────────────────────────────────────────────────────

test.describe('Login — happy paths', () => {
  test('end_user logs in and is redirected to /submit', async ({ page }) => {
    const redirectUrl = await loginAs(page, 'end_user');
    expect(redirectUrl).toContain('/submit');
  });

  test('it_staff logs in and is redirected to /dashboard', async ({ page }) => {
    const redirectUrl = await loginAs(page, 'it_staff');
    expect(redirectUrl).toContain('/dashboard');
  });

  test('login form shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-username"]', 'nonexistent_user');
    await page.fill('[data-testid="login-password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Error message should appear
    const errorEl = page.locator('[data-testid="login-error"]');
    await expect(errorEl).toBeVisible({ timeout: 5_000 });
    await expect(errorEl).toContainText(/invalid credentials/i);

    // Should stay on /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('login button shows loading state during submission', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-username"]', 'it_admin');
    await page.fill('[data-testid="login-password"]', 'password');

    // Click and immediately check for loading state
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Button should show loading text briefly
    await expect(submitBtn).toContainText(/signing in/i, { timeout: 2_000 });
  });
});

// ─── Unauthenticated access ───────────────────────────────────────────────────

test.describe('Unauthenticated access — redirects to /login', () => {
  test('GET /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await assertRedirectedToLogin(page);
  });

  test('GET /dashboard/my-tickets redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/my-tickets');
    await assertRedirectedToLogin(page);
  });

  test('GET /dashboard/admin redirects to /login', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await assertRedirectedToLogin(page);
  });
});

// ─── end_user RBAC ───────────────────────────────────────────────────────────

test.describe('end_user — cannot access it_staff routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'end_user');
  });

  test('navigating to /dashboard redirects to home', async ({ page }) => {
    await page.goto('/dashboard');
    // Should be redirected away from /dashboard
    await expect(page).not.toHaveURL(/\/dashboard$/);
  });

  test('GET /api/tickets returns 401', async ({ request, page }) => {
    // Use the browser context that has the end_user session cookie
    const response = await page.request.get('/api/tickets');
    expect(response.status()).toBe(401);
  });

  test('GET /api/stats returns 401', async ({ page }) => {
    const response = await page.request.get('/api/stats');
    expect(response.status()).toBe(401);
  });

  test('GET /api/customers returns 401', async ({ page }) => {
    const response = await page.request.get('/api/customers');
    expect(response.status()).toBe(401);
  });
});

// ─── it_staff RBAC ───────────────────────────────────────────────────────────

test.describe('it_staff — cannot access ADMIN routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'it_staff');
  });

  test('navigating to /dashboard/admin redirects to /dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin');
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('GET /api/audit-log returns 401', async ({ page }) => {
    const response = await page.request.get('/api/audit-log');
    expect(response.status()).toBe(401);
  });

  test('GET /api/users returns 401', async ({ page }) => {
    const response = await page.request.get('/api/users');
    expect(response.status()).toBe(401);
  });

  test('PATCH /api/users/{id} returns 401', async ({ page }) => {
    const response = await page.request.patch('/api/users/some-user-id', {
      data: { role: 'ADMIN' },
    });
    expect(response.status()).toBe(401);
  });
});

// ─── ADMIN access ────────────────────────────────────────────────────────────

test.describe('ADMIN — can access all routes', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin');
  });

  test('GET /api/audit-log returns 200', async ({ page }) => {
    const response = await page.request.get('/api/audit-log?limit=5');
    expect(response.status()).toBe(200);
  });

  test('GET /api/users returns 200', async ({ page }) => {
    const response = await page.request.get('/api/users');
    expect(response.status()).toBe(200);
  });

  test('GET /api/tickets returns 200', async ({ page }) => {
    const response = await page.request.get('/api/tickets');
    expect(response.status()).toBe(200);
  });
});
