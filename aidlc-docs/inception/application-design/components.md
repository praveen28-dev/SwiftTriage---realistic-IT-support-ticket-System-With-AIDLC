# SwiftTriage - Component Definitions

## Overview
This document defines all components in the SwiftTriage application, organized by layer and feature.

---

## 1. Frontend Components (React/Next.js)

### 1.1 Ticket Submission Components (`app/components/tickets/`)

#### TicketSubmissionForm
**Purpose**: Main form component for end users to submit IT issues

**Responsibilities**:
- Render text area for issue description
- Handle form state and user input
- Perform client-side validation using shared schema
- Submit ticket data to API
- Display loading state during submission
- Show success message with Ticket ID
- Handle and display submission errors

**Key Features**:
- Real-time character count
- Client-side validation feedback
- Optimistic UI updates
- Error boundary integration

---

#### TicketSuccessMessage
**Purpose**: Display confirmation after successful ticket submission

**Responsibilities**:
- Show generated Ticket ID prominently
- Display submission timestamp
- Provide visual confirmation (success icon/animation)
- Option to submit another ticket

---

### 1.2 Dashboard Components (`app/components/dashboard/`)

#### DashboardLayout
**Purpose**: Main layout wrapper for IT staff dashboard

**Responsibilities**:
- Provide consistent layout structure
- Include navigation and header
- Handle authentication state display
- Render child components (filters, ticket list, stats)

---

#### TicketFilters
**Purpose**: Filter controls for dashboard ticket list

**Responsibilities**:
- Render filter dropdowns (category, urgency, status, date)
- Manage filter state
- Trigger data refetch with filter parameters
- Display active filter badges
- Clear all filters functionality

**Filter Options**:
- **Category**: All, Hardware, Network, Access, Software, Uncategorized
- **Urgency**: All, 1, 2, 3, 4, 5
- **Status**: All, PENDING, PENDING_TRIAGE, IN_PROGRESS, RESOLVED
- **Date Range**: Today, Last 7 days, Last 30 days, Custom range

---

#### TicketList
**Purpose**: Display filtered and sorted list of tickets

**Responsibilities**:
- Fetch tickets using SWR with polling
- Render ticket rows in table format
- Handle sorting by column (urgency, date, category)
- Display loading skeleton during fetch
- Show empty state when no tickets
- Handle pagination (if needed)

**Columns**:
- Ticket ID (truncated UUID)
- User Input (truncated with expand)
- Category (badge with color coding)
- Urgency Score (visual indicator 1-5)
- AI Summary
- Status (badge)
- Created At (relative time)

---

#### TicketRow
**Purpose**: Individual ticket row component

**Responsibilities**:
- Display ticket data in table row format
- Apply color coding based on urgency
- Handle row click to expand details
- Show truncated text with "show more" option

---

#### StatsPanel
**Purpose**: Display basic statistics and analytics

**Responsibilities**:
- Fetch and display ticket statistics
- Show total ticket count
- Display category distribution (pie chart or bars)
- Show urgency distribution
- Calculate and display average urgency
- Auto-update with SWR polling

**Metrics**:
- Total Tickets
- Tickets by Category (breakdown)
- Urgency Distribution (1-5 counts)
- Average Urgency Score
- Pending vs Resolved ratio

---

### 1.3 Shared UI Components (`app/components/ui/`)

#### Button
**Purpose**: Reusable button component with variants

**Responsibilities**:
- Render styled button with Tailwind
- Support variants (primary, secondary, danger)
- Handle loading state
- Support disabled state
- Accept icon props

---

#### Badge
**Purpose**: Display status, category, or urgency badges

**Responsibilities**:
- Render colored badge with text
- Support color variants (category colors, urgency colors)
- Support size variants (small, medium, large)

---

#### LoadingSpinner
**Purpose**: Display loading indicator

**Responsibilities**:
- Render animated spinner
- Support size variants
- Support inline or centered display

---

#### ErrorMessage
**Purpose**: Display error messages consistently

**Responsibilities**:
- Render error text with icon
- Support dismissible errors
- Support different severity levels

---

## 2. API Route Handlers (Vercel Serverless)

### 2.1 Ticket Routes (`app/api/tickets/`)

#### POST /api/tickets/route.ts
**Purpose**: Create new ticket with AI triage

**Responsibilities**:
- Validate request body using shared schema
- Call Groq service for AI triage
- Handle Groq API failures gracefully
- Insert ticket into database using Drizzle
- Return ticket ID and triage results
- Log errors for monitoring

**Request Body**:
```typescript
{
  userInput: string;
}
```

**Response**:
```typescript
{
  ticketId: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
}
```

---

#### GET /api/tickets/route.ts
**Purpose**: Retrieve tickets with filtering and sorting

**Responsibilities**:
- Validate query parameters
- Check user authentication and role (IT staff only)
- Build Drizzle query with filters
- Apply sorting (default: urgency DESC)
- Return paginated ticket list
- Handle database errors

**Query Parameters**:
- `category`: string (optional)
- `urgency`: number (optional)
- `status`: string (optional)
- `dateFrom`: ISO date (optional)
- `dateTo`: ISO date (optional)
- `sortBy`: string (default: "urgency")
- `sortOrder`: "asc" | "desc" (default: "desc")

**Response**:
```typescript
{
  tickets: Ticket[];
  total: number;
}
```

---

### 2.2 Statistics Route (`app/api/stats/`)

#### GET /api/stats/route.ts
**Purpose**: Retrieve ticket statistics for dashboard

**Responsibilities**:
- Check user authentication and role (IT staff only)
- Query database for aggregate statistics
- Calculate category distribution
- Calculate urgency distribution
- Calculate average urgency score
- Return statistics object

**Response**:
```typescript
{
  totalTickets: number;
  categoryDistribution: { category: string; count: number }[];
  urgencyDistribution: { urgency: number; count: number }[];
  averageUrgency: number;
  statusDistribution: { status: string; count: number }[];
}
```

---

### 2.3 Authentication Routes (NextAuth.js)

#### /api/auth/[...nextauth]/route.ts
**Purpose**: Handle authentication via NextAuth.js

**Responsibilities**:
- Configure NextAuth providers
- Define user roles (end_user, it_staff, admin)
- Handle login/logout
- Manage session cookies
- Validate credentials
- Return user session with role

**Configuration**:
- Providers: Credentials (username/password)
- Session strategy: JWT
- Callbacks: jwt, session (add role to session)

---

## 3. Service Layer

### 3.1 Groq AI Service (`lib/services/groqService.ts`)

#### groqService
**Purpose**: Encapsulate Groq API integration for ticket triage

**Responsibilities**:
- Initialize Groq client with API key
- Send ticket text to Groq API with system prompt
- Parse JSON response from Groq
- Validate response structure
- Handle API errors and timeouts
- Return triage results or fallback data

**Functions**:
- `triageTicket(userInput: string): Promise<TriageResult>`

---

### 3.2 Validation Service (`lib/validation/schemas.ts`)

#### Validation Schemas
**Purpose**: Shared validation schemas for client and server

**Responsibilities**:
- Define Zod schemas for ticket submission
- Define Zod schemas for query parameters
- Export validation functions
- Provide type inference from schemas

**Schemas**:
- `ticketSubmissionSchema`: Validate ticket submission
- `ticketFiltersSchema`: Validate filter parameters
- `ticketSortSchema`: Validate sort parameters

---

## 4. Database Layer

### 4.1 Drizzle Schema (`lib/db/schema.ts`)

#### tickets table
**Purpose**: Define database schema for tickets

**Responsibilities**:
- Define table structure with Drizzle ORM
- Set column types and constraints
- Define default values
- Export TypeScript types from schema

**Columns**:
- `id`: UUID (primary key, default: gen_random_uuid())
- `userInput`: Text (not null)
- `category`: Varchar (not null)
- `urgencyScore`: Integer (not null)
- `aiSummary`: Text (not null)
- `status`: Varchar (not null, default: 'PENDING')
- `createdAt`: Timestamp (not null, default: now())

---

### 4.2 Database Connection (`lib/db/connection.ts`)

#### db
**Purpose**: Drizzle database connection instance

**Responsibilities**:
- Initialize Neon serverless driver
- Create Drizzle instance with schema
- Export db instance for queries
- Handle connection pooling (via Neon)

---

## 5. Configuration Layer

### 5.1 Config Module (`lib/config.ts`)

#### config
**Purpose**: Centralized configuration with type safety

**Responsibilities**:
- Load environment variables
- Provide typed config object
- Validate required variables exist
- Export config for use across app

**Config Properties**:
- `database.url`: Neon database connection string
- `groq.apiKey`: Groq API key
- `groq.model`: Model name (llama3-8b-8192)
- `nextAuth.secret`: NextAuth secret key
- `app.pollingInterval`: Dashboard polling interval (ms)

---

## 6. Type Definitions

### 6.1 Generated Types (`lib/db/schema.ts`)

#### Ticket
**Purpose**: TypeScript type for ticket entity

**Source**: Generated from Drizzle schema

**Properties**:
```typescript
type Ticket = {
  id: string;
  userInput: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
  createdAt: Date;
};
```

---

### 6.2 API Types (`lib/types/api.ts`)

#### TriageResult
**Purpose**: Type for Groq API triage response

**Properties**:
```typescript
type TriageResult = {
  category: string;
  urgency_score: number;
  ai_summary: string;
};
```

---

#### TicketFilters
**Purpose**: Type for ticket filter parameters

**Properties**:
```typescript
type TicketFilters = {
  category?: string;
  urgency?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};
```

---

## Component Summary

**Total Components**: 23

**By Layer**:
- Frontend Components: 11
- API Route Handlers: 4
- Service Layer: 2
- Database Layer: 2
- Configuration: 1
- Type Definitions: 3

**By Feature**:
- Ticket Submission: 2 components
- Dashboard: 6 components
- Shared UI: 4 components
- API Routes: 4 handlers
- Services: 2 services
- Infrastructure: 5 modules

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for review
