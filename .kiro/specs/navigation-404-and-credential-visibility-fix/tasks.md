# Implementation Plan

## Overview

This implementation plan follows the exploratory bugfix workflow:
1. **Explore** - Write tests BEFORE fix to understand the bugs (Bug Condition)
2. **Preserve** - Write tests for non-buggy behavior (Preservation Requirements)
3. **Implement** - Apply the fixes with understanding (Expected Behavior)
4. **Validate** - Verify fixes work and don't break anything

## Tasks

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - Navigation 404 Errors and Credential Visibility
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope the properties to the concrete failing cases to ensure reproducibility
  
  **Navigation 404 Tests:**
  - Test that clicking "My Tickets" link navigates to `/my-tickets` (will fail with 404 on unfixed code)
  - Test that clicking "Admin" link navigates to `/admin` (will fail with 404 on unfixed code)
  - Test that clicking "Knowledge Base" link navigates to `/knowledge` (will fail with 404 on unfixed code)
  - Test that clicking "Users" link navigates to `/users` (will fail with 404 on unfixed code)
  - Test that clicking "Reports" link navigates to `/reports` (will fail with 404 on unfixed code)
  - The test assertions should verify that navigation items are either disabled/hidden OR navigate successfully (no 404s)
  
  **Credential Visibility Tests:**
  - Test that login page without SHOW_DEMO_CREDENTIALS set hides credentials (will fail on unfixed code - credentials visible)
  - Test that login page with SHOW_DEMO_CREDENTIALS=false hides credentials (will fail on unfixed code - credentials visible)
  - Test that login page in production environment hides credentials (will fail on unfixed code - credentials visible)
  - The test assertions should verify that demo credentials card is NOT rendered when environment is production or SHOW_DEMO_CREDENTIALS is not explicitly true
  
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes:
    - Navigation: Which links cause 404 errors
    - Credentials: When credentials are visible inappropriately
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 1.14, 1.15, 1.16, 1.17, 1.18, 1.19_

- [x] 2. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Working Navigation and Login Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  
  **Working Navigation Preservation Tests:**
  - Observe: Clicking "Dashboard" navigates to `/dashboard` successfully on unfixed code
  - Observe: IT staff clicking "Customers" navigates to `/customers` successfully on unfixed code
  - Observe: Clicking "New Ticket" button navigates to `/submit` successfully on unfixed code
  - Observe: Clicking SwiftTriage logo navigates to `/dashboard` successfully on unfixed code
  - Observe: Role-based visibility (IT staff vs end user) works correctly on unfixed code
  - Observe: Sidebar collapse/expand functionality works on unfixed code
  - Write property-based tests: For all working navigation links (Dashboard, Customers, Submit), navigation succeeds and produces expected routes
  
  **Login Functionality Preservation Tests:**
  - Observe: Valid credentials authenticate successfully on unfixed code
  - Observe: Invalid credentials show error message on unfixed code
  - Observe: IT staff (username starting with "it_") redirect to `/dashboard` on unfixed code
  - Observe: End users redirect to `/submit` on unfixed code
  - Observe: Login form, branding, testimonials, social login buttons render correctly on unfixed code
  - Observe: "Forgot password?" and "Back to home" links work on unfixed code
  - Write property-based tests: For all login interactions not involving demo credentials, behavior matches observed patterns
  
  **Credentials Display in Development:**
  - Observe: When SHOW_DEMO_CREDENTIALS=true, credentials should display (test this behavior)
  - Write test: Verify credentials display when explicitly enabled
  
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16_

- [x] 3. Fix for Navigation 404 Errors and Credential Visibility

  - [x] 3.1 Implement navigation fix in Sidebar component
    - Add `disabled` and `comingSoon` properties to NavItem interface in `app/components/layout/Sidebar.tsx`
    - Mark all unimplemented routes as disabled in navigationItems array:
      - `/my-tickets`, `/all-tickets`, `/tags`, `/knowledge`, `/community`, `/wiki`
      - `/search`, `/messages`, `/watercooler`, `/calendar`
      - `/users`, `/groups`, `/products`, `/inventory`, `/reports`, `/insights`, `/admin`
    - Update navigation item rendering logic to check disabled property
    - If disabled, render as `<div>` or `<span>` instead of `<Link>`
    - Apply disabled styling: reduced opacity (0.5), gray color, cursor not-allowed
    - Add tooltip showing "Coming Soon" on hover for disabled items
    - Preserve working links: Dashboard (`/dashboard`), Customers (`/customers`), Submit (`/submit`) remain fully functional
    - Maintain role-based visibility logic with disabled state
    - _Bug_Condition: isBugCondition_Navigation(input) where input.targetRoute IN unimplementedRoutes AND correspondingPageExists = FALSE AND navigationItemIsClickable = TRUE_
    - _Expected_Behavior: Navigation items for unimplemented routes are disabled/hidden with visual indication, no 404 errors occur_
    - _Preservation: Dashboard, Customers, Submit navigation; role-based visibility; sidebar collapse/expand; active route highlighting; badge display_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 3.2 Implement credential visibility fix in login page
    - Add environment variable check at top of LoginPage component in `app/login/page.tsx`
    - Read NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS environment variable
    - Set `showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true'`
    - Wrap demo credentials card section in conditional rendering: `{showDemoCredentials && (<div>...</div>)}`
    - Add NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true to `.env.local.example` with comment explaining production usage
    - Preserve all other login page functionality: form, authentication, social login, branding, testimonials, links
    - _Bug_Condition: isBugCondition_Credentials(input) where input.page = '/login' AND demoCredentialsCardRendered = TRUE AND (environment = 'production' OR NOT hasEnvironmentControl)_
    - _Expected_Behavior: Demo credentials hidden in production or when SHOW_DEMO_CREDENTIALS not explicitly true; visible only when SHOW_DEMO_CREDENTIALS=true_
    - _Preservation: Valid/invalid credential authentication; role-based redirects; login form; branding; testimonials; social login buttons; forgot password link; back to home link_
    - _Requirements: 2.18, 2.19, 2.20, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16_

  - [x] 3.3 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Navigation Items Disabled and Credentials Hidden
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - Verify navigation tests: Unimplemented links are disabled/hidden, no 404 errors
    - Verify credential tests: Demo credentials hidden when appropriate
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20_

  - [x] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Working Navigation and Login Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify working navigation: Dashboard, Customers, Submit still work correctly
    - Verify login functionality: Authentication, redirects, form, branding all unchanged
    - Verify credentials in dev: When SHOW_DEMO_CREDENTIALS=true, credentials display correctly
    - Confirm all tests still pass after fixes (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run complete test suite
  - Verify all bug condition tests pass (navigation disabled, credentials hidden)
  - Verify all preservation tests pass (working navigation, login functionality)
  - Verify no regressions in existing functionality
  - Test manually in browser:
    - Check disabled navigation items have correct styling and tooltips
    - Check working navigation items still function
    - Check login page without SHOW_DEMO_CREDENTIALS hides credentials
    - Check login page with SHOW_DEMO_CREDENTIALS=true shows credentials
    - Check authentication flows work correctly
  - Ask user if any questions or issues arise
  - Document any findings or edge cases discovered during testing
