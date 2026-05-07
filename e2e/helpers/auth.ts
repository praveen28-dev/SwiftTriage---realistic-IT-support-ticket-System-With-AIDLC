/**
 * Authentication helpers for Playwright tests.
 *
 * Uses the login form directly (no API shortcuts) so the full auth
 * flow — including JWT issuance and cookie setting — is exercised.
 */

import { Page, expect } from '@playwright/test';

export type UserRole = 'end_user' | 'it_staff' | 'admin';

const CREDENTIALS: Record<UserRole, { username: string; password: string }> = {
  end_user: {
    username: process.env.E2E_END_USER_USERNAME || 'user',
    password: process.env.E2E_END_USER_PASSWORD || 'password',
  },
  it_staff: {
    username: process.env.E2E_IT_STAFF_USERNAME || 'it_admin',
    password: process.env.E2E_IT_STAFF_PASSWORD || 'password',
  },
  admin: {
    username: process.env.E2E_ADMIN_USERNAME || 'it_admin',
    password: process.env.E2E_ADMIN_PASSWORD || 'password',
  },
};

/**
 * Log in via the UI and wait for the post-login redirect to complete.
 * Returns the URL the user was redirected to.
 */
export async function loginAs(page: Page, role: UserRole): Promise<string> {
  const creds = CREDENTIALS[role];

  await page.goto('/login');
  await page.waitForSelector('[data-testid="login-form"]');

  await page.fill('[data-testid="login-username"]', creds.username);
  await page.fill('[data-testid="login-password"]', creds.password);
  await page.click('button[type="submit"]');

  // Wait for navigation away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), {
    timeout: 10_000,
  });

  return page.url();
}

/**
 * Assert the user is currently on the login page (used to verify redirects).
 */
export async function assertRedirectedToLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Log out by clearing the session cookie.
 */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
}
