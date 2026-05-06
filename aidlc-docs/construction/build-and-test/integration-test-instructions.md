# Integration Test Instructions - SwiftTriage

## Purpose

Test interactions between components and services to ensure the complete system works together correctly.

---

## Integration Test Scenarios

### Scenario 1: End-to-End Ticket Submission Flow

**Description**: Test complete flow from form submission through AI triage to database storage

**Components Involved**:
- TicketSubmissionForm (Frontend)
- POST /api/tickets (API Route)
- groqService (Groq AI Integration)
- Database (Neon PostgreSQL via Drizzle)

**Setup**:
1. Ensure development server is running (`npm run dev`)
2. Verify `.env.local` has valid credentials
3. Confirm database is accessible

**Test Steps**:
1. Navigate to http://localhost:3000/submit
2. Enter test issue: "My monitor is flickering and showing strange colors"
3. Click "Submit Ticket"
4. Note the Ticket ID displayed
5. Query database to verify ticket was saved:
   \`\`\`sql
   SELECT * FROM tickets ORDER BY created_at DESC LIMIT 1;
   \`\`\`

**Expected Results**:
- ✅ Form submits without errors
- ✅ Loading state displays during processing
- ✅ Success message shows with Ticket ID
- ✅ Ticket exists in database with:
  - `user_input`: Original text
  - `category`: "Hardware" (AI-generated)
  - `urgency_score`: 2-4 (AI-generated)
  - `ai_summary`: Professional summary
  - `status`: "PENDING"
  - `created_at`: Current timestamp

**Cleanup**: No cleanup needed (tickets can remain in database)

---

### Scenario 2: Dashboard Data Retrieval and Display

**Description**: Test data flow from database through API to dashboard UI

**Components Involved**:
- GET /api/tickets (API Route)
- GET /api/stats (API Route)
- useTickets hook (SWR)
- useStats hook (SWR)
- TicketList component
- StatsPanel component

**Setup**:
1. Ensure at least 5 tickets exist in database (submit via /submit page)
2. Log in as IT staff (it_admin / password)

**Test Steps**:
1. Navigate to http://localhost:3000/dashboard
2. Observe initial data load
3. Verify statistics panel displays
4. Verify ticket list displays
5. Click column header to sort
6. Wait 5-10 seconds for auto-refresh

**Expected Results**:
- ✅ Statistics panel shows:
  - Total ticket count
  - Category distribution
  - Urgency distribution
  - Average urgency
- ✅ Ticket list shows all tickets with:
  - Ticket ID (truncated)
  - User input (truncated)
  - Category badge
  - Urgency badge
  - AI summary
  - Relative timestamp
- ✅ Sorting works (urgency, category, created date)
- ✅ Auto-refresh updates data every 5 seconds

**Cleanup**: No cleanup needed

---

### Scenario 3: Authentication and Authorization Flow

**Description**: Test authentication system and role-based access control

**Components Involved**:
- Login page
- NextAuth.js
- POST /api/auth/signin
- Dashboard page (protected route)

**Setup**:
1. Ensure server is running
2. Clear browser cookies/session

**Test Steps**:
1. Navigate to http://localhost:3000/dashboard (without login)
2. Verify redirect to /login
3. Enter credentials: `it_admin` / `password`
4. Click "Login"
5. Verify redirect to /dashboard
6. Verify dashboard is accessible
7. Log out
8. Try accessing /dashboard again

**Expected Results**:
- ✅ Unauthenticated access to /dashboard redirects to /login
- ✅ Valid credentials allow login
- ✅ Session cookie is set
- ✅ IT staff role grants dashboard access
- ✅ After logout, dashboard is inaccessible again

**Cleanup**: Clear browser cookies

---

### Scenario 4: Groq API Integration with Fallback

**Description**: Test AI triage integration and fallback mechanism

**Components Involved**:
- groqService
- POST /api/tickets
- Groq API (external)

**Setup**:
1. Ensure valid GROQ_API_KEY in `.env.local`

**Test Steps - Happy Path**:
1. Submit ticket with clear hardware issue
2. Verify AI categorization is accurate

**Test Steps - Fallback Path**:
1. Temporarily set invalid GROQ_API_KEY
2. Restart server
3. Submit ticket
4. Check database for fallback values
5. Restore valid GROQ_API_KEY
6. Restart server

**Expected Results - Happy Path**:
- ✅ Groq API returns valid JSON
- ✅ Category is one of: Hardware, Network, Access, Software
- ✅ Urgency score is 1-5
- ✅ AI summary is professional and concise

**Expected Results - Fallback Path**:
- ✅ Ticket still created (no error to user)
- ✅ Category set to "Uncategorized"
- ✅ Urgency score set to 3
- ✅ AI summary is first 100 chars of user input
- ✅ Status set to "PENDING_TRIAGE"
- ✅ Error logged in server console

**Cleanup**: Restore valid GROQ_API_KEY

---

### Scenario 5: Real-Time Dashboard Updates (Polling)

**Description**: Test SWR polling mechanism for real-time updates

**Components Involved**:
- useTickets hook (SWR with refreshInterval)
- useStats hook (SWR with refreshInterval)
- Dashboard page

**Setup**:
1. Open two browser windows side-by-side
2. Window 1: Dashboard (logged in as IT staff)
3. Window 2: Submit page

**Test Steps**:
1. In Window 1, note current ticket count
2. In Window 2, submit a new ticket
3. In Window 1, observe dashboard (do NOT refresh manually)
4. Wait 5-10 seconds
5. Verify new ticket appears

**Expected Results**:
- ✅ New ticket appears in list within 5-10 seconds
- ✅ Statistics update automatically
- ✅ No manual refresh required
- ✅ No console errors

**Cleanup**: No cleanup needed

---

### Scenario 6: Database Connection and Query Performance

**Description**: Test database connectivity and query execution

**Components Involved**:
- Drizzle ORM
- Neon PostgreSQL
- All API routes

**Setup**:
1. Ensure DATABASE_URL is valid
2. Ensure database has 10+ tickets

**Test Steps**:
1. Submit a new ticket (tests INSERT)
2. View dashboard (tests SELECT with filters)
3. Sort tickets by different columns (tests ORDER BY)
4. Check browser network tab for response times

**Expected Results**:
- ✅ INSERT completes in < 500ms
- ✅ SELECT completes in < 300ms
- ✅ No database connection errors
- ✅ Queries return correct data

**Cleanup**: No cleanup needed

---

## Integration Test Execution Checklist

Run through all scenarios and record results:

\`\`\`markdown
## Integration Test Execution

**Date**: [YYYY-MM-DD]  
**Tester**: [Name]  
**Environment**: Development

| Scenario | Status | Notes |
|----------|--------|-------|
| 1. End-to-End Ticket Submission | ✅ Pass | |
| 2. Dashboard Data Retrieval | ✅ Pass | |
| 3. Authentication and Authorization | ✅ Pass | |
| 4. Groq API Integration with Fallback | ✅ Pass | |
| 5. Real-Time Dashboard Updates | ✅ Pass | |
| 6. Database Connection and Performance | ✅ Pass | |

**Overall Status**: [Pass/Fail]
**Issues Found**: [List any issues]
**Action Items**: [List follow-up tasks]
\`\`\`

---

## Troubleshooting Integration Issues

### Issue: Ticket submission fails with 500 error

**Possible Causes**:
- Invalid GROQ_API_KEY
- Database connection failure
- Network timeout

**Debug Steps**:
1. Check server console for error logs
2. Verify environment variables
3. Test database connection
4. Check Groq API status

---

### Issue: Dashboard doesn't show tickets

**Possible Causes**:
- Authentication failure
- Database query error
- SWR caching issue

**Debug Steps**:
1. Verify user is logged in as IT staff
2. Check browser console for errors
3. Check network tab for API responses
4. Clear browser cache and retry

---

### Issue: Polling doesn't update dashboard

**Possible Causes**:
- SWR refreshInterval not configured
- Browser tab not focused
- Network connectivity issues

**Debug Steps**:
1. Verify refreshInterval is set to 5000ms
2. Keep browser tab focused
3. Check network tab for periodic requests
4. Verify API returns new data

---

## Automated Integration Testing (Future)

For future implementation, consider:

**Tools**:
- **Playwright** or **Cypress**: End-to-end testing
- **Supertest**: API endpoint testing
- **Docker Compose**: Test environment setup

**Example Automated Test**:
\`\`\`typescript
// tests/integration/ticket-submission.spec.ts
import { test, expect } from '@playwright/test';

test('submit ticket and verify in dashboard', async ({ page }) => {
  // Submit ticket
  await page.goto('http://localhost:3000/submit');
  await page.fill('[data-testid="ticket-input"]', 'Test issue');
  await page.click('[data-testid="button-primary"]');
  
  // Get ticket ID
  const ticketId = await page.textContent('[data-testid="ticket-id"]');
  
  // Login as IT staff
  await page.goto('http://localhost:3000/login');
  await page.fill('[data-testid="login-username"]', 'it_admin');
  await page.fill('[data-testid="login-password"]', 'password');
  await page.click('[data-testid="button-primary"]');
  
  // Verify ticket in dashboard
  await expect(page.locator(`[data-testid="ticket-row-${ticketId}"]`)).toBeVisible();
});
\`\`\`

---

## Summary

**Total Scenarios**: 6  
**Critical Paths Covered**: All major integrations  
**Automation Ready**: data-testid attributes in place  
**Status**: Ready for manual integration testing

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for execution
