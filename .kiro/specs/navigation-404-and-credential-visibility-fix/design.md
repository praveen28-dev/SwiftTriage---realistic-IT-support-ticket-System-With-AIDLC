# Navigation 404 and Credential Visibility Bugfix Design

## Overview

This design addresses two critical issues in the SwiftTriage application:

1. **Navigation 404 Errors**: Multiple navigation links in the Sidebar component point to non-existent pages, causing 404 errors and poor user experience. The fix will disable/hide these unimplemented navigation items with appropriate visual indication.

2. **Credential Visibility Security Concern**: The login page displays demo credentials in plain text, creating a security risk in production environments. The fix will conditionally display credentials based on environment configuration.

The approach is minimal and targeted: disable non-functional navigation items rather than implementing full pages, and hide credentials in production while allowing them in development environments via environment variable control.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when users click unimplemented navigation links OR when demo credentials are visible in production
- **Property (P)**: The desired behavior - navigation items should be disabled/hidden with visual indication, and credentials should only show in development environments
- **Preservation**: Existing working navigation (Dashboard, Customers, Submit) and login functionality must remain unchanged
- **Sidebar Component**: The navigation component in `app/components/layout/Sidebar.tsx` that contains all navigation links
- **Login Page**: The authentication page in `app/login/page.tsx` that displays the login form and demo credentials
- **navigationItems**: The array in Sidebar.tsx defining all navigation menu items with their routes and properties
- **SHOW_DEMO_CREDENTIALS**: Environment variable that controls visibility of demo credentials on the login page

## Bug Details

### Bug Condition

**Issue 1: Navigation 404 Errors**

The bug manifests when a user clicks on any of 17 unimplemented navigation links in the Sidebar. The `navigationItems` array contains routes that do not have corresponding page components, causing Next.js to return 404 errors.

**Formal Specification:**
```
FUNCTION isBugCondition_Navigation(input)
  INPUT: input of type NavigationClickEvent
  OUTPUT: boolean
  
  unimplementedRoutes := ['/my-tickets', '/all-tickets', '/tags', '/knowledge', 
                          '/community', '/wiki', '/search', '/messages', 
                          '/watercooler', '/calendar', '/users', '/groups', 
                          '/products', '/inventory', '/reports', '/insights', '/admin']
  
  RETURN input.targetRoute IN unimplementedRoutes
         AND correspondingPageExists(input.targetRoute) = FALSE
         AND navigationItemIsClickable(input.targetRoute) = TRUE
END FUNCTION
```

**Issue 2: Credential Visibility**

The bug manifests when the login page is accessed in any environment. The demo credentials card is always rendered regardless of environment, exposing test credentials in production deployments.

**Formal Specification:**
```
FUNCTION isBugCondition_Credentials(input)
  INPUT: input of type PageRenderContext
  OUTPUT: boolean
  
  RETURN input.page = '/login'
         AND demoCredentialsCardRendered() = TRUE
         AND (input.environment = 'production' OR NOT hasEnvironmentControl())
END FUNCTION
```

### Examples

**Navigation 404 Examples:**
- User clicks "My Tickets" → navigates to `/my-tickets` → 404 error page displayed
- IT staff clicks "Users" → navigates to `/users` → 404 error page displayed
- User clicks "Knowledge Base" → navigates to `/knowledge` → 404 error page displayed
- User clicks "Admin" → navigates to `/admin` → 404 error page displayed

**Credential Visibility Examples:**
- Production deployment accessed → login page shows "user / password" and "it_admin / password" in plain text
- Security audit performed → demo credentials visible to anyone accessing login page
- Unauthorized user views login page → can see valid test credentials

**Edge Cases:**
- User clicks "Dashboard" → should navigate successfully (not affected by fix)
- User clicks "Customers" → should navigate successfully (not affected by fix)
- Development environment with SHOW_DEMO_CREDENTIALS=true → credentials should display
- Production environment with SHOW_DEMO_CREDENTIALS=false → credentials should be hidden

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

**Navigation - Working Links:**
- Dashboard link (`/dashboard`) must continue to work exactly as before
- Customers link (`/customers`) must continue to work for IT staff
- New Ticket button (`/submit`) must continue to work exactly as before
- SwiftTriage logo navigation to dashboard must continue to work
- Role-based visibility (IT staff vs end user) must remain unchanged
- Sidebar collapse/expand functionality must remain unchanged
- Active route highlighting must remain unchanged
- Badge display on navigation items must remain unchanged

**Login Page - Core Functionality:**
- Valid credential authentication must continue to work
- Invalid credential error handling must continue to work
- Role-based redirect (IT staff → `/dashboard`, end user → `/submit`) must continue to work
- Branding, testimonials, and trust badges display must remain unchanged
- Login form with username, password, remember me checkbox must remain unchanged
- Social login buttons display must remain unchanged
- "Forgot password?" link must continue to work
- "Back to home" link must continue to work

**Scope:**
All inputs that do NOT involve clicking unimplemented navigation links OR viewing the demo credentials card should be completely unaffected by this fix. This includes:
- All working navigation functionality
- All login and authentication flows
- All visual styling and layout
- All role-based access control

## Hypothesized Root Cause

Based on the bug description, the root causes are:

**Issue 1: Navigation 404 Errors**

1. **Incomplete Feature Implementation**: The Sidebar was designed with a comprehensive navigation structure, but many pages were never implemented. The `navigationItems` array contains routes for features that are planned but not yet built.

2. **No Disabled State Logic**: The Sidebar component renders all navigation items as clickable links without checking if the target pages exist. There is no mechanism to mark items as "coming soon" or disabled.

3. **Missing Page Components**: The Next.js app directory does not contain page.tsx files for the unimplemented routes, causing Next.js to return 404 errors when these routes are accessed.

**Issue 2: Credential Visibility**

1. **Unconditional Rendering**: The demo credentials card in `app/login/page.tsx` is rendered unconditionally without any environment checks. The JSX always includes the credentials section.

2. **No Environment Configuration**: There is no environment variable or configuration mechanism to control whether demo credentials should be displayed.

3. **Development-First Design**: The login page was designed for development/demo purposes with visible credentials for easy testing, but no consideration was given to production security requirements.

## Correctness Properties

Property 1: Bug Condition - Navigation Items Disabled

_For any_ navigation link where the target page does not exist (isBugCondition_Navigation returns true), the fixed Sidebar component SHALL either disable the link with visual indication (grayed out, cursor not-allowed, tooltip showing "Coming Soon") OR hide the link entirely from the navigation menu.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17**

Property 2: Bug Condition - Credentials Hidden in Production

_For any_ login page render where the environment is production or SHOW_DEMO_CREDENTIALS is not explicitly set to true, the fixed login page SHALL NOT render the demo credentials card section.

**Validates: Requirements 2.18, 2.19, 2.20**

Property 3: Preservation - Working Navigation Unchanged

_For any_ navigation link where the target page exists (Dashboard, Customers, Submit), the fixed Sidebar component SHALL produce exactly the same behavior as the original component, preserving all navigation functionality, styling, and interactions.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

Property 4: Preservation - Login Functionality Unchanged

_For any_ login interaction that does not involve viewing demo credentials (form submission, authentication, redirects, social login buttons), the fixed login page SHALL produce exactly the same behavior as the original page, preserving all authentication functionality.

**Validates: Requirements 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `app/components/layout/Sidebar.tsx`

**Function**: `navigationItems` array and `Sidebar` component

**Specific Changes**:

1. **Add Disabled State to Navigation Items**: Extend the `NavItem` interface to include an optional `disabled` boolean property and optional `comingSoon` boolean property.

2. **Mark Unimplemented Routes as Disabled**: Update the `navigationItems` array to mark all unimplemented routes with `disabled: true` and `comingSoon: true`:
   - `/my-tickets`, `/all-tickets`, `/tags`, `/knowledge`, `/community`, `/wiki`
   - `/search`, `/messages`, `/watercooler`, `/calendar`
   - `/users`, `/groups`, `/products`, `/inventory`, `/reports`, `/insights`, `/admin`

3. **Update Link Rendering Logic**: Modify the navigation item rendering to check the `disabled` property:
   - If disabled, render as a `<div>` or `<span>` instead of `<Link>`
   - Apply disabled styling: reduced opacity, gray color, cursor not-allowed
   - Add tooltip showing "Coming Soon" on hover

4. **Preserve Working Links**: Ensure Dashboard (`/dashboard`), Customers (`/customers`), and Submit (`/submit`) remain fully functional without disabled state.

5. **Maintain Role-Based Visibility**: Disabled state should work in conjunction with existing role-based filtering - items can be both role-restricted AND disabled.

**File**: `app/login/page.tsx`

**Component**: `LoginPage` component

**Specific Changes**:

1. **Add Environment Variable Check**: At the top of the component, read the `SHOW_DEMO_CREDENTIALS` environment variable:
   ```typescript
   const showDemoCredentials = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS === 'true';
   ```

2. **Conditional Rendering**: Wrap the demo credentials card section in a conditional:
   ```typescript
   {showDemoCredentials && (
     <div className="card p-6">
       {/* Demo credentials content */}
     </div>
   )}
   ```

3. **Environment Configuration**: Add `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS=true` to `.env.local.example` with a comment explaining it should be false or omitted in production.

4. **Preserve All Other Functionality**: No changes to login form, authentication logic, social login buttons, branding, or any other page elements.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate clicking unimplemented navigation links and rendering the login page in different environments. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:

1. **Navigation 404 Test - My Tickets**: Click "My Tickets" link and verify it navigates to `/my-tickets` (will fail with 404 on unfixed code)
2. **Navigation 404 Test - Admin**: Click "Admin" link and verify it navigates to `/admin` (will fail with 404 on unfixed code)
3. **Navigation 404 Test - Knowledge Base**: Click "Knowledge Base" link and verify it navigates to `/knowledge` (will fail with 404 on unfixed code)
4. **Credential Visibility Test - Production**: Render login page without SHOW_DEMO_CREDENTIALS set and verify credentials are hidden (will fail on unfixed code - credentials visible)
5. **Credential Visibility Test - No Env Var**: Render login page with no environment variable and verify credentials are hidden (will fail on unfixed code - credentials visible)

**Expected Counterexamples**:
- Clicking unimplemented navigation links results in 404 error pages
- Demo credentials card is always rendered regardless of environment
- Possible causes: no disabled state logic, unconditional rendering, missing environment checks

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL navigationClick WHERE isBugCondition_Navigation(navigationClick) DO
  result := Sidebar_fixed.handleClick(navigationClick)
  ASSERT result.linkDisabled = TRUE
  ASSERT result.visualIndicator = "Coming Soon" OR result.linkHidden = TRUE
  ASSERT result.navigation404 = FALSE
END FOR

FOR ALL pageRender WHERE isBugCondition_Credentials(pageRender) DO
  result := LoginPage_fixed.render(pageRender)
  ASSERT result.demoCredentialsVisible = FALSE
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL navigationClick WHERE NOT isBugCondition_Navigation(navigationClick) DO
  ASSERT Sidebar_original.handleClick(navigationClick) = Sidebar_fixed.handleClick(navigationClick)
END FOR

FOR ALL loginInteraction WHERE NOT isBugCondition_Credentials(loginInteraction) DO
  ASSERT LoginPage_original.handle(loginInteraction) = LoginPage_fixed.handle(loginInteraction)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for working navigation and login functionality, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Dashboard Navigation Preservation**: Observe that clicking Dashboard navigates successfully on unfixed code, then write test to verify this continues after fix
2. **Customers Navigation Preservation**: Observe that IT staff can navigate to Customers on unfixed code, then write test to verify this continues after fix
3. **Submit Navigation Preservation**: Observe that New Ticket button navigates to Submit on unfixed code, then write test to verify this continues after fix
4. **Login Authentication Preservation**: Observe that valid credentials authenticate successfully on unfixed code, then write test to verify this continues after fix
5. **Role-Based Redirect Preservation**: Observe that IT staff redirect to dashboard and end users redirect to submit on unfixed code, then write test to verify this continues after fix
6. **Credentials Display in Dev**: Observe that credentials should display when SHOW_DEMO_CREDENTIALS=true, write test to verify this works after fix

### Unit Tests

**Navigation Tests:**
- Test that unimplemented navigation items have `disabled: true` property
- Test that disabled items render as non-clickable elements (div/span, not Link)
- Test that disabled items have appropriate styling (opacity, cursor, color)
- Test that disabled items show "Coming Soon" tooltip
- Test that working navigation items (Dashboard, Customers, Submit) remain clickable
- Test that role-based filtering still works with disabled state
- Test that active route highlighting works for enabled items
- Test that sidebar collapse/expand works with disabled items

**Login Page Tests:**
- Test that demo credentials are hidden when SHOW_DEMO_CREDENTIALS is undefined
- Test that demo credentials are hidden when SHOW_DEMO_CREDENTIALS is 'false'
- Test that demo credentials are shown when SHOW_DEMO_CREDENTIALS is 'true'
- Test that login form renders correctly regardless of credentials visibility
- Test that authentication flow works when credentials are hidden
- Test that authentication flow works when credentials are shown
- Test that all other page elements render correctly in both states

### Property-Based Tests

**Navigation Property Tests:**
- Generate random navigation click events and verify disabled items never navigate
- Generate random user roles and verify role-based visibility works with disabled state
- Generate random sidebar states (collapsed/expanded) and verify disabled items render correctly
- Test that all enabled navigation items always navigate successfully across many scenarios

**Login Page Property Tests:**
- Generate random environment configurations and verify credentials visibility follows rules
- Generate random authentication attempts and verify login works regardless of credentials visibility
- Generate random page render scenarios and verify all non-credential elements always render
- Test that form submission works correctly across many input combinations

### Integration Tests

**Navigation Integration:**
- Test full navigation flow: user logs in, sees sidebar, clicks working links successfully
- Test that clicking disabled items does not cause navigation or errors
- Test switching between user roles and verify navigation items update correctly
- Test that visual feedback (tooltips, styling) appears correctly for disabled items

**Login Page Integration:**
- Test full login flow in development environment with credentials visible
- Test full login flow in production environment with credentials hidden
- Test that hiding credentials does not affect any authentication functionality
- Test that page layout and styling remain consistent with/without credentials card
