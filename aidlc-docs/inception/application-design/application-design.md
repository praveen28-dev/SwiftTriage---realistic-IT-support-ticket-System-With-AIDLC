# SwiftTriage - Application Design

## Document Overview

This consolidated document provides a complete overview of the SwiftTriage application design, including architecture, components, services, and dependencies.

**Related Documents**:
- [components.md](./components.md) - Detailed component definitions
- [component-methods.md](./component-methods.md) - Method signatures and interfaces
- [services.md](./services.md) - Service layer architecture
- [component-dependency.md](./component-dependency.md) - Dependencies and data flow

---

## 1. Architecture Overview

### 1.1 System Architecture

SwiftTriage follows a modern serverless architecture pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Browser)                   │
│  ┌────────────────────┐      ┌──────────────────────────┐  │
│  │  Ticket Submission │      │   IT Staff Dashboard     │  │
│  │  (End Users)       │      │   (IT Staff)             │  │
│  └────────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js Application (Vercel)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Frontend (React Components + Tailwind CSS)         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Routes (Serverless Functions)                  │   │
│  │  - POST /api/tickets                                │   │
│  │  - GET /api/tickets                                 │   │
│  │  - GET /api/stats                                   │   │
│  │  - /api/auth/[...nextauth]                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Service Layer                                       │   │
│  │  - Groq AI Service                                  │   │
│  │  - Validation Service (Zod)                         │   │
│  │  - Config Service                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
                    ▼                    ▼
         ┌──────────────────┐  ┌──────────────────┐
         │   Groq API       │  │  Neon PostgreSQL │
         │  (llama3-8b-8192)│  │  (Serverless DB) │
         └──────────────────┘  └──────────────────┘
```

---

### 1.2 Technology Stack

**Frontend**:
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS
- SWR (data fetching)

**Backend**:
- Vercel Serverless Functions
- Next.js API Routes
- NextAuth.js (authentication)

**Database**:
- Neon (Serverless PostgreSQL)
- Drizzle ORM

**AI Integration**:
- Groq API (llama3-8b-8192 model)

**Validation**:
- Zod (schema validation)

---

### 1.3 Design Principles

1. **Serverless-First**: Leverage Vercel and Neon serverless capabilities
2. **Type Safety**: TypeScript throughout, types generated from Drizzle schema
3. **Shared Validation**: Single Zod schema used by client and server
4. **Layered Error Handling**: Different strategies per layer (UI, API, Service)
5. **Fail-Safe AI**: Always save ticket even if Groq API fails
6. **Real-time Updates**: SWR polling for dashboard auto-refresh
7. **Role-Based Access**: NextAuth.js for authentication and authorization

---

## 2. Application Structure

### 2.1 Directory Structure

```
swifttriage/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx          # Login page
│   ├── submit/
│   │   └── page.tsx              # Ticket submission page
│   ├── dashboard/
│   │   └── page.tsx              # IT staff dashboard
│   ├── api/
│   │   ├── tickets/
│   │   │   └── route.ts          # POST/GET tickets
│   │   ├── stats/
│   │   │   └── route.ts          # GET statistics
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth handler
│   ├── components/
│   │   ├── tickets/
│   │   │   ├── TicketSubmissionForm.tsx
│   │   │   └── TicketSuccessMessage.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── TicketFilters.tsx
│   │   │   ├── TicketList.tsx
│   │   │   ├── TicketRow.tsx
│   │   │   └── StatsPanel.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorMessage.tsx
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/
│   ├── services/
│   │   └── groqService.ts        # Groq AI integration
│   ├── validation/
│   │   └── schemas.ts            # Zod validation schemas
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   └── connection.ts         # Database connection
│   ├── types/
│   │   └── api.ts                # API type definitions
│   ├── utils/
│   │   ├── errors.ts             # Error utilities
│   │   └── format.ts             # Formatting utilities
│   └── config.ts                 # Configuration
├── hooks/
│   ├── useTickets.ts             # Tickets data hook
│   ├── useStats.ts               # Statistics hook
│   └── useTicketSubmission.ts   # Submission hook
├── drizzle.config.ts             # Drizzle configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies
└── .env.local                    # Environment variables
```

---

## 3. Component Architecture

### 3.1 Frontend Components (11 total)

**Ticket Submission** (2 components):
- `TicketSubmissionForm`: Main form for submitting IT issues
- `TicketSuccessMessage`: Confirmation message with Ticket ID

**Dashboard** (6 components):
- `DashboardLayout`: Layout wrapper with auth
- `TicketFilters`: Filter controls (category, urgency, status, date)
- `TicketList`: Ticket table with sorting
- `TicketRow`: Individual ticket row
- `StatsPanel`: Statistics display with charts

**Shared UI** (4 components):
- `Button`: Reusable button with variants
- `Badge`: Status/category badges
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display

---

### 3.2 API Routes (4 handlers)

**Ticket Management**:
- `POST /api/tickets`: Create ticket with AI triage
- `GET /api/tickets`: Retrieve tickets with filters

**Analytics**:
- `GET /api/stats`: Get ticket statistics

**Authentication**:
- `/api/auth/[...nextauth]`: NextAuth.js handler

---

### 3.3 Service Layer (5 services)

**Core Services**:
- **Groq AI Service**: AI-powered triage integration
- **Validation Service**: Shared Zod schemas
- **Configuration Service**: Environment config management
- **Authentication Service**: NextAuth.js setup
- **Error Handling Service**: Error utilities

---

## 4. Data Model

### 4.1 Database Schema

**tickets table**:
```typescript
{
  id: UUID (primary key, auto-generated)
  userInput: Text (not null)
  category: Varchar (not null)
  urgencyScore: Integer (not null, 1-5)
  aiSummary: Text (not null)
  status: Varchar (not null, default: 'PENDING')
  createdAt: Timestamp (not null, default: now())
}
```

**Categories**: Hardware, Network, Access, Software, Uncategorized

**Statuses**: PENDING, PENDING_TRIAGE, IN_PROGRESS, RESOLVED

---

### 4.2 TypeScript Types

**Generated from Drizzle Schema**:
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

**API Types**:
```typescript
interface TriageResult {
  category: string;
  urgency_score: number;
  ai_summary: string;
}

interface TicketFilters {
  category?: string;
  urgency?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

---

## 5. Key Workflows

### 5.1 Ticket Submission Workflow

1. **User enters issue** in TicketSubmissionForm
2. **Client-side validation** using Zod schema
3. **Submit to API** via POST /api/tickets
4. **Server-side validation** using same Zod schema
5. **Call Groq AI** via groqService.triageTicket()
6. **Groq returns triage** (or fallback if error)
7. **Save to database** using Drizzle ORM
8. **Return ticket response** with ID and triage data
9. **Display success** with Ticket ID

**Error Handling**: If Groq fails, use fallback triage (Uncategorized, urgency 3, truncated summary)

---

### 5.2 Dashboard Workflow

1. **IT staff logs in** via NextAuth.js
2. **Dashboard loads** with DashboardLayout
3. **Fetch tickets** via useTickets hook (SWR)
4. **Fetch statistics** via useStats hook (SWR)
5. **Apply filters** via TicketFilters component
6. **Display tickets** in TicketList with sorting
7. **Display stats** in StatsPanel
8. **Auto-refresh** every 5 seconds via SWR polling

**Authentication**: All dashboard routes require IT staff role

---

### 5.3 Authentication Workflow

1. **User navigates to /login**
2. **Enter credentials** (username/password)
3. **Submit to NextAuth** via POST /api/auth/signin
4. **Validate credentials** in CredentialsProvider
5. **Determine role** (end_user or it_staff)
6. **Create JWT token** with role
7. **Set session cookie**
8. **Redirect** to /submit (end users) or /dashboard (IT staff)

---

## 6. Design Decisions

### 6.1 Component Organization

**Decision**: Feature-based frontend components

**Rationale**:
- Clear separation of concerns (tickets vs dashboard)
- Easy to locate related components
- Scales well as features grow

---

### 6.2 API Route Structure

**Decision**: RESTful resource-based routes

**Rationale**:
- Standard REST conventions
- Single route handles GET/POST for same resource
- Clean URL structure

---

### 6.3 Validation Strategy

**Decision**: Shared Zod schemas

**Rationale**:
- Single source of truth for validation rules
- Type inference for TypeScript
- Consistent validation across client and server
- Reduces code duplication

---

### 6.4 Authentication

**Decision**: NextAuth.js with JWT sessions

**Rationale**:
- Industry-standard authentication library
- Built-in session management
- Easy role-based access control
- Serverless-friendly (JWT, no session store)

---

### 6.5 Database Access

**Decision**: Direct Drizzle queries in API routes

**Rationale**:
- Simple application with straightforward queries
- Drizzle provides type-safe query builder
- No need for additional abstraction layer
- Keeps code co-located with API logic

---

### 6.6 AI Integration

**Decision**: Dedicated Groq service with fallback

**Rationale**:
- Encapsulates external API integration
- Easy to test and mock
- Fail-safe design (always save ticket)
- Centralized error handling

---

### 6.7 State Management

**Decision**: SWR for server state, React hooks for local state

**Rationale**:
- SWR handles caching, revalidation, and polling
- No need for global state library (simple app)
- React hooks sufficient for form state
- Reduces complexity

---

### 6.8 Polling Implementation

**Decision**: SWR refreshInterval

**Rationale**:
- Built-in polling support
- Automatic deduplication
- Handles focus/visibility changes
- Simple configuration

---

### 6.9 Type Safety

**Decision**: Generate types from Drizzle schema

**Rationale**:
- Single source of truth (database schema)
- Automatic type updates when schema changes
- Reduces type definition duplication
- Compile-time safety

---

### 6.10 Configuration

**Decision**: Centralized config module

**Rationale**:
- Type-safe access to environment variables
- Fail-fast on missing configuration
- Easy to test and mock
- Clear configuration structure

---

## 7. Non-Functional Requirements Implementation

### 7.1 Performance

**Target**: Ticket submission < 3 seconds, Dashboard load < 2 seconds

**Implementation**:
- Serverless functions (auto-scaling)
- Neon serverless database (connection pooling)
- SWR caching (reduce API calls)
- Optimistic UI updates
- Groq API (high-speed inference)

---

### 7.2 Scalability

**Target**: Support 1-10 concurrent users (small team)

**Implementation**:
- Vercel serverless (auto-scaling)
- Neon serverless (auto-scaling)
- Stateless API routes
- JWT sessions (no session store)

---

### 7.3 Reliability

**Target**: Graceful degradation on AI failure

**Implementation**:
- Fallback triage when Groq fails
- Try-catch in all async functions
- Error logging for monitoring
- Always save ticket (never lose data)

---

### 7.4 Security

**Target**: Basic authentication, role-based access

**Implementation**:
- NextAuth.js for authentication
- JWT sessions (secure cookies)
- Role-based access control in API routes
- Environment variables for secrets
- Input validation (Zod)

---

### 7.5 Maintainability

**Target**: Production-ready code, no placeholders

**Implementation**:
- TypeScript strict mode
- Comprehensive error handling
- Clear component structure
- Shared validation schemas
- Centralized configuration

---

## 8. Testing Strategy

### 8.1 Unit Testing

**Components**:
- Test form validation
- Test button variants
- Test badge colors
- Test error messages

**Services**:
- Mock Groq API responses
- Test fallback triage
- Test validation schemas

---

### 8.2 Integration Testing

**API Routes**:
- Test ticket submission end-to-end
- Test ticket retrieval with filters
- Test authentication checks
- Test error responses

---

### 8.3 Manual Testing

**User Flows**:
- Submit ticket as end user
- View dashboard as IT staff
- Apply filters and sorting
- Verify polling updates
- Test Groq API failure handling

---

## 9. Deployment Architecture

### 9.1 Vercel Deployment

**Build Process**:
1. TypeScript compilation
2. Next.js build
3. Tailwind CSS processing
4. Drizzle schema generation
5. Deploy to Vercel

**Environment Variables**:
- `DATABASE_URL`: Neon connection string
- `GROQ_API_KEY`: Groq API key
- `NEXTAUTH_SECRET`: NextAuth secret
- `NEXTAUTH_URL`: Application URL
- `POLLING_INTERVAL`: Dashboard polling (optional)

---

### 9.2 Database Setup

**Neon PostgreSQL**:
1. Create Neon project
2. Get connection string
3. Run Drizzle migrations
4. Verify schema

**Drizzle Commands**:
```bash
# Generate migrations
npx drizzle-kit generate:pg

# Push schema to database
npx drizzle-kit push:pg
```

---

## 10. Success Criteria

### 10.1 Functional Criteria

- ✅ End users can submit IT issues
- ✅ Groq AI triages tickets into categories
- ✅ Tickets saved to Neon database
- ✅ IT staff can view all tickets
- ✅ Dashboard filters work correctly
- ✅ Dashboard auto-refreshes via polling
- ✅ Basic statistics displayed
- ✅ Groq API failures handled gracefully
- ✅ Role-based authentication works

---

### 10.2 Technical Criteria

- ✅ TypeScript compiles without errors
- ✅ No placeholder comments
- ✅ Proper error handling (try-catch)
- ✅ Environment variables configured
- ✅ Application deploys to Vercel
- ✅ Database schema matches requirements
- ✅ All API routes return correct responses
- ✅ Frontend components render correctly

---

## 11. Future Enhancements

**Out of Scope for MVP** (potential future additions):
- Ticket assignment to IT staff
- Email notifications
- SLA tracking
- Advanced workflows (escalation, approval)
- User ticket tracking (view own tickets)
- Advanced analytics and reporting
- Mobile app
- Multi-language support

---

## Document Summary

**Application Design Complete**:
- 23 components defined
- 4 API routes specified
- 5 services designed
- Complete data model
- Key workflows documented
- Design decisions explained
- NFR implementation planned
- Testing strategy outlined
- Deployment architecture defined

**Ready for Code Generation**: All components, methods, services, and dependencies are fully specified and ready for implementation.

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Approved (pending user confirmation)
