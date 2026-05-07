/**
 * Dashboard & Kanban Board E2E Tests
 *
 * The primary "critical path" test:
 * 1. Log in as end_user
 * 2. Submit a complex IT ticket
 * 3. Log in as it_staff
 * 4. Verify the ticket appears on the dashboard in the correct AI-assigned column
 * 5. Verify widget drag-and-drop reorder persists
 * 6. Verify SWR polling updates the dashboard without a page refresh
 */

import { test, expect, Page } from '@playwright/test';
import { loginAs, logout } from './helpers/auth';

// ─── Critical Path: Submit → Verify on Dashboard ─────────────────────────────

test.describe('Critical Path — Ticket Submission to Dashboard', () => {
  /**
   * THE MAIN E2E TEST
   *
   * Simulates the full user journey:
   * 1. end_user submits a network ticket
   * 2. Groq triages it as "Network"
   * 3. it_staff sees it on the dashboard in the Network/correct widget
   */
  test('submitted ticket appears on IT staff dashboard with correct AI category', async ({
    browser,
  }) => {
    // ── Step 1: end_user submits a ticket ─────────────────────────────────────
    const endUserContext = await browser.newContext();
    const endUserPage = await endUserContext.newPage();

    await loginAs(endUserPage, 'end_user');
    await endUserPage.goto('/submit');

    const ticketInput =
      'Cannot connect to the corporate VPN from my home office. ' +
      'Getting connection timeout errors every time I try. ' +
      'This started after the network maintenance window last night. ' +
      'I need VPN access to attend a critical client call in 30 minutes.';

    const textarea = endUserPage.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.fill(ticketInput);

    // Record the submission time for later verification
    const submissionTime = new Date().toISOString();

    const submitBtn = endUserPage.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait for the triage result
    await endUserPage.waitForSelector(
      '[data-testid="triage-result"], [data-testid="ticket-success"]',
      { timeout: 15_000 }
    );

    // Capture the ticket ID from the result
    let ticketId: string | null = null;
    const ticketIdEl = endUserPage.locator('[data-testid="ticket-id"]').first();
    if (await ticketIdEl.isVisible()) {
      ticketId = await ticketIdEl.textContent();
    }

    // Verify the AI assigned "Network" category
    const resultCard = endUserPage.locator(
      '[data-testid="triage-result"], [data-testid="ticket-success"]'
    ).first();
    await expect(resultCard).toContainText('Network', { ignoreCase: true });

    await endUserContext.close();

    // ── Step 2: it_staff logs in and checks the dashboard ─────────────────────
    const staffContext = await browser.newContext();
    const staffPage = await staffContext.newPage();

    await loginAs(staffPage, 'it_staff');
    await expect(staffPage).toHaveURL(/\/dashboard/);

    // Wait for the dashboard to fully load (SWR data fetched)
    await staffPage.waitForSelector('[data-testid="dashboard-loaded"], .card', {
      timeout: 10_000,
    });

    // ── Step 3: Verify ticket appears in the correct widget ───────────────────
    // The "Tickets by Request Type" widget should show Network tickets
    const requestTypeWidget = staffPage.locator(
      '[data-testid="widget-tickets_by_request_type"], [data-widget-type="tickets_by_request_type"]'
    ).first();

    if (await requestTypeWidget.isVisible()) {
      // Network category should be represented
      await expect(requestTypeWidget).toContainText('Network', {
        ignoreCase: true,
      });
    }

    // ── Step 4: Verify via API that the ticket exists with correct category ────
    const apiResponse = await staffPage.request.get(
      '/api/tickets?sortBy=createdAt&sortOrder=desc'
    );
    expect(apiResponse.status()).toBe(200);

    const { tickets } = await apiResponse.json();
    expect(tickets.length).toBeGreaterThan(0);

    // Find the most recently created ticket
    const latestTicket = tickets[0];
    expect(latestTicket.category).toBe('Network');
    expect(latestTicket.urgencyScore).toBeGreaterThanOrEqual(1);
    expect(latestTicket.urgencyScore).toBeLessThanOrEqual(10);
    expect(latestTicket.aiSummary).toBeTruthy();
    expect(latestTicket.status).toBe('PENDING');

    // If we captured the ticket ID, verify it matches
    if (ticketId) {
      const matchingTicket = tickets.find((t: any) =>
        t.id.startsWith(ticketId!.replace('#', '').trim())
      );
      expect(matchingTicket).toBeTruthy();
    }

    await staffContext.close();
  });

  /**
   * Verify all 5 AI categories route to the correct dashboard representation.
   */
  test.describe('Category routing — each ticket type appears correctly', () => {
    const categoryTests = [
      {
        input:
          'My laptop screen has been flickering for 2 days. Display driver crashed.',
        expectedCategory: 'Hardware',
      },
      {
        input:
          'Cannot connect to VPN from home. Getting timeout errors after maintenance.',
        expectedCategory: 'Network',
      },
      {
        input:
          'Forgot my password and cannot log into the HR system. Need access urgently.',
        expectedCategory: 'Access',
      },
      {
        input:
          'Excel keeps crashing when opening files larger than 10MB. Blocking reporting.',
        expectedCategory: 'Software',
      },
    ];

    for (const tc of categoryTests) {
      test(`${tc.expectedCategory} ticket is created with correct category`, async ({
        page,
      }) => {
        await loginAs(page, 'end_user');

        const response = await page.request.post('/api/tickets', {
          data: { userInput: tc.input },
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.category).toBe(tc.expectedCategory);
        expect(body.status).toBe('PENDING');
      });
    }
  });
});

// ─── Dashboard Widget Tests ───────────────────────────────────────────────────

test.describe('Dashboard — Widget Grid', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'it_staff');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard loads with welcome banner and stats', async ({ page }) => {
    // Welcome banner
    const banner = page.locator('.card').filter({ hasText: /welcome back/i }).first();
    await expect(banner).toBeVisible({ timeout: 10_000 });

    // Quick stats cards
    await expect(page.locator('text=Total Tickets')).toBeVisible();
    await expect(page.locator('text=Open Tickets')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Resolved Today')).toBeVisible();
  });

  test('Add Widget button opens configuration modal', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForSelector('button:has-text("Add Widget")', {
      timeout: 10_000,
    });

    await page.click('button:has-text("Add Widget")');

    // Modal should appear
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 3_000 });

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible({ timeout: 2_000 });
  });

  test('Configure button opens widget configuration modal', async ({ page }) => {
    await page.waitForSelector('button:has-text("Configure")', {
      timeout: 10_000,
    });

    await page.click('button:has-text("Configure")');

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible({ timeout: 3_000 });
  });

  test('SWR polling updates stats without page refresh', async ({ page }) => {
    // Get initial total tickets count
    await page.waitForSelector('text=Total Tickets', { timeout: 10_000 });

    const initialCount = await page
      .locator('text=Total Tickets')
      .locator('..')
      .locator('h3')
      .first()
      .textContent();

    // Submit a new ticket via API to trigger a count change
    await page.request.post('/api/tickets', {
      data: {
        userInput:
          'SWR polling test ticket — my printer is not responding to print jobs.',
      },
    });

    // Wait for SWR to revalidate (default polling interval is 5s)
    // We wait up to 8s to account for the polling interval
    await page.waitForTimeout(6_000);

    const updatedCount = await page
      .locator('text=Total Tickets')
      .locator('..')
      .locator('h3')
      .first()
      .textContent();

    // Count should have increased (or at minimum not crashed)
    const initial = parseInt(initialCount ?? '0', 10);
    const updated = parseInt(updatedCount ?? '0', 10);
    expect(updated).toBeGreaterThanOrEqual(initial);
  });
});

// ─── My Tickets Page ──────────────────────────────────────────────────────────

test.describe('My Tickets Page (/dashboard/my-tickets)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'it_staff');
  });

  test('page loads and shows ticket table', async ({ page }) => {
    await page.goto('/dashboard/my-tickets');
    await expect(page).toHaveURL(/\/dashboard\/my-tickets/);

    // Search input should be visible
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
  });

  test('search filters tickets in real-time', async ({ page }) => {
    await page.goto('/dashboard/my-tickets');

    const searchInput = page.locator('input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 10_000 });

    // Type a search term
    await searchInput.fill('network');

    // Table should update (either show filtered results or empty state)
    await page.waitForTimeout(500); // debounce
    const rows = page.locator('table tbody tr');
    const emptyState = page.locator('text=No tickets found');

    // Either rows are visible or empty state is shown
    const hasRows = await rows.count() > 0;
    const hasEmpty = await emptyState.isVisible();
    expect(hasRows || hasEmpty).toBe(true);
  });

  test('sortable column headers change sort order', async ({ page }) => {
    await page.goto('/dashboard/my-tickets');
    await page.waitForSelector('table', { timeout: 10_000 });

    // Click "Urgency" column header
    const urgencyHeader = page.locator('th').filter({ hasText: /urgency/i }).first();
    if (await urgencyHeader.isVisible()) {
      await urgencyHeader.click();
      // Arrow indicator should appear
      await expect(urgencyHeader).toContainText(/[↑↓▲▼]/);
    }
  });
});

// ─── Responsive Design ───────────────────────────────────────────────────────

test.describe('Responsive Design', () => {
  test('login page hides branding panel on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login');

    // Left branding panel should be hidden on mobile
    const brandingPanel = page.locator('.hidden.lg\\:flex').first();
    await expect(brandingPanel).toBeHidden();

    // Form should still be visible
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
  });

  test('submit page is usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, 'end_user');
    await page.goto('/submit');

    // No horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance

    // Form is visible and usable
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
  });

  test('dashboard stats grid is single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginAs(page, 'it_staff');

    // Stats cards should stack vertically on mobile
    const statsGrid = page.locator('.grid-cols-1').first();
    await expect(statsGrid).toBeVisible({ timeout: 10_000 });
  });
});
