# SwiftTriage - Component Dependencies and Data Flow

## Overview
This document maps component relationships, dependencies, and data flow patterns across the SwiftTriage application.

---

## 1. Component Dependency Matrix

### 1.1 Frontend Component Dependencies

| Component | Depends On | Used By |
|-----------|------------|---------|
| TicketSubmissionForm | useTicketSubmission, ticketSubmissionSchema, Button, ErrorMessage | Submit page |
| TicketSuccessMessage | Button | TicketSubmissionForm |
| DashboardLayout | NextAuth session | Dashboard page |
| TicketFilters | ticketFiltersSchema | DashboardLayout |
| TicketList | useTickets, TicketRow, LoadingSpinner | DashboardLayout |
| TicketRow | Badge, Ticket type | TicketList |
| StatsPanel | useStats, LoadingSpinner | DashboardLayout |
| Button | - | All components |
| Badge | - | TicketRow, TicketFilters |
| LoadingSpinner | - | TicketList, StatsPanel |
| ErrorMessage | - | TicketSubmissionForm |

---

### 1.2 API Route Dependencies

| Route | Depends On | Called By |
|-------|------------|-----------|
| POST /api/tickets | groqService, db, tickets schema, validateTicketSubmission | TicketSubmissionForm |
| GET /api/tickets | db, tickets schema, validateTicketFilters, NextAuth | useTickets hook |
| GET /api/stats | db, tickets schema, NextAuth | useStats hook |
| /api/auth/[...nextauth] | NextAuth, config | Login page, all protected routes |

---

### 1.3 Service Layer Dependencies

| Service | Depends On | Used By |
|---------|------------|---------|
| groqService | Groq SDK, config | POST /api/tickets |
| Validation schemas | Zod | All API routes, frontend forms |
| Config | process.env | All services, API routes |
| Database connection | Neon driver, Drizzle, schema | All API routes |

---

## 2. Data Flow Diagrams

### 2.1 Ticket Submission Flow

```
+-------------------+
|   End User        |
|   (Browser)       |
+-------------------+
         |
         | 1. Enter issue text
         v
+-------------------+
| TicketSubmission  |
| Form Component    |
+-------------------+
         |
         | 2. Client validation (Zod)
         v
+-------------------+
| useTicket         |
| Submission Hook   |
+-------------------+
         |
         | 3. POST /api/tickets
         v
+-------------------+
| API Route Handler |
| /api/tickets      |
+-------------------+
         |
         | 4. Server validation (Zod)
         v
+-------------------+
| groqService       |
| .triageTicket()   |
+-------------------+
         |
         | 5. Call Groq API
         v
+-------------------+
| Groq API          |
| (llama3-8b-8192)  |
+-------------------+
         |
         | 6. Return triage JSON
         |    OR fallback on error
         v
+-------------------+
| API Route Handler |
| /api/tickets      |
+-------------------+
         |
         | 7. Insert into DB (Drizzle)
         v
+-------------------+
| Neon PostgreSQL   |
| tickets table     |
+-------------------+
         |
         | 8. Return ticket response
         v
+-------------------+
| TicketSubmission  |
| Form Component    |
+-------------------+
         |
         | 9. Display success message
         v
+-------------------+
| TicketSuccess     |
| Message Component |
+-------------------+
```

---

### 2.2 Dashboard Data Flow

```
+-------------------+
|   IT Staff        |
|   (Browser)       |
+-------------------+
         |
         | 1. Access dashboard
         v
+-------------------+
| DashboardLayout   |
| Component         |
+-------------------+
         |
         | 2. Check auth (NextAuth)
         v
+-------------------+
| TicketFilters +   |
| TicketList +      |
| StatsPanel        |
+-------------------+
         |
         | 3. useTickets hook (SWR)
         |    useStats hook (SWR)
         v
+-------------------+
| GET /api/tickets  |
| GET /api/stats    |
+-------------------+
         |
         | 4. Validate auth (NextAuth)
         |    Validate params (Zod)
         v
+-------------------+
| Database Queries  |
| (Drizzle ORM)     |
+-------------------+
         |
         | 5. Query with filters
         v
+-------------------+
| Neon PostgreSQL   |
| tickets table     |
+-------------------+
         |
         | 6. Return data
         v
+-------------------+
| SWR Cache         |
+-------------------+
         |
         | 7. Render components
         v
+-------------------+
| TicketList +      |
| StatsPanel        |
+-------------------+
         |
         | 8. Poll every 5s (SWR)
         |
         +---------> (repeat from step 3)
```

---

### 2.3 Authentication Flow

```
+-------------------+
|   User            |
|   (Browser)       |
+-------------------+
         |
         | 1. Navigate to /login
         v
+-------------------+
| Login Page        |
| Component         |
+-------------------+
         |
         | 2. Submit credentials
         v
+-------------------+
| POST /api/auth    |
| /signin           |
+-------------------+
         |
         | 3. Validate credentials
         v
+-------------------+
| NextAuth          |
| CredentialsProvider|
+-------------------+
         |
         | 4. Determine role
         |    (end_user / it_staff)
         v
+-------------------+
| JWT Token         |
| (with role)       |
+-------------------+
         |
         | 5. Set session cookie
         v
+-------------------+
| User Session      |
+-------------------+
         |
         | 6. Redirect based on role
         v
+-------------------+
| /submit (end_user)|
| /dashboard (IT)   |
+-------------------+
```

---

## 3. Communication Patterns

### 3.1 Client-Server Communication

**Pattern**: REST API with JSON payloads

**Ticket Submission**:
```
Client → Server
POST /api/tickets
Content-Type: application/json
Body: { "userInput": "My computer won't start" }

Server → Client
Status: 201 Created
Body: {
  "ticketId": "uuid",
  "category": "Hardware",
  "urgencyScore": 4,
  "aiSummary": "Computer startup failure",
  "status": "PENDING",
  "createdAt": "2026-05-05T..."
}
```

**Ticket Retrieval**:
```
Client → Server
GET /api/tickets?category=Hardware&urgency=4&sortBy=urgency&sortOrder=desc

Server → Client
Status: 200 OK
Body: {
  "tickets": [...],
  "total": 42
}
```

---

### 3.2 Component Communication

**Parent-Child Props**:
```typescript
// Parent passes data and callbacks to child
<TicketList 
  filters={filters}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSortChange={handleSortChange}
/>

// Child calls parent callback
function TicketList({ filters, onSortChange }) {
  const handleColumnClick = (column) => {
    onSortChange(column, newOrder);
  };
}
```

**Custom Hooks for Shared State**:
```typescript
// Multiple components use same hook
function TicketList() {
  const { tickets, isLoading } = useTickets({ filters });
}

function StatsPanel() {
  const { stats, isLoading } = useStats();
}
```

---

### 3.3 Service-to-Service Communication

**API Route → Groq Service**:
```typescript
// API route calls service
const triageResult = await groqService.triageTicket(userInput);

// Service returns result or fallback
return {
  category: 'Hardware',
  urgency_score: 4,
  ai_summary: 'Computer startup failure'
};
```

**API Route → Database**:
```typescript
// Direct Drizzle query
const [ticket] = await db.insert(tickets).values({
  userInput,
  category: triageResult.category,
  urgencyScore: triageResult.urgency_score,
  aiSummary: triageResult.ai_summary,
}).returning();
```

---

## 4. Dependency Graph

### 4.1 Frontend Dependency Tree

```
App Root
├── Submit Page
│   └── TicketSubmissionForm
│       ├── useTicketSubmission
│       ├── ticketSubmissionSchema
│       ├── Button
│       ├── ErrorMessage
│       └── TicketSuccessMessage
│           └── Button
│
├── Dashboard Page
│   └── DashboardLayout
│       ├── NextAuth session
│       ├── TicketFilters
│       │   ├── ticketFiltersSchema
│       │   └── Badge
│       ├── TicketList
│       │   ├── useTickets
│       │   ├── LoadingSpinner
│       │   └── TicketRow
│       │       └── Badge
│       └── StatsPanel
│           ├── useStats
│           └── LoadingSpinner
│
└── Login Page
    ├── NextAuth
    └── Button
```

---

### 4.2 Backend Dependency Tree

```
API Routes
├── POST /api/tickets
│   ├── validateTicketSubmission (Zod)
│   ├── groqService
│   │   ├── Groq SDK
│   │   └── config
│   ├── db (Drizzle)
│   │   ├── Neon driver
│   │   └── tickets schema
│   └── Error utilities
│
├── GET /api/tickets
│   ├── NextAuth (auth check)
│   ├── validateTicketFilters (Zod)
│   ├── db (Drizzle)
│   │   ├── Neon driver
│   │   └── tickets schema
│   └── Error utilities
│
├── GET /api/stats
│   ├── NextAuth (auth check)
│   ├── db (Drizzle)
│   │   ├── Neon driver
│   │   └── tickets schema
│   └── Error utilities
│
└── /api/auth/[...nextauth]
    ├── NextAuth
    ├── CredentialsProvider
    └── config
```

---

## 5. Data Flow Patterns

### 5.1 Unidirectional Data Flow

**Pattern**: Data flows down, events flow up

```
State (filters, sortBy)
    ↓
DashboardLayout
    ↓
TicketFilters (receives filters, emits onChange)
    ↓
User interaction
    ↓
onChange callback
    ↓
Update state in DashboardLayout
    ↓
Re-render with new filters
```

---

### 5.2 Server State Management (SWR)

**Pattern**: SWR manages server data caching and revalidation

```
Component mounts
    ↓
useSWR hook fetches data
    ↓
Data cached in SWR
    ↓
Component renders with data
    ↓
SWR polls (refreshInterval: 5000ms)
    ↓
New data fetched
    ↓
SWR compares with cache
    ↓
If different, trigger re-render
    ↓
Component updates automatically
```

---

### 5.3 Form State Management

**Pattern**: Local component state with validation

```
User types in textarea
    ↓
useState updates local state
    ↓
Client-side validation (Zod)
    ↓
Display validation errors (if any)
    ↓
User submits form
    ↓
useTicketSubmission hook
    ↓
POST to API
    ↓
Server-side validation (Zod)
    ↓
Process and return response
    ↓
Update UI with success/error
```

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication

**Affects**:
- All dashboard routes (require IT staff role)
- API routes (GET /api/tickets, GET /api/stats)
- Login/logout flows

**Implementation**:
- NextAuth.js middleware
- Session stored in JWT cookie
- Role-based access control in API routes

---

### 6.2 Error Handling

**Layers**:
1. **UI Layer**: Error boundaries, try-catch in handlers
2. **API Layer**: Try-catch in routes, return error responses
3. **Service Layer**: Try-catch in services, return fallback values

**Flow**:
```
Error occurs in Groq service
    ↓
Service catches error
    ↓
Service returns fallback triage
    ↓
API route receives fallback
    ↓
API route saves ticket with fallback data
    ↓
API route returns success (not error)
    ↓
UI displays success message
```

---

### 6.3 Validation

**Shared Schema**:
- Defined once in `lib/validation/schemas.ts`
- Used in client-side forms
- Used in server-side API routes
- Ensures consistency

**Flow**:
```
User input
    ↓
Client validates with Zod schema
    ↓
If invalid, show errors (don't submit)
    ↓
If valid, submit to API
    ↓
Server validates with same Zod schema
    ↓
If invalid, return 400 Bad Request
    ↓
If valid, process request
```

---

## 7. External Dependencies

### 7.1 Third-Party Services

| Service | Purpose | Used By | Failure Handling |
|---------|---------|---------|------------------|
| Groq API | AI triage | POST /api/tickets | Fallback triage |
| Neon PostgreSQL | Data storage | All API routes | Return 500 error |
| Vercel | Hosting | Entire app | N/A (infrastructure) |

---

### 7.2 NPM Packages

| Package | Purpose | Used By |
|---------|---------|---------|
| next | Framework | Entire app |
| react | UI library | Frontend components |
| next-auth | Authentication | Auth routes, protected pages |
| drizzle-orm | ORM | Database layer |
| @neondatabase/serverless | DB driver | Database connection |
| groq-sdk | AI integration | Groq service |
| zod | Validation | Validation service |
| swr | Data fetching | Custom hooks |
| tailwindcss | Styling | Frontend components |
| typescript | Type safety | Entire app |

---

## 8. Deployment Dependencies

### 8.1 Environment Variables

**Required**:
- `DATABASE_URL`: Neon connection string
- `GROQ_API_KEY`: Groq API key
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: Application URL

**Optional**:
- `POLLING_INTERVAL`: Dashboard polling interval (default: 5000ms)

---

### 8.2 Build Dependencies

```
Source Code
    ↓
TypeScript compilation
    ↓
Next.js build
    ↓
Tailwind CSS processing
    ↓
Drizzle schema generation
    ↓
Production bundle
    ↓
Deploy to Vercel
```

---

## Dependency Summary

**Total Dependencies**:
- Frontend components: 11 components with 15+ dependencies
- API routes: 4 routes with 8+ dependencies
- Services: 5 services with 10+ dependencies
- External services: 3 (Groq, Neon, Vercel)
- NPM packages: 10+ core packages

**Key Patterns**:
- Unidirectional data flow (React)
- Server state management (SWR)
- Shared validation (Zod)
- Direct database access (Drizzle)
- Layered error handling
- Role-based access control (NextAuth)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for review
