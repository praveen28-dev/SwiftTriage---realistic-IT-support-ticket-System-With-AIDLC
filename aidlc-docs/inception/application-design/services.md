# SwiftTriage - Service Layer Design

## Overview
This document defines the service layer architecture for SwiftTriage, including service responsibilities, orchestration patterns, and integration points.

---

## 1. Service Architecture Principles

### 1.1 Design Decisions
- **Dedicated service functions** for external integrations (Groq AI)
- **Direct database access** from API routes using Drizzle ORM
- **Shared validation** using Zod schemas across client and server
- **Layered error handling** with different strategies per layer

### 1.2 Service Boundaries
- **Groq Service**: Encapsulates all Groq API interactions
- **Validation Service**: Provides shared validation schemas
- **Config Service**: Centralizes environment configuration
- **Database Layer**: Direct Drizzle queries in API routes (no separate repository)

---

## 2. Groq AI Service

### 2.1 Service Definition

**File**: `lib/services/groqService.ts`

**Purpose**: Encapsulate Groq API integration for AI-powered ticket triage

**Responsibilities**:
- Initialize Groq client with API key from config
- Send ticket text to Groq API with system prompt
- Parse and validate JSON response
- Handle API errors with retry logic
- Provide fallback triage when API fails
- Log API interactions for monitoring

---

### 2.2 Service Interface

```typescript
interface GroqService {
  triageTicket(userInput: string): Promise<TriageResult>;
}

interface TriageResult {
  category: 'Hardware' | 'Network' | 'Access' | 'Software' | 'Uncategorized';
  urgency_score: number; // 1-5
  ai_summary: string;
}
```

---

### 2.3 Service Implementation Pattern

```typescript
// Initialize Groq client
const groq = new Groq({
  apiKey: config.groq.apiKey,
});

// System prompt (exact as specified in requirements)
const SYSTEM_PROMPT = `You are an IT Helpdesk Triage AI. Analyze the user's IT problem. 
You must respond ONLY with a valid JSON object matching this schema: 
{ 
  "category": "String (Must be Hardware, Network, Access, Software, or Uncategorized)", 
  "urgency_score": "Number (1 to 5)", 
  "ai_summary": "String (A clean, professional 1-sentence summary)" 
}. 
Do not include markdown formatting, conversational text, or explanations.`;

// Main triage function
async function triageTicket(userInput: string): Promise<TriageResult> {
  try {
    // Call Groq API
    const response = await groq.chat.completions.create({
      model: config.groq.model, // llama3-8b-8192
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userInput },
      ],
      temperature: 0.3, // Low temperature for consistent categorization
      max_tokens: 200,
    });

    // Parse and validate response
    const result = parseGroqResponse(response);
    return result;
  } catch (error) {
    // Log error
    logError(error, { context: 'groqService.triageTicket', userInput });
    
    // Return fallback triage
    return getFallbackTriage(userInput);
  }
}

// Fallback triage when Groq fails
function getFallbackTriage(userInput: string): TriageResult {
  return {
    category: 'Uncategorized',
    urgency_score: 3,
    ai_summary: userInput.substring(0, 100),
  };
}
```

---

### 2.4 Error Handling Strategy

**Groq API Errors**:
- Network errors → Return fallback triage
- Rate limit errors → Return fallback triage (no retry to avoid delays)
- Invalid response → Return fallback triage
- Timeout errors → Return fallback triage

**Logging**:
- Log all Groq API errors with context
- Log fallback triage usage for monitoring
- Track API response times

**No Retry Logic**: Per requirements (FR-1.8.1), fail gracefully without retries to maintain fast response times.

---

## 3. Validation Service

### 3.1 Service Definition

**File**: `lib/validation/schemas.ts`

**Purpose**: Provide shared validation schemas for client and server

**Responsibilities**:
- Define Zod schemas for all input validation
- Export validation functions
- Provide TypeScript type inference
- Ensure consistent validation across layers

---

### 3.2 Validation Schemas

```typescript
import { z } from 'zod';

// Ticket submission validation
export const ticketSubmissionSchema = z.object({
  userInput: z.string()
    .min(10, 'Issue description must be at least 10 characters')
    .max(5000, 'Issue description must not exceed 5000 characters')
    .trim(),
});

// Ticket filters validation
export const ticketFiltersSchema = z.object({
  category: z.enum(['Hardware', 'Network', 'Access', 'Software', 'Uncategorized']).optional(),
  urgency: z.coerce.number().int().min(1).max(5).optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Ticket sort validation
export const ticketSortSchema = z.object({
  sortBy: z.enum(['urgency', 'createdAt', 'category', 'status']).default('urgency'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export validation functions
export const validateTicketSubmission = (data: unknown) => 
  ticketSubmissionSchema.parse(data);

export const validateTicketFilters = (data: unknown) => 
  ticketFiltersSchema.parse(data);

export const validateTicketSort = (data: unknown) => 
  ticketSortSchema.parse(data);

// Export inferred types
export type TicketSubmission = z.infer<typeof ticketSubmissionSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type TicketSort = z.infer<typeof ticketSortSchema>;
```

---

### 3.3 Usage Pattern

**Client-side (React)**:
```typescript
import { ticketSubmissionSchema } from '@/lib/validation/schemas';

function TicketForm() {
  const handleSubmit = (userInput: string) => {
    try {
      // Validate before submission
      ticketSubmissionSchema.parse({ userInput });
      // Submit to API
    } catch (error) {
      // Show validation errors
    }
  };
}
```

**Server-side (API Route)**:
```typescript
import { validateTicketSubmission } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = validateTicketSubmission(body);
    // Process validated input
  } catch (error) {
    // Return 400 Bad Request
  }
}
```

---

## 4. Configuration Service

### 4.1 Service Definition

**File**: `lib/config.ts`

**Purpose**: Centralize environment configuration with type safety

**Responsibilities**:
- Load environment variables
- Validate required variables exist
- Provide typed config object
- Fail fast on missing configuration

---

### 4.2 Configuration Structure

```typescript
interface Config {
  database: {
    url: string;
  };
  groq: {
    apiKey: string;
    model: string;
  };
  nextAuth: {
    secret: string;
    url: string;
  };
  app: {
    pollingInterval: number;
  };
}

function loadConfig(): Config {
  // Validate required env vars
  const requiredVars = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    database: {
      url: process.env.DATABASE_URL!,
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY!,
      model: 'llama3-8b-8192',
    },
    nextAuth: {
      secret: process.env.NEXTAUTH_SECRET!,
      url: process.env.NEXTAUTH_URL!,
    },
    app: {
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '5000', 10),
    },
  };
}

export const config = loadConfig();
```

---

### 4.3 Usage Pattern

```typescript
import { config } from '@/lib/config';

// Access typed configuration
const apiKey = config.groq.apiKey;
const dbUrl = config.database.url;
const pollingInterval = config.app.pollingInterval;
```

---

## 5. Database Access Pattern

### 5.1 Direct Drizzle Queries

**Pattern**: Database queries are executed directly in API route handlers using Drizzle ORM

**Rationale**:
- Simple application with straightforward queries
- Drizzle provides type-safe query builder
- No need for additional abstraction layer
- Keeps code co-located with API logic

---

### 5.2 Database Query Examples

**Insert Ticket**:
```typescript
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';

// In API route handler
const [newTicket] = await db.insert(tickets).values({
  userInput,
  category: triageResult.category,
  urgencyScore: triageResult.urgency_score,
  aiSummary: triageResult.ai_summary,
  status: 'PENDING',
}).returning();
```

**Query Tickets with Filters**:
```typescript
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

// Build where clause
const conditions = [];
if (filters.category) {
  conditions.push(eq(tickets.category, filters.category));
}
if (filters.urgency) {
  conditions.push(eq(tickets.urgencyScore, filters.urgency));
}
if (filters.dateFrom) {
  conditions.push(gte(tickets.createdAt, new Date(filters.dateFrom)));
}

// Execute query
const results = await db
  .select()
  .from(tickets)
  .where(and(...conditions))
  .orderBy(desc(tickets.urgencyScore));
```

**Aggregate Statistics**:
```typescript
import { db } from '@/lib/db/connection';
import { tickets } from '@/lib/db/schema';
import { count, avg } from 'drizzle-orm';

// Category distribution
const categoryStats = await db
  .select({
    category: tickets.category,
    count: count(),
  })
  .from(tickets)
  .groupBy(tickets.category);

// Average urgency
const [avgResult] = await db
  .select({
    average: avg(tickets.urgencyScore),
  })
  .from(tickets);
```

---

## 6. Authentication Service (NextAuth.js)

### 6.1 Service Definition

**File**: `app/api/auth/[...nextauth]/route.ts`

**Purpose**: Handle authentication using NextAuth.js library

**Responsibilities**:
- Configure authentication providers
- Manage user sessions
- Define user roles
- Protect API routes

---

### 6.2 NextAuth Configuration

```typescript
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials (simplified for MVP)
        // In production, verify against database
        if (credentials?.username && credentials?.password) {
          // Determine role based on username pattern
          const role = credentials.username.startsWith('it_') 
            ? 'it_staff' 
            : 'end_user';
          
          return {
            id: credentials.username,
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: config.nextAuth.secret,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

### 6.3 Role-Based Access Control

**Middleware Pattern**:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function requireRole(role: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  if (session.user.role !== role) {
    throw new Error('Forbidden');
  }
  
  return session;
}

// Usage in API route
export async function GET(request: NextRequest) {
  try {
    await requireRole('it_staff');
    // Proceed with IT staff-only logic
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

---

## 7. Error Handling Service

### 7.1 Layered Error Handling

**UI Layer (React)**:
- React Error Boundaries for component errors
- Try-catch in event handlers
- Display user-friendly error messages
- Log errors to console (dev) or monitoring service (prod)

**API Layer (Route Handlers)**:
- Try-catch in all route handlers
- Validate inputs with Zod
- Return appropriate HTTP status codes
- Log errors with context

**Service Layer (Groq, etc.)**:
- Try-catch in service functions
- Return fallback values on error
- Log errors with full context
- Don't throw errors up to API layer

---

### 7.2 Error Utility Functions

```typescript
// lib/utils/errors.ts

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

export function logError(error: Error, context: Record<string, unknown>) {
  console.error('[ERROR]', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

export function isGroqError(error: Error): boolean {
  return error.message.includes('Groq') || error.name === 'GroqError';
}
```

---

## 8. Service Orchestration Patterns

### 8.1 Ticket Submission Flow

```
User submits form
    ↓
Client-side validation (Zod schema)
    ↓
POST /api/tickets
    ↓
Server-side validation (Zod schema)
    ↓
Call groqService.triageTicket()
    ↓
    ├─ Success: Get triage result
    └─ Failure: Get fallback triage
    ↓
Insert ticket into database (Drizzle)
    ↓
Return ticket response to client
    ↓
Display success message with Ticket ID
```

---

### 8.2 Dashboard Data Flow

```
Dashboard component mounts
    ↓
useTickets hook initializes SWR
    ↓
GET /api/tickets (with filters)
    ↓
Validate query params (Zod schema)
    ↓
Check authentication (NextAuth)
    ↓
Query database (Drizzle with filters)
    ↓
Return ticket list
    ↓
SWR caches and displays data
    ↓
SWR polls every 5 seconds (refreshInterval)
    ↓
Auto-update UI with new tickets
```

---

### 8.3 Statistics Flow

```
StatsPanel component mounts
    ↓
useStats hook initializes SWR
    ↓
GET /api/stats
    ↓
Check authentication (NextAuth)
    ↓
Execute aggregate queries (Drizzle)
    ├─ Category distribution
    ├─ Urgency distribution
    ├─ Status distribution
    └─ Average urgency
    ↓
Return statistics object
    ↓
SWR caches and displays data
    ↓
SWR polls every 5 seconds (refreshInterval)
    ↓
Auto-update stats
```

---

## 9. Service Dependencies

### 9.1 External Dependencies

- **Groq SDK**: `groq-sdk` npm package
- **Drizzle ORM**: `drizzle-orm` and `@neondatabase/serverless`
- **NextAuth.js**: `next-auth` for authentication
- **Zod**: `zod` for validation
- **SWR**: `swr` for data fetching

---

### 9.2 Internal Dependencies

```
API Routes
    ↓
    ├─ groqService (Groq AI integration)
    ├─ Validation schemas (Zod)
    ├─ Database connection (Drizzle)
    ├─ Config (environment variables)
    └─ Error utilities

Frontend Components
    ↓
    ├─ Custom hooks (useTickets, useStats)
    ├─ Validation schemas (Zod)
    └─ API routes (fetch)

Custom Hooks
    ↓
    ├─ SWR (data fetching)
    └─ API routes (fetch)
```

---

## 10. Service Testing Strategy

### 10.1 Unit Testing

**Groq Service**:
- Mock Groq API responses
- Test successful triage
- Test fallback on error
- Test response parsing

**Validation Service**:
- Test valid inputs pass
- Test invalid inputs fail
- Test edge cases (min/max lengths)

---

### 10.2 Integration Testing

**API Routes**:
- Test end-to-end ticket submission
- Test ticket retrieval with filters
- Test authentication checks
- Test error responses

---

## Service Summary

**Total Services**: 5
1. Groq AI Service (external integration)
2. Validation Service (shared schemas)
3. Configuration Service (env management)
4. Authentication Service (NextAuth.js)
5. Error Handling Service (utilities)

**Service Patterns**:
- Dedicated services for external integrations
- Direct database access (no repository layer)
- Shared validation across layers
- Layered error handling
- Type-safe configuration

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for review
