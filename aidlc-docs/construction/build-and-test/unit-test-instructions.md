# Unit Test Execution - SwiftTriage

## Overview

SwiftTriage is an MVP application focused on rapid deployment. Unit tests are **recommended but not mandatory** for this phase. This document provides guidance for manual testing and future unit test implementation.

---

## Current Testing Approach: Manual Testing

### Why Manual Testing for MVP?

1. **Rapid Development**: Focus on core functionality first
2. **Simple Architecture**: Straightforward logic with minimal complexity
3. **User Validation**: Manual testing validates user experience
4. **Future Enhancement**: Unit tests can be added incrementally

---

## Manual Testing Checklist

### Test 1: Application Startup

**Objective**: Verify application starts without errors

**Steps**:
\`\`\`bash
npm run dev
\`\`\`

**Expected Result**:
- Server starts on http://localhost:3000
- No compilation errors in console
- No runtime errors in browser console

**Pass Criteria**: ✅ Application loads successfully

---

### Test 2: Home Page

**Objective**: Verify home page renders correctly

**Steps**:
1. Navigate to http://localhost:3000
2. Verify page content displays

**Expected Result**:
- "Welcome to SwiftTriage" heading visible
- Three navigation buttons present:
  - Submit a Ticket
  - IT Staff Dashboard
  - Login
- No console errors

**Pass Criteria**: ✅ All elements render correctly

---

### Test 3: Ticket Submission (Happy Path)

**Objective**: Verify end-to-end ticket submission with AI triage

**Steps**:
1. Navigate to http://localhost:3000/submit
2. Enter IT issue: "My laptop won't turn on. The power button doesn't respond."
3. Click "Submit Ticket"
4. Wait for AI processing

**Expected Result**:
- Loading state displays during submission
- Success message appears
- Ticket ID displayed (8-character code)
- Category assigned (likely "Hardware")
- No errors in console

**Pass Criteria**: ✅ Ticket submitted successfully with AI triage

---

### Test 4: Ticket Submission (Validation)

**Objective**: Verify client-side validation works

**Steps**:
1. Navigate to http://localhost:3000/submit
2. Enter short text: "help"
3. Click "Submit Ticket"

**Expected Result**:
- Validation error displays
- Message: "Issue description must be at least 10 characters"
- Form not submitted
- No API call made

**Pass Criteria**: ✅ Validation prevents invalid submission

---

### Test 5: Groq API Fallback

**Objective**: Verify fallback when Groq API fails

**Steps**:
1. Temporarily set invalid GROQ_API_KEY in `.env.local`
2. Restart server
3. Submit a ticket
4. Check ticket in database

**Expected Result**:
- Ticket still created successfully
- Category set to "Uncategorized"
- Urgency score set to 3
- AI summary is truncated user input
- No application crash

**Pass Criteria**: ✅ Graceful fallback on API failure

---

### Test 6: Authentication (Login)

**Objective**: Verify login functionality

**Steps**:
1. Navigate to http://localhost:3000/login
2. Enter username: `it_admin`
3. Enter password: `password`
4. Click "Login"

**Expected Result**:
- Redirect to /dashboard
- No error messages
- Session cookie set

**Pass Criteria**: ✅ IT staff can log in successfully

---

### Test 7: Dashboard Access Control

**Objective**: Verify role-based access control

**Steps**:
1. Without logging in, navigate to http://localhost:3000/dashboard
2. Observe redirect

**Expected Result**:
- Redirect to /login page
- Dashboard not accessible without authentication

**Pass Criteria**: ✅ Unauthorized access blocked

---

### Test 8: Dashboard Ticket List

**Objective**: Verify IT staff can view tickets

**Steps**:
1. Log in as IT staff (it_admin / password)
2. Navigate to /dashboard
3. Verify ticket list displays

**Expected Result**:
- Statistics panel shows ticket counts
- Ticket list displays all submitted tickets
- Columns visible: Ticket ID, Issue, Category, Urgency, AI Summary, Created
- Tickets sortable by clicking column headers

**Pass Criteria**: ✅ Dashboard displays tickets correctly

---

### Test 9: Dashboard Real-Time Updates

**Objective**: Verify polling mechanism updates dashboard

**Steps**:
1. Open dashboard in one browser tab
2. Submit a new ticket in another tab
3. Wait 5-10 seconds
4. Check if new ticket appears in dashboard

**Expected Result**:
- New ticket appears automatically
- No manual refresh required
- Statistics update

**Pass Criteria**: ✅ Dashboard auto-refreshes with new data

---

### Test 10: Dashboard Statistics

**Objective**: Verify statistics calculations

**Steps**:
1. Submit tickets in different categories
2. View dashboard statistics panel

**Expected Result**:
- Total ticket count accurate
- Category distribution shows counts per category
- Urgency distribution shows counts per level (1-5)
- Average urgency calculated correctly

**Pass Criteria**: ✅ Statistics display accurate data

---

## Manual Test Results Template

Use this template to record test results:

\`\`\`markdown
## Test Execution Date: [YYYY-MM-DD]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Application Startup | ✅ Pass | |
| 2 | Home Page | ✅ Pass | |
| 3 | Ticket Submission (Happy Path) | ✅ Pass | |
| 4 | Ticket Submission (Validation) | ✅ Pass | |
| 5 | Groq API Fallback | ✅ Pass | |
| 6 | Authentication (Login) | ✅ Pass | |
| 7 | Dashboard Access Control | ✅ Pass | |
| 8 | Dashboard Ticket List | ✅ Pass | |
| 9 | Dashboard Real-Time Updates | ✅ Pass | |
| 10 | Dashboard Statistics | ✅ Pass | |

**Overall Status**: [Pass/Fail]
**Tester**: [Name]
**Environment**: [Development/Staging/Production]
\`\`\`

---

## Future Unit Test Implementation

### Recommended Test Framework

For future unit test implementation, use:
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking

### Installation

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
\`\`\`

### Priority Test Coverage

**High Priority**:
1. Groq service (triageTicket function)
2. Validation schemas (Zod)
3. API routes (tickets, stats)
4. Utility functions (format, errors)

**Medium Priority**:
5. React components (TicketSubmissionForm, TicketList)
6. Custom hooks (useTickets, useStats)

**Low Priority**:
7. UI components (Button, Badge)
8. Page components

### Example Unit Test

\`\`\`typescript
// lib/services/groqService.test.ts
import { triageTicket } from './groqService';

describe('groqService', () => {
  describe('triageTicket', () => {
    it('should return triage result for valid input', async () => {
      const result = await triageTicket('My computer won\\'t start');
      
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('urgency_score');
      expect(result).toHaveProperty('ai_summary');
      expect(result.urgency_score).toBeGreaterThanOrEqual(1);
      expect(result.urgency_score).toBeLessThanOrEqual(5);
    });

    it('should return fallback on API error', async () => {
      // Mock Groq API to throw error
      // Verify fallback triage returned
    });
  });
});
\`\`\`

---

## Test Coverage Goals

For future implementation:

- **Overall Coverage**: 70%+
- **Critical Paths**: 90%+ (Groq service, API routes, validation)
- **UI Components**: 60%+ (forms, lists)
- **Utilities**: 80%+ (pure functions)

---

## Continuous Testing

### Pre-Commit Hooks

Add pre-commit hooks to run tests automatically:

\`\`\`bash
npm install --save-dev husky lint-staged
\`\`\`

Configure in `package.json`:
\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["npm run type-check", "npm test"]
  }
}
\`\`\`

---

## Summary

**Current Approach**: Manual testing (10 test scenarios)  
**Future Enhancement**: Automated unit tests with Jest  
**Test Coverage**: Manual testing covers all critical paths  
**Status**: Ready for manual test execution

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for execution
