# Code Generation Plan - SwiftTriage

## Unit Context

**Unit Name**: SwiftTriage (Single Unit - Full Application)

**Unit Description**: Complete IT ticketing system with AI-powered triage, including frontend submission form, IT staff dashboard, API routes, Groq AI integration, and database layer.

**Stories Implemented**: All functional requirements from requirements.md

**Dependencies**:
- External: Groq API, Neon PostgreSQL, Vercel hosting
- NPM Packages: Next.js, React, Drizzle ORM, NextAuth.js, SWR, Zod, Groq SDK

**Code Location**: Workspace root (greenfield project)

**Project Structure**: Next.js 14+ App Router with TypeScript

---

## Code Generation Steps

### Phase 1: Project Setup and Configuration

#### Step 1: Initialize Next.js Project
- [x] Create Next.js 14+ project with TypeScript and Tailwind CSS
- [x] Configure `package.json` with all required dependencies
- [x] Configure `tsconfig.json` for strict TypeScript
- [x] Configure `tailwind.config.ts` for Tailwind CSS
- [x] Configure `next.config.js` for Next.js settings

#### Step 2: Environment Configuration
- [x] Create `.env.local.example` template with required variables
- [x] Create `lib/config.ts` for centralized configuration
- [x] Document environment variables in README

#### Step 3: Drizzle ORM Setup
- [x] Create `lib/db/schema.ts` with tickets table definition
- [x] Create `lib/db/connection.ts` for database connection
- [x] Create `drizzle.config.ts` for Drizzle configuration
- [x] Generate TypeScript types from schema

---

### Phase 2: Service Layer Implementation

#### Step 4: Validation Service
- [x] Create `lib/validation/schemas.ts` with Zod schemas
- [x] Define `ticketSubmissionSchema`
- [x] Define `ticketFiltersSchema`
- [x] Define `ticketSortSchema`
- [x] Export validation functions and inferred types

#### Step 5: Groq AI Service
- [x] Create `lib/services/groqService.ts`
- [x] Implement `triageTicket()` function
- [x] Implement `buildSystemPrompt()` function
- [x] Implement `parseGroqResponse()` function
- [x] Implement `getFallbackTriage()` function
- [x] Add error handling and logging

#### Step 6: Utility Functions
- [x] Create `lib/utils/errors.ts` with error utilities
- [x] Implement `createErrorResponse()`
- [x] Implement `logError()`
- [x] Implement `isGroqError()`
- [x] Create `lib/utils/format.ts` with formatting utilities
- [x] Implement `formatRelativeTime()`
- [x] Implement `truncateText()`
- [x] Implement `formatTicketId()`

#### Step 7: Type Definitions
- [x] Create `lib/types/api.ts` with API types
- [x] Define `TriageResult` interface
- [x] Define `TicketFilters` interface
- [x] Define `TicketResponse` interface
- [x] Define `TicketStatistics` interface

---

### Phase 3: API Routes Implementation

#### Step 8: Authentication Setup (NextAuth.js)
- [x] Create `lib/auth.ts` with authOptions configuration
- [x] Create `app/api/auth/[...nextauth]/route.ts`
- [x] Configure NextAuth with CredentialsProvider
- [x] Implement `authorize()` function for credential validation
- [x] Configure JWT callbacks to include role
- [x] Configure session callbacks to expose role
- [x] Set up session strategy and pages
- [x] Fix Next.js 14+ App Router export constraints

#### Step 9: Ticket Submission API
- [ ] Create `app/api/tickets/route.ts` (POST handler)
- [ ] Implement request body validation
- [ ] Call Groq service for triage
- [ ] Handle Groq API errors with fallback
- [ ] Insert ticket into database using Drizzle
- [ ] Return ticket response with ID and triage data
- [ ] Add comprehensive error handling

#### Step 10: Ticket Retrieval API
- [ ] Implement GET handler in `app/api/tickets/route.ts`
- [ ] Add authentication check (IT staff only)
- [ ] Validate query parameters
- [ ] Build Drizzle query with filters
- [ ] Apply sorting (default: urgency DESC)
- [ ] Execute query and return results
- [ ] Add error handling

#### Step 11: Statistics API
- [ ] Create `app/api/stats/route.ts` (GET handler)
- [ ] Add authentication check (IT staff only)
- [ ] Query total ticket count
- [ ] Query category distribution
- [ ] Query urgency distribution
- [ ] Query status distribution
- [ ] Calculate average urgency
- [ ] Return statistics object
- [ ] Add error handling

---

### Phase 4: Custom Hooks Implementation

#### Step 12: useTickets Hook
- [ ] Create `hooks/useTickets.ts`
- [ ] Implement SWR-based data fetching
- [ ] Add filter and sort parameters
- [ ] Configure polling with refreshInterval
- [ ] Return tickets, loading state, error state
- [ ] Export `UseTicketsOptions` and `UseTicketsReturn` types

#### Step 13: useStats Hook
- [ ] Create `hooks/useStats.ts`
- [ ] Implement SWR-based statistics fetching
- [ ] Configure polling with refreshInterval
- [ ] Return stats, loading state, error state
- [ ] Export `UseStatsOptions` and `UseStatsReturn` types

#### Step 14: useTicketSubmission Hook
- [ ] Create `hooks/useTicketSubmission.ts`
- [ ] Implement submission function with loading state
- [ ] Add error handling
- [ ] Add reset function
- [ ] Export `UseTicketSubmissionReturn` type

---

### Phase 5: Shared UI Components

#### Step 15: Button Component
- [ ] Create `app/components/ui/Button.tsx`
- [ ] Implement variants (primary, secondary, danger)
- [ ] Implement sizes (sm, md, lg)
- [ ] Add loading state support
- [ ] Add disabled state support
- [ ] Add icon support
- [ ] Style with Tailwind CSS
- [ ] Add `data-testid` attributes

#### Step 16: Badge Component
- [ ] Create `app/components/ui/Badge.tsx`
- [ ] Implement variants (category, urgency, status)
- [ ] Implement color mapping
- [ ] Implement sizes (sm, md, lg)
- [ ] Style with Tailwind CSS

#### Step 17: LoadingSpinner Component
- [ ] Create `app/components/ui/LoadingSpinner.tsx`
- [ ] Implement size variants
- [ ] Implement centered vs inline display
- [ ] Style with Tailwind CSS

#### Step 18: ErrorMessage Component
- [ ] Create `app/components/ui/ErrorMessage.tsx`
- [ ] Implement severity levels (error, warning, info)
- [ ] Add dismissible functionality
- [ ] Style with Tailwind CSS
- [ ] Add `data-testid` attributes

---

### Phase 6: Ticket Submission Components

#### Step 19: TicketSubmissionForm Component
- [ ] Create `app/components/tickets/TicketSubmissionForm.tsx`
- [ ] Implement form state management
- [ ] Add client-side validation using Zod schema
- [ ] Implement `handleInputChange()` handler
- [ ] Implement `handleSubmit()` handler
- [ ] Use `useTicketSubmission` hook
- [ ] Display loading state during submission
- [ ] Display validation errors
- [ ] Display success message on completion
- [ ] Add character count display
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

#### Step 20: TicketSuccessMessage Component
- [ ] Create `app/components/tickets/TicketSuccessMessage.tsx`
- [ ] Display Ticket ID prominently
- [ ] Display submission timestamp
- [ ] Add success icon/animation
- [ ] Add "Submit Another" button
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

---

### Phase 7: Dashboard Components

#### Step 21: DashboardLayout Component
- [ ] Create `app/components/dashboard/DashboardLayout.tsx`
- [ ] Add authentication check using NextAuth
- [ ] Implement layout structure (header, sidebar, main)
- [ ] Display user name and role
- [ ] Add logout functionality
- [ ] Render children components
- [ ] Style with Tailwind CSS

#### Step 22: TicketFilters Component
- [ ] Create `app/components/dashboard/TicketFilters.tsx`
- [ ] Implement filter state management
- [ ] Add category dropdown
- [ ] Add urgency dropdown
- [ ] Add status dropdown
- [ ] Add date range picker
- [ ] Implement `handleCategoryChange()` handler
- [ ] Implement `handleUrgencyChange()` handler
- [ ] Implement `handleStatusChange()` handler
- [ ] Implement `handleDateRangeChange()` handler
- [ ] Add "Clear Filters" button
- [ ] Display active filter badges
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

#### Step 23: TicketRow Component
- [ ] Create `app/components/dashboard/TicketRow.tsx`
- [ ] Display ticket data in table row format
- [ ] Implement expand/collapse for full text
- [ ] Apply urgency-based color coding
- [ ] Implement `getUrgencyColor()` helper
- [ ] Implement `getCategoryColor()` helper
- [ ] Format Ticket ID (truncated UUID)
- [ ] Format timestamp (relative time)
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

#### Step 24: TicketList Component
- [ ] Create `app/components/dashboard/TicketList.tsx`
- [ ] Use `useTickets` hook with filters and polling
- [ ] Implement table structure (headers + rows)
- [ ] Add sortable column headers
- [ ] Implement `handleSort()` handler
- [ ] Render `TicketRow` components
- [ ] Display loading skeleton during fetch
- [ ] Display empty state when no tickets
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

#### Step 25: StatsPanel Component
- [ ] Create `app/components/dashboard/StatsPanel.tsx`
- [ ] Use `useStats` hook with polling
- [ ] Display total ticket count
- [ ] Display category distribution (chart or bars)
- [ ] Display urgency distribution
- [ ] Display average urgency score
- [ ] Display status distribution
- [ ] Implement `formatPercentage()` helper
- [ ] Implement `getCategoryChartData()` helper
- [ ] Add loading state
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

---

### Phase 8: Page Components

#### Step 26: Root Layout
- [ ] Create `app/layout.tsx`
- [ ] Configure HTML metadata
- [ ] Import global CSS
- [ ] Configure font (if needed)
- [ ] Wrap with NextAuth SessionProvider
- [ ] Add error boundary

#### Step 27: Home Page
- [ ] Create `app/page.tsx`
- [ ] Add welcome message
- [ ] Add navigation links to /submit and /dashboard
- [ ] Style with Tailwind CSS

#### Step 28: Login Page
- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Implement login form
- [ ] Use NextAuth `signIn()` function
- [ ] Add username and password fields
- [ ] Add submit button
- [ ] Display error messages
- [ ] Redirect on successful login
- [ ] Add `data-testid` attributes
- [ ] Style with Tailwind CSS

#### Step 29: Ticket Submission Page
- [ ] Create `app/submit/page.tsx`
- [ ] Render `TicketSubmissionForm` component
- [ ] Add page title and instructions
- [ ] Style with Tailwind CSS

#### Step 30: Dashboard Page
- [ ] Create `app/dashboard/page.tsx`
- [ ] Add authentication check (IT staff only)
- [ ] Render `DashboardLayout` component
- [ ] Render `TicketFilters` component
- [ ] Render `TicketList` component
- [ ] Render `StatsPanel` component
- [ ] Implement filter state management
- [ ] Pass filters to TicketList
- [ ] Style with Tailwind CSS

---

### Phase 9: Database Migrations

#### Step 31: Generate Drizzle Migrations
- [ ] Run `drizzle-kit generate:pg` to create migration files
- [ ] Review generated migration SQL
- [ ] Document migration commands in README

---

### Phase 10: Documentation

#### Step 32: Code Summary Documentation
- [ ] Create `aidlc-docs/construction/swifttriage/code/code-summary.md`
- [ ] Document all generated files with paths
- [ ] List frontend components (11 components)
- [ ] List API routes (4 routes)
- [ ] List services (5 services)
- [ ] List hooks (3 hooks)
- [ ] List utilities (2 utility modules)
- [ ] Document project structure
- [ ] Include file count and line count estimates

#### Step 33: API Documentation
- [ ] Create `aidlc-docs/construction/swifttriage/code/api-documentation.md`
- [ ] Document POST /api/tickets endpoint
- [ ] Document GET /api/tickets endpoint
- [ ] Document GET /api/stats endpoint
- [ ] Document /api/auth/[...nextauth] endpoint
- [ ] Include request/response examples
- [ ] Document authentication requirements
- [ ] Document error responses

#### Step 34: Component Documentation
- [ ] Create `aidlc-docs/construction/swifttriage/code/component-documentation.md`
- [ ] Document all React components
- [ ] Include props interfaces
- [ ] Include usage examples
- [ ] Document component hierarchy

#### Step 35: Setup Instructions
- [ ] Create `README.md` in workspace root
- [ ] Document prerequisites (Node.js, npm, Neon account, Groq API key)
- [ ] Document installation steps
- [ ] Document environment variable setup
- [ ] Document database setup (Drizzle migrations)
- [ ] Document development server commands
- [ ] Document build and deployment commands
- [ ] Document testing commands (for Build & Test phase)

---

### Phase 11: Configuration Files

#### Step 36: Package.json Scripts
- [ ] Add `dev` script for development server
- [ ] Add `build` script for production build
- [ ] Add `start` script for production server
- [ ] Add `lint` script for ESLint
- [ ] Add `type-check` script for TypeScript
- [ ] Add `db:generate` script for Drizzle migrations
- [ ] Add `db:push` script to push schema to database

#### Step 37: Git Configuration
- [ ] Create `.gitignore` file
- [ ] Exclude `node_modules/`
- [ ] Exclude `.next/`
- [ ] Exclude `.env.local`
- [ ] Exclude build artifacts

---

## Plan Summary

**Total Steps**: 37

**Phases**:
1. Project Setup and Configuration (3 steps)
2. Service Layer Implementation (4 steps)
3. API Routes Implementation (4 steps)
4. Custom Hooks Implementation (3 steps)
5. Shared UI Components (4 steps)
6. Ticket Submission Components (2 steps)
7. Dashboard Components (5 steps)
8. Page Components (5 steps)
9. Database Migrations (1 step)
10. Documentation (4 steps)
11. Configuration Files (2 steps)

**Code Location**: Workspace root (greenfield Next.js project)

**Estimated Files**: 40+ files
- Frontend components: 11 files
- API routes: 4 files
- Services: 5 files
- Hooks: 3 files
- Utilities: 2 files
- Types: 1 file
- Pages: 5 files
- Configuration: 5+ files
- Documentation: 4+ files (in aidlc-docs/)

**Story Coverage**: All functional requirements from requirements.md will be implemented

---

**Document Version**: 1.0  
**Created**: 2026-05-05  
**Status**: Awaiting approval
