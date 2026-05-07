# Implementation Plan: IT Staff Dashboard Pages

## Overview

Implement two new IT staff dashboard pages for SwiftTriage — **My Tickets** (`/dashboard/my-tickets`) and **Admin** (`/dashboard/admin`) — along with the supporting TypeScript types, SWR hooks, API routes, and sidebar navigation updates. All code must be TypeScript-strict, use the existing Phase 1 Design System, and integrate with the existing NextAuth session and Drizzle/Neon data layer.

The design document is at `.kiro/specs/it-staff-dashboard-pages/design.md`.  
The requirements document is at `.kiro/specs/it-staff-dashboard-pages/requirements.md`.

---

## Tasks

- [x] 1. Extend TypeScript types and create shared API response interfaces
  - [x] 1.1 Create `types/next-auth.d.ts` — extend NextAuth `Session`, `User`, and `JWT` interfaces to include `role: 'it_staff' | 'ADMIN' | 'end_user'`
    - Declare module augmentation for `next-auth` and `next-auth/jwt`
    - Ensure the `role` field is non-optional on the session user object
    - _Requirements: 6.3_
  - [x] 1.2 Create `types/api.ts` — define all API request/response interfaces
    - `GetTicketsResponse`, `UpdateTicketRequest`, `UpdateTicketResponse`
    - `AddCommentRequest`, `AddCommentResponse`
    - `GetUsersResponse`, `UpdateUserRequest`, `UpdateUserResponse`
    - `GetHealthResponse`, `HealthStatus`
    - `GetAuditLogResponse`, `AuditLogEntry`
    - _Requirements: 6.1, 6.2, 6.5_
  - [x] 1.3 Verify `npm run type-check` passes with zero errors after adding the new type files
    - _Requirements: 6.8, 6.9_

- [x] 2. Build SWR data-fetching hooks
  - [x] 2.1 Update `hooks/useTickets.ts` — add `assignedTo` filter parameter to the existing hook
    - Append `assignedTo` to the URLSearchParams when provided
    - Keep existing `filters`, `sortBy`, `sortOrder`, and `refreshInterval` options intact
    - Return type must use the `Ticket` type imported from `lib/db/schema`
    - _Requirements: 4.1, 4.2, 6.4, 6.5_
  - [x] 2.2 Create `hooks/useSystemHealth.ts`
    - Fetch from `/api/health` (single endpoint returning both `groq` and `database` statuses)
    - Accept `refreshInterval` option (default `10000`)
    - Return `{ groqStatus, databaseStatus, isLoading, isError, mutate }`
    - Use `HealthStatus` type from `types/api.ts`
    - _Requirements: 4.5, 9.3_
  - [x] 2.3 Create `hooks/useAuditLog.ts`
    - Fetch from `/api/audit-log?limit={limit}`
    - Accept `limit` (default `10`) and `refreshInterval` (default `15000`) options
    - Return `{ entries, isLoading, isError, mutate }`
    - Use `AuditLogEntry` type from `types/api.ts`
    - _Requirements: 4.6, 10.1_
  - [x] 2.4 Create `hooks/useUsers.ts`
    - Fetch from `/api/users`
    - Return `{ users, isLoading, isError, mutate }`
    - Use a `User` interface with `id`, `username`, `role`, `email`, `createdAt`
    - _Requirements: 2.5, 2.6_

- [x] 3. Implement new API routes
  - [x] 3.1 Create `app/api/tickets/[id]/route.ts` — PATCH handler for updating a ticket
    - Validate session; require `it_staff` or `ADMIN` role (return 401 otherwise)
    - Accept `{ status?, assignedTo?, priority? }` in the request body
    - Update the ticket row via Drizzle and return the updated ticket with a 200 response
    - Return 404 if the ticket ID does not exist
    - _Requirements: 7.1, 7.4, 7.5, 7.8_
  - [x] 3.2 Create `app/api/health/route.ts` — GET handler returning Groq and DB health
    - Perform a lightweight Groq API connectivity check (e.g., list models or a minimal completion)
    - Perform a lightweight DB connectivity check (e.g., `SELECT 1`)
    - Return `{ groq: HealthStatus, database: HealthStatus }` with `status`, `lastCheck`, `responseTime`, and optional `error`
    - Always return HTTP 200; encode service failures inside the response body
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 9.7_
  - [x] 3.3 Create `app/api/audit-log/route.ts` — GET handler returning recent audit entries
    - Validate session; require `ADMIN` role (return 401 otherwise)
    - Accept `limit` query param (default `10`, max `100`)
    - Query the `activities` table ordered by `createdAt` descending as a proxy for audit log entries
    - Map `Activity` rows to `AuditLogEntry` shape (`id`, `actionType`, `description`, `performedBy`, `timestamp`)
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  - [x] 3.4 Create `app/api/users/route.ts` — GET handler returning all IT staff users
    - Validate session; require `ADMIN` role (return 401 otherwise)
    - Return a list of users derived from the session store or a `users` table (use the existing auth pattern; if no users table exists, seed from `authOptions` or return a mock list with a TODO comment)
    - _Requirements: 2.5, 2.6, 7.3_
  - [x] 3.5 Create `app/api/users/[id]/route.ts` — PATCH handler for updating a user's role
    - Validate session; require `ADMIN` role (return 401 otherwise)
    - Accept `{ role: 'ADMIN' | 'STAFF' }` in the request body
    - Update the user record and return the updated user
    - Return 404 if the user ID does not exist
    - _Requirements: 7.3, 7.4, 7.5, 7.8_

- [x] 4. Checkpoint — verify API routes compile and type-check
  - Run `npm run type-check` and confirm zero errors before proceeding to UI work.
  - _Requirements: 6.8_

- [x] 5. Implement the My Tickets page
  - [x] 5.1 Create `app/dashboard/my-tickets/page.tsx` — page shell with auth guard
    - Mark as `'use client'`
    - Use `useSession` to read the session; redirect to `/login` if unauthenticated
    - Redirect to `/dashboard` if the role is not `it_staff` or `ADMIN`
    - Show `<LoadingSpinner centered size="lg" />` while `status === 'loading'`
    - _Requirements: 1.1, 3.1, 3.2, 3.6, 3.7_
  - [x] 5.2 Add search state, sort state, and SWR data fetching to the My Tickets page
    - `useState` for `searchQuery` (string), `sortColumn` (keyof Ticket), `sortDirection` ('asc' | 'desc')
    - Call `useTickets({ assignedTo: session?.user?.name, refreshInterval: 5000 })`
    - Derive `filteredAndSortedTickets` with `useMemo` — filter by `searchQuery` (case-insensitive match on `id`, `aiSummary`, `category`, `status`), then sort by `sortColumn`/`sortDirection`
    - _Requirements: 1.4, 1.5, 1.6, 4.1, 4.2, 8.1, 8.2, 8.3, 8.4, 8.9_
  - [x] 5.3 Build the `TicketDataTable` sub-component (inline or separate file)
    - Render a `<table>` inside the `Card` with sortable column headers (urgency score, created date, status)
    - Each header click toggles sort direction; show an arrow icon for the active sort column
    - Each row renders: ticket ID (truncated), AI summary, category, `<StatusBadge>`, `<UrgencyBadge>`, created date
    - When `filteredAndSortedTickets` is empty, render `<EmptyState title="No tickets found matching your search" />`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 5.1, 5.6, 8.5, 8.6, 8.7, 8.8, 8.10_
  - [x] 5.4 Add `QuickActionButtons` to each ticket row
    - "Change Status" button (`btn-primary`) opens an inline dropdown or modal with status options (`OPEN`, `IN_PROGRESS`, `PENDING`, `RESOLVED`, `CLOSED`)
    - Selecting a status sends `PATCH /api/tickets/[id]` with `{ status }`, then calls `mutate()`
    - "Add Comment" button (`btn-secondary`) opens a small textarea modal; submitting sends `POST /api/tickets/[id]/comments` (stub the route if not yet implemented), then calls `mutate()`
    - Show a loading state on the button while the request is in flight
    - Display an inline error message if the request fails
    - _Requirements: 1.7, 1.9, 5.3, 7.1, 7.2, 7.6, 7.7_
  - [x] 5.5 Wire the search `Input` component and card layout into the page
    - Use `<Input>` from `app/components/ui/Input.tsx` with a search icon as `leftIcon`
    - Wrap everything in `<Card padding="lg">` with a `<CardHeader title="My Tickets" subtitle="..." />`
    - Apply `p-8` padding on the outer `div` inside `<EnterpriseLayout>`
    - Use fluid typography and 8px-grid spacing throughout
    - _Requirements: 1.3, 5.1, 5.6, 5.7, 5.8, 5.9_
  - [-] 5.6 Write unit tests for the My Tickets page (`app/dashboard/my-tickets/page.test.tsx`)
    - Test: unauthenticated users are redirected to `/login`
    - Test: non-IT-staff users are redirected to `/dashboard`
    - Test: loading spinner renders while `status === 'loading'`
    - Test: ticket rows render when `useTickets` returns data
    - Test: search input filters the displayed rows
    - Test: clicking a column header changes sort order
    - Test: error state renders `ErrorEmptyState` when `isError` is true
    - _Requirements: 1.11, 1.12_

- [x] 6. Implement the Admin page
  - [x] 6.1 Create `app/dashboard/admin/page.tsx` — page shell with ADMIN-only auth guard
    - Mark as `'use client'`
    - Use `useSession`; redirect to `/login` if unauthenticated, redirect to `/dashboard` if role is `it_staff` (non-admin)
    - Return `null` (render nothing) if role is not `ADMIN` after the redirect check
    - Show `<LoadingSpinner centered size="lg" />` while loading
    - _Requirements: 2.1, 2.2, 2.3, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [x] 6.2 Build the `UserManagementPanel` sub-component
    - Call `useUsers()` for data
    - Render a list of user rows: username, current role `<Badge>`, and a role-toggle button
    - Toggle button label: "Promote to Admin" (`btn-primary`) when role is `STAFF`; "Demote to Staff" (`btn-danger`) when role is `ADMIN`
    - Clicking the toggle sends `PATCH /api/users/[id]` with the new role, then calls `mutateUsers()`
    - Show `<EmptyState title="No users found" />` when the list is empty
    - _Requirements: 2.5, 2.6, 2.7, 5.4, 7.3, 7.6, 7.7_
  - [x] 6.3 Build the `SystemHealthPanel` sub-component
    - Call `useSystemHealth({ refreshInterval: 10000 })` for data
    - Render a `<Badge variant="success">Connected</Badge>` for each service when status is `connected`
    - Render a `<Badge variant="error">Disconnected</Badge>` when status is `disconnected`
    - Render a `<Badge variant="warning">Degraded</Badge>` when status is `degraded`
    - Display the `lastCheck` timestamp below each badge
    - Include a "Refresh" `<Button variant="secondary">` that calls `mutateHealth()`
    - _Requirements: 2.8, 2.9, 2.10, 2.11, 5.5, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_
  - [x] 6.4 Build the `AuditLogPanel` sub-component
    - Call `useAuditLog({ limit: 10, refreshInterval: 15000 })` for data
    - Render entries in reverse chronological order (newest first)
    - Each entry shows: a colored icon (blue for info, green for success, yellow for warning, red for error based on `actionType`), the action description, the `performedBy` username, and a relative timestamp (e.g., "2 minutes ago")
    - Show `<EmptyState title="No recent activity" />` when entries array is empty
    - Include a "View All" link (renders as a disabled/placeholder `<a>` with a TODO comment for future navigation)
    - _Requirements: 2.12, 2.13, 2.14, 10.2, 10.3, 10.4, 10.5, 10.6, 10.8, 10.9_
  - [x] 6.5 Assemble the 3-column Admin page layout
    - Use `<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">` inside `<EnterpriseLayout>`
    - Column 1: `<Card padding="lg">` wrapping `<UserManagementPanel>`
    - Column 2: `<Card padding="lg">` wrapping `<SystemHealthPanel>`
    - Column 3: `<Card padding="lg">` wrapping `<AuditLogPanel>`
    - Add `<h1>` page title "System Administration" above the grid
    - Apply `p-8` outer padding; use fluid typography and 8px-grid spacing
    - _Requirements: 2.4, 2.15, 2.16, 5.2, 5.7, 5.8, 5.9_
  - [ ] 6.6 Write unit tests for the Admin page (`app/dashboard/admin/page.test.tsx`)
    - Test: unauthenticated users are redirected to `/login`
    - Test: `it_staff` (non-admin) users are redirected to `/dashboard`
    - Test: loading spinner renders while `status === 'loading'`
    - Test: all three panels render for ADMIN users
    - Test: role toggle button sends correct PATCH request
    - Test: health badges display correct variant for each status value
    - _Requirements: 2.17, 2.18_

- [x] 7. Update sidebar navigation
  - [x] 7.1 Update `app/components/layout/Sidebar.tsx` — activate the "My Tickets" nav item
    - Change the existing "My Tickets" entry: set `href: '/dashboard/my-tickets'`, remove `disabled: true` and `comingSoon: true`
    - Remove the hardcoded `badge: 5` placeholder (badge count will come from live data in a future enhancement)
    - _Requirements: 1.1_
  - [x] 7.2 Update `app/components/layout/Sidebar.tsx` — activate the "Admin" nav item
    - Change the existing "Admin" entry: set `href: '/dashboard/admin'`, remove `disabled: true` and `comingSoon: true`
    - Restrict visibility to `roles: ['ADMIN']` only (not all `it_staff`) so non-admin IT staff do not see the link
    - _Requirements: 2.1, 2.3_

- [x] 8. Checkpoint — full integration verification
  - Run `npm run type-check` and confirm zero TypeScript errors.
  - Run `npm run test:run` and confirm all existing tests still pass.
  - Manually verify (or via test): navigating to `/dashboard/my-tickets` as `it_staff` renders the page; navigating as an unauthenticated user redirects to `/login`.
  - Manually verify (or via test): navigating to `/dashboard/admin` as `ADMIN` renders all three panels; navigating as `it_staff` redirects to `/dashboard`.
  - _Requirements: 1.12, 2.18, 6.8_

- [ ] 9. Write hook unit tests
  - [ ] 9.1 Write tests for the updated `hooks/useTickets.ts` (`hooks/useTickets.test.ts`)
    - Test: `assignedTo` param is appended to the fetch URL when provided
    - Test: `isLoading` is `true` before data resolves
    - Test: `tickets` array is populated on successful fetch
    - Test: `isError` is `true` on fetch failure
    - _Requirements: 4.1, 4.2_
  - [ ] 9.2 Write tests for `hooks/useSystemHealth.ts` (`hooks/useSystemHealth.test.ts`)
    - Test: fetches from `/api/health`
    - Test: returns `groqStatus` and `databaseStatus` from response
    - Test: `isError` is `true` on fetch failure
    - _Requirements: 4.5_
  - [ ] 9.3 Write tests for `hooks/useAuditLog.ts` (`hooks/useAuditLog.test.ts`)
    - Test: fetches from `/api/audit-log?limit=10` by default
    - Test: `entries` array is populated on successful fetch
    - Test: `isError` is `true` on fetch failure
    - _Requirements: 4.6_

- [x] 10. Final checkpoint — ensure all tests pass
  - Run `npm run test:run` and confirm all tests pass.
  - Run `npm run type-check` and confirm zero errors.
  - Ask the user if any questions arise before marking complete.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery.
- The `ADMIN` role is distinct from `it_staff` — the auth guard on the Admin page must check for `ADMIN` specifically, not just any IT staff role.
- The `lib/db/schema.ts` does not currently have a `users` table. Task 3.4 includes a note to use a mock/stub with a TODO comment until a users table is added.
- The `activities` table is used as the audit log source in Task 3.3 since no dedicated `audit_log` table exists in the current schema.
- All button components must use the `.btn`, `.btn-primary`, `.btn-secondary`, and `.btn-danger` CSS classes from `globals.css` via the existing `Button` component.
- SWR polling intervals: My Tickets = 5 s, System Health = 10 s, Audit Log = 15 s.
- Each task references specific requirements for traceability back to `.kiro/specs/it-staff-dashboard-pages/requirements.md`.
