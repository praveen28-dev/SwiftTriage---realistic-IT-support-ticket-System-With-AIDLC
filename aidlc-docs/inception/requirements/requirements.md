# SwiftTriage - Requirements Document

## Intent Analysis Summary

**User Request**: Build SwiftTriage - a self-hosted, edge-deployed IT ticketing system with AI-powered triage

**Request Type**: New Project (Greenfield)

**Scope Estimate**: Single application with multiple components (frontend form, API routes, database, AI integration, IT dashboard)

**Complexity Estimate**: Moderate - Clear technical stack with well-defined AI integration, role-based authentication, and dashboard features

---

## 1. Functional Requirements

### 1.1 User Roles and Authentication
- **FR-1.1.1**: System shall support role-based authentication with three user types:
  - End Users: Submit tickets and view submission confirmation
  - IT Staff: Access dashboard to view and manage all tickets
  - Admins: Full system access (future consideration)
- **FR-1.1.2**: Authentication mechanism to be implemented (username/password or similar)

### 1.2 Ticket Submission (End User)
- **FR-1.2.1**: End users shall submit IT issues via a web form
- **FR-1.2.2**: Form shall accept free-text description of the IT problem
- **FR-1.2.3**: Upon submission, system shall display a unique Ticket ID immediately
- **FR-1.2.4**: Users shall NOT be able to track or view their tickets after submission (view-only submission)

### 1.3 AI-Powered Triage
- **FR-1.3.1**: System shall integrate with Groq API using `llama3-8b-8192` model
- **FR-1.3.2**: AI shall analyze ticket text and return structured JSON with:
  - `category`: One of [Hardware, Network, Access, Software, Uncategorized]
  - `urgency_score`: Integer from 1 (low) to 5 (critical)
  - `ai_summary`: One-sentence professional summary of the issue
- **FR-1.3.3**: System shall use the following exact prompt for Groq API:
  > "You are an IT Helpdesk Triage AI. Analyze the user's IT problem. You must respond ONLY with a valid JSON object matching this schema: { "category": "String (Must be Hardware, Network, Access, Software, or Uncategorized)", "urgency_score": "Number (1 to 5)", "ai_summary": "String (A clean, professional 1-sentence summary)" }. Do not include markdown formatting, conversational text, or explanations."

### 1.4 Data Persistence
- **FR-1.4.1**: System shall store all ticket data in Neon PostgreSQL database
- **FR-1.4.2**: Database schema shall include:
  - `id`: UUID (Primary Key, auto-generated)
  - `user_input`: Text (original user complaint)
  - `category`: Varchar (AI-generated category)
  - `urgency_score`: Integer (AI-generated urgency 1-5)
  - `ai_summary`: Text (AI-generated summary)
  - `status`: Varchar (default: 'PENDING')
  - `created_at`: Timestamp (auto-generated)
- **FR-1.4.3**: Ticket data shall be retained indefinitely for audit and reporting purposes

### 1.5 IT Staff Dashboard
- **FR-1.5.1**: IT staff shall access a dashboard showing all tickets
- **FR-1.5.2**: Dashboard shall support filtering by:
  - Category (Hardware, Network, Access, Software, Uncategorized)
  - Urgency score (1-5)
  - Status (PENDING, IN_PROGRESS, RESOLVED, etc.)
  - Date range
- **FR-1.5.3**: Dashboard shall display tickets in a sortable list/table view
- **FR-1.5.4**: Default sort order shall be by urgency score (highest first)

### 1.6 Real-time Updates
- **FR-1.6.1**: Dashboard shall implement polling mechanism to check for new tickets
- **FR-1.6.2**: Polling interval shall be configurable (suggested: every 5-10 seconds)
- **FR-1.6.3**: New tickets shall appear in dashboard without manual page refresh

### 1.7 Reporting and Analytics
- **FR-1.7.1**: System shall provide basic statistics:
  - Total ticket count
  - Ticket count by category
  - Urgency score distribution
  - Average urgency score
- **FR-1.7.2**: Statistics shall be displayed on IT staff dashboard
- **FR-1.7.3**: Statistics shall update with polling mechanism

### 1.8 Error Handling
- **FR-1.8.1**: If Groq API fails or is unavailable:
  - System shall save ticket with original user input
  - Category shall be set to "Uncategorized"
  - Urgency score shall be set to 3 (medium)
  - AI summary shall be set to first 100 characters of user input
  - Status shall be set to "PENDING_TRIAGE"
- **FR-1.8.2**: System shall log all API errors for monitoring

---

## 2. Non-Functional Requirements

### 2.1 Technology Stack (Mandatory Constraints)
- **NFR-2.1.1**: Frontend framework: Next.js 14+ with App Router
- **NFR-2.1.2**: UI library: React with TypeScript
- **NFR-2.1.3**: Styling: Tailwind CSS
- **NFR-2.1.4**: Backend: Vercel Serverless Route Handlers (e.g., `app/api/triage/route.ts`)
- **NFR-2.1.5**: Database: Neon Serverless PostgreSQL
- **NFR-2.1.6**: ORM: Drizzle ORM
- **NFR-2.1.7**: AI Service: Groq API with `llama3-8b-8192` model
- **NFR-2.1.8**: Deployment: Vercel hosting (standard deployment)
- **NFR-2.1.9**: NO AWS, Docker, or traditional servers

### 2.2 Performance
- **NFR-2.2.1**: Ticket submission shall complete within 3 seconds (including AI triage)
- **NFR-2.2.2**: Dashboard shall load within 2 seconds
- **NFR-2.2.3**: System shall support 1-10 concurrent users (small team scale)
- **NFR-2.2.4**: Polling mechanism shall not degrade performance

### 2.3 Scalability
- **NFR-2.3.1**: Architecture shall leverage serverless scaling (Vercel + Neon)
- **NFR-2.3.2**: Database connection pooling shall be implemented via Neon serverless driver
- **NFR-2.3.3**: System designed for small team (1-10 users) but architecture supports growth

### 2.4 Security
- **NFR-2.4.1**: Security extension rules are NOT enforced (prototype/PoC approach)
- **NFR-2.4.2**: Basic authentication shall be implemented for role separation
- **NFR-2.4.3**: Environment variables shall be used for sensitive credentials (Groq API key, database URL)
- **NFR-2.4.4**: API routes shall validate user roles before granting access

### 2.5 Reliability
- **NFR-2.5.1**: System shall gracefully handle Groq API failures (see FR-1.8.1)
- **NFR-2.5.2**: Database operations shall include error handling with try/catch blocks
- **NFR-2.5.3**: User shall always receive ticket confirmation, even if AI triage fails

### 2.6 Maintainability
- **NFR-2.6.1**: Code shall be production-ready with no placeholder comments
- **NFR-2.6.2**: All functions shall include proper TypeScript typing
- **NFR-2.6.3**: Error handling shall be comprehensive with try/catch blocks
- **NFR-2.6.4**: Code shall follow Next.js 14 App Router best practices

### 2.7 Testing
- **NFR-2.7.1**: Property-based testing rules are NOT enforced (simple CRUD application)
- **NFR-2.7.2**: Manual testing approach acceptable for initial version
- **NFR-2.7.3**: Unit tests for critical paths (API routes, AI integration) recommended but not mandatory

### 2.8 Usability
- **NFR-2.8.1**: UI shall be clean and intuitive using Tailwind CSS
- **NFR-2.8.2**: Ticket submission form shall be simple (single text area)
- **NFR-2.8.3**: Dashboard shall be responsive and mobile-friendly
- **NFR-2.8.4**: Loading states shall be displayed during AI processing

---

## 3. System Architecture Flow

```
┌─────────────┐
│  End User   │
│  (Browser)  │
└──────┬──────┘
       │ 1. Submit IT Issue (text)
       ▼
┌─────────────────────────────┐
│  Next.js Frontend (React)   │
│  - Ticket Submission Form   │
│  - Tailwind CSS Styling     │
└──────┬──────────────────────┘
       │ 2. POST /api/triage
       ▼
┌─────────────────────────────┐
│  Vercel API Route Handler   │
│  app/api/triage/route.ts    │
└──────┬──────────────────────┘
       │ 3. Call Groq API
       ▼
┌─────────────────────────────┐
│      Groq API Service       │
│   (llama3-8b-8192 model)    │
└──────┬──────────────────────┘
       │ 4. Return JSON
       │    {category, urgency_score, ai_summary}
       ▼
┌─────────────────────────────┐
│  Vercel API Route Handler   │
│  - Drizzle ORM Insert       │
└──────┬──────────────────────┘
       │ 5. Save to Database
       ▼
┌─────────────────────────────┐
│   Neon PostgreSQL Database  │
│   (tickets table)           │
└─────────────────────────────┘
       │ 6. Return Ticket ID
       ▼
┌─────────────────────────────┐
│  Next.js Frontend (React)   │
│  - Display Ticket ID        │
└─────────────────────────────┘

┌─────────────┐
│  IT Staff   │
│  (Browser)  │
└──────┬──────┘
       │ Access Dashboard
       ▼
┌─────────────────────────────┐
│  Next.js Dashboard Page     │
│  - Polling (5-10s interval) │
│  - Filters & Sorting        │
│  - Basic Statistics         │
└──────┬──────────────────────┘
       │ GET /api/tickets
       ▼
┌─────────────────────────────┐
│  Vercel API Route Handler   │
│  - Drizzle ORM Query        │
│  - Role-based Access Check  │
└──────┬──────────────────────┘
       │ Query Database
       ▼
┌─────────────────────────────┐
│   Neon PostgreSQL Database  │
│   (tickets table)           │
└─────────────────────────────┘
```

---

## 4. Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | No | Requirements Analysis |
| Property-Based Testing | No | Requirements Analysis |

---

## 5. Key Constraints and Decisions

### 5.1 Technology Constraints
- **MUST USE**: Next.js 14+, Vercel, Neon, Drizzle ORM, Groq API
- **MUST NOT USE**: AWS, Docker, traditional servers

### 5.2 Architectural Decisions
- **Serverless-first**: Leverage Vercel and Neon serverless capabilities
- **Polling over WebSockets**: Simpler implementation for small team scale
- **Fail-safe AI**: Always save ticket even if AI fails
- **View-only submission**: Users cannot track tickets (IT staff only)

### 5.3 Scope Boundaries
- **In Scope**: Ticket submission, AI triage, IT dashboard, basic stats, role-based auth
- **Out of Scope**: Ticket assignment, SLA tracking, advanced workflows, user ticket tracking, email notifications

---

## 6. Success Criteria

1. End users can submit IT issues via web form
2. Groq AI successfully triages tickets into categories with urgency scores
3. Tickets are persisted in Neon database with all required fields
4. IT staff can view all tickets in a filterable dashboard
5. Dashboard updates automatically via polling
6. Basic statistics are displayed on dashboard
7. System handles Groq API failures gracefully
8. Application deploys successfully to Vercel

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Approved (pending user confirmation)
