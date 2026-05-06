# Requirements Document: IT Staff Dashboard Pages

## Introduction

This document specifies requirements for two new high-fidelity page components for the SwiftTriage IT staff dashboard: the My Tickets Page and the Admin Page. These pages extend the existing dashboard functionality to provide IT staff with dedicated views for personal ticket management and system administration.

## Glossary

- **IT_Staff**: Authenticated users with the 'it_staff' role who have access to dashboard features
- **Admin**: Authenticated users with the 'ADMIN' role who have elevated privileges for system administration
- **My_Tickets_Page**: A dedicated page component displaying tickets assigned to the logged-in IT staff member
- **Admin_Page**: A dedicated page component for system-wide settings, user management, and system health monitoring
- **Ticket_Queue**: The collection of tickets assigned to a specific IT staff member
- **SWR**: Stale-While-Revalidate data fetching library used for real-time updates
- **Data_Table**: A searchable, sortable table component displaying ticket information
- **Quick_Action_Button**: Interactive buttons for common ticket operations (Change Status, Add Comment)
- **User_Management_Panel**: Interface for managing IT staff roles and permissions
- **System_Health_Badge**: Visual indicator showing connection status of external services
- **Audit_Log**: Chronological feed of system actions and changes
- **Design_System**: The Phase 1 Design System including button classes, fluid typography, and 8px grid system
- **NextAuth_Session**: Authentication session object containing user identity and role information
- **Groq_API**: External AI service for ticket triage
- **Neon_DB**: PostgreSQL database service for data persistence

## Requirements

### Requirement 1: My Tickets Page Component

**User Story:** As an IT staff member, I want a dedicated page showing only my assigned tickets, so that I can focus on my personal workload without distraction.

#### Acceptance Criteria

1. THE My_Tickets_Page SHALL be accessible at the route `/app/dashboard/my-tickets/page.tsx`
2. WHEN an IT_Staff user navigates to `/dashboard/my-tickets`, THE My_Tickets_Page SHALL display only tickets where the `assignedTo` field matches the logged-in user's username
3. THE My_Tickets_Page SHALL use a card layout with the `.card` CSS class from the Design_System
4. THE My_Tickets_Page SHALL render tickets in a searchable Data_Table component
5. THE Data_Table SHALL support client-side search filtering by ticket ID, summary, category, and status
6. THE Data_Table SHALL support sorting by urgency score, created date, and status
7. WHEN a ticket row is displayed, THE My_Tickets_Page SHALL include Quick_Action_Button components for "Change Status" and "Add Comment"
8. THE My_Tickets_Page SHALL use SWR with a `refreshInterval` of 5000ms for real-time ticket queue updates
9. THE My_Tickets_Page SHALL use the `.btn` classes (Primary, Secondary, Danger) from the Design_System for all button components
10. THE My_Tickets_Page SHALL use fluid typography and the 8px grid system from `globals.css`
11. THE My_Tickets_Page SHALL maintain strict TypeScript typing for the NextAuth_Session object with the `it_staff` role
12. THE My_Tickets_Page SHALL produce zero TypeScript compilation errors

### Requirement 2: Admin Page Component

**User Story:** As an administrator, I want a dedicated admin page with system-wide controls, so that I can manage users, monitor system health, and review audit logs.

#### Acceptance Criteria

1. THE Admin_Page SHALL be accessible at the route `/app/dashboard/admin/page.tsx`
2. WHEN a user with role 'ADMIN' navigates to `/dashboard/admin`, THE Admin_Page SHALL display the admin interface
3. IF a user with role 'it_staff' (non-admin) navigates to `/dashboard/admin`, THEN THE Admin_Page SHALL redirect to `/dashboard`
4. THE Admin_Page SHALL use a 3-column layout using the 8px grid system
5. THE Admin_Page SHALL include a User_Management_Panel in the first column displaying all IT staff members
6. THE User_Management_Panel SHALL display each tech's username and current role
7. THE User_Management_Panel SHALL include a role toggle control for switching between 'ADMIN' and 'STAFF' roles
8. THE Admin_Page SHALL include a System_Health section in the second column
9. THE System_Health section SHALL display a real-time connection status badge for Groq_API
10. THE System_Health section SHALL display a real-time connection status badge for Neon_DB
11. THE System_Health badges SHALL use color coding: green for connected, red for disconnected, yellow for degraded
12. THE Admin_Page SHALL include an Audit_Log section in the third column
13. THE Audit_Log SHALL display the 10 most recent system actions in reverse chronological order
14. THE Audit_Log SHALL show the action type, user who performed it, and timestamp for each entry
15. THE Admin_Page SHALL use the `.btn` classes (Primary, Secondary, Danger) from the Design_System for all button components
16. THE Admin_Page SHALL use fluid typography and the 8px grid system from `globals.css`
17. THE Admin_Page SHALL maintain strict TypeScript typing for the NextAuth_Session object with role validation
18. THE Admin_Page SHALL produce zero TypeScript compilation errors

### Requirement 3: Authentication and Authorization

**User Story:** As a system administrator, I want role-based access control enforced on dashboard pages, so that only authorized users can access sensitive administrative functions.

#### Acceptance Criteria

1. WHEN a user accesses My_Tickets_Page, THE system SHALL verify the NextAuth_Session contains role 'it_staff' or 'ADMIN'
2. IF the NextAuth_Session is missing or invalid, THEN THE My_Tickets_Page SHALL redirect to `/login`
3. WHEN a user accesses Admin_Page, THE system SHALL verify the NextAuth_Session contains role 'ADMIN'
4. IF the NextAuth_Session role is 'it_staff' (non-admin), THEN THE Admin_Page SHALL redirect to `/dashboard`
5. IF the NextAuth_Session is missing or invalid, THEN THE Admin_Page SHALL redirect to `/login`
6. THE authentication checks SHALL execute on the client side using the `useSession` hook from NextAuth
7. THE authentication checks SHALL complete before rendering page content

### Requirement 4: Data Fetching and Real-Time Updates

**User Story:** As an IT staff member, I want my ticket queue to update automatically, so that I always see the latest ticket assignments without manual refresh.

#### Acceptance Criteria

1. THE My_Tickets_Page SHALL use SWR for data fetching with automatic revalidation
2. THE My_Tickets_Page SHALL configure SWR with `refreshInterval: 5000` for polling every 5 seconds
3. WHEN new tickets are assigned to the logged-in user, THE My_Tickets_Page SHALL display them within 5 seconds without user action
4. WHEN ticket status changes occur, THE My_Tickets_Page SHALL reflect updates within 5 seconds
5. THE Admin_Page SHALL use SWR for System_Health status checks with `refreshInterval: 10000` (10 seconds)
6. THE Admin_Page SHALL use SWR for Audit_Log updates with `refreshInterval: 15000` (15 seconds)
7. WHILE data is loading, THE pages SHALL display a loading spinner component
8. IF data fetching fails, THEN THE pages SHALL display an error message with retry option

### Requirement 5: User Interface and Design System Compliance

**User Story:** As a developer, I want all new pages to follow the established design system, so that the application maintains visual consistency and code maintainability.

#### Acceptance Criteria

1. THE My_Tickets_Page SHALL use the `.card` CSS class for the main container
2. THE Admin_Page SHALL use the `.card` CSS class for each of the three column sections
3. THE Quick_Action_Button components SHALL use `.btn-primary` for primary actions and `.btn-secondary` for secondary actions
4. THE role toggle controls SHALL use `.btn-danger` for destructive actions (role demotion)
5. THE System_Health badges SHALL use the Badge component from `app/components/ui/Badge.tsx`
6. THE Data_Table SHALL use the Input component from `app/components/ui/Input.tsx` for search functionality
7. THE pages SHALL use CSS custom properties from `globals.css` for colors (e.g., `var(--primary-600)`)
8. THE pages SHALL use the fluid typography scale defined in `globals.css`
9. THE pages SHALL use spacing values that are multiples of 8px (8px, 16px, 24px, 32px, etc.)
10. THE pages SHALL be fully responsive and functional on mobile, tablet, and desktop viewports
11. THE pages SHALL use the LoadingSpinner component from `app/components/ui/LoadingSpinner.tsx` for loading states
12. THE pages SHALL use the EmptyState component from `app/components/ui/EmptyState.tsx` when no data is available

### Requirement 6: TypeScript Type Safety

**User Story:** As a developer, I want strict TypeScript typing throughout the codebase, so that type errors are caught at compile time rather than runtime.

#### Acceptance Criteria

1. THE My_Tickets_Page SHALL define explicit TypeScript interfaces for all component props
2. THE Admin_Page SHALL define explicit TypeScript interfaces for all component props
3. THE NextAuth_Session type SHALL be extended to include the `role` property with union type `'it_staff' | 'ADMIN' | 'end_user'`
4. THE Ticket type SHALL be imported from `lib/db/schema.ts` and used for all ticket data
5. THE SWR hooks SHALL use generic type parameters to ensure type-safe data access
6. THE Quick_Action_Button handlers SHALL have explicit function signatures with typed parameters
7. THE role toggle handler SHALL have explicit function signature with typed parameters
8. THE TypeScript compiler SHALL produce zero errors when running `npm run type-check`
9. THE TypeScript compiler SHALL be configured with `strict: true` in `tsconfig.json`
10. THE code SHALL not use `any` type except where absolutely necessary with justification comments

### Requirement 7: API Integration

**User Story:** As an IT staff member, I want my actions on tickets to persist to the database, so that my work is saved and visible to other team members.

#### Acceptance Criteria

1. WHEN a user clicks "Change Status" on a ticket, THE My_Tickets_Page SHALL send a PATCH request to `/api/tickets/[id]` with the new status
2. WHEN a user clicks "Add Comment" on a ticket, THE My_Tickets_Page SHALL send a POST request to `/api/tickets/[id]/comments` with the comment text
3. WHEN an admin toggles a user role, THE Admin_Page SHALL send a PATCH request to `/api/users/[id]` with the new role
4. THE API requests SHALL include the NextAuth JWT token in the Authorization header
5. THE API requests SHALL validate the user's role on the server side before processing
6. IF an API request fails, THEN THE page SHALL display an error message to the user
7. WHEN an API request succeeds, THE page SHALL trigger SWR revalidation to refresh the displayed data
8. THE API endpoints SHALL return appropriate HTTP status codes (200 for success, 401 for unauthorized, 403 for forbidden, 500 for server error)

### Requirement 8: Search and Filter Functionality

**User Story:** As an IT staff member, I want to search and filter my ticket queue, so that I can quickly find specific tickets I need to work on.

#### Acceptance Criteria

1. THE My_Tickets_Page SHALL include a search input field above the Data_Table
2. WHEN a user types in the search input, THE Data_Table SHALL filter tickets in real-time (client-side)
3. THE search SHALL match against ticket ID, AI summary, category, and status fields
4. THE search SHALL be case-insensitive
5. THE Data_Table SHALL include column headers that are clickable for sorting
6. WHEN a user clicks a column header, THE Data_Table SHALL sort by that column in ascending order
7. WHEN a user clicks the same column header again, THE Data_Table SHALL toggle to descending order
8. THE Data_Table SHALL display a visual indicator (arrow icon) showing the current sort column and direction
9. THE search and sort state SHALL persist during SWR revalidation (not reset on data refresh)
10. WHEN no tickets match the search criteria, THE Data_Table SHALL display an EmptyState component with message "No tickets found matching your search"

### Requirement 9: System Health Monitoring

**User Story:** As an administrator, I want to see real-time system health status, so that I can quickly identify and respond to service outages.

#### Acceptance Criteria

1. THE Admin_Page SHALL check Groq_API connectivity by sending a test request to `/api/health/groq`
2. THE Admin_Page SHALL check Neon_DB connectivity by sending a test request to `/api/health/database`
3. THE health check requests SHALL execute every 10 seconds via SWR polling
4. WHEN Groq_API is reachable and responding, THE System_Health badge SHALL display "Connected" with green color
5. WHEN Groq_API is unreachable or returning errors, THE System_Health badge SHALL display "Disconnected" with red color
6. WHEN Neon_DB is reachable and responding, THE System_Health badge SHALL display "Connected" with green color
7. WHEN Neon_DB is unreachable or returning errors, THE System_Health badge SHALL display "Disconnected" with red color
8. THE System_Health section SHALL display the last check timestamp
9. THE System_Health section SHALL include a manual "Refresh" button to trigger immediate health checks
10. IF health check requests fail, THE Admin_Page SHALL log errors to the browser console for debugging

### Requirement 10: Audit Log Display

**User Story:** As an administrator, I want to see recent system actions, so that I can monitor user activity and troubleshoot issues.

#### Acceptance Criteria

1. THE Admin_Page SHALL fetch audit log entries from `/api/audit-log?limit=10`
2. THE Audit_Log SHALL display entries in reverse chronological order (newest first)
3. THE Audit_Log SHALL display the action type (e.g., "Ticket Created", "Status Changed", "Role Updated")
4. THE Audit_Log SHALL display the username of the user who performed the action
5. THE Audit_Log SHALL display the timestamp in relative format (e.g., "2 minutes ago", "1 hour ago")
6. THE Audit_Log SHALL use different icon colors based on action type (blue for info, green for success, yellow for warning, red for error)
7. THE Audit_Log SHALL refresh automatically every 15 seconds via SWR polling
8. WHEN no audit log entries exist, THE Audit_Log SHALL display an EmptyState component with message "No recent activity"
9. THE Audit_Log SHALL include a "View All" link that navigates to a full audit log page (future enhancement)
10. THE Audit_Log entries SHALL be clickable to show detailed information in a modal (future enhancement)

---

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Status**: Draft - Awaiting Approval
