# SwiftTriage - Component Methods and Signatures

## Overview
This document defines method signatures and interfaces for all components in SwiftTriage. Detailed business logic will be implemented during Code Generation.

---

## 1. Frontend Component Methods

### 1.1 TicketSubmissionForm

```typescript
interface TicketSubmissionFormProps {
  onSuccess?: (ticketId: string) => void;
  onError?: (error: Error) => void;
}

// Component methods
function TicketSubmissionForm(props: TicketSubmissionFormProps): JSX.Element;

// Internal handlers
function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>): void;
function handleSubmit(event: React.FormEvent): Promise<void>;
function validateInput(input: string): { valid: boolean; errors: string[] };
function resetForm(): void;
```

---

### 1.2 TicketSuccessMessage

```typescript
interface TicketSuccessMessageProps {
  ticketId: string;
  timestamp: Date;
  onSubmitAnother: () => void;
}

function TicketSuccessMessage(props: TicketSuccessMessageProps): JSX.Element;
```

---

### 1.3 DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name: string; role: string };
}

function DashboardLayout(props: DashboardLayoutProps): JSX.Element;
```

---

### 1.4 TicketFilters

```typescript
interface TicketFiltersProps {
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  onClearFilters: () => void;
}

function TicketFilters(props: TicketFiltersProps): JSX.Element;

// Internal handlers
function handleCategoryChange(category: string): void;
function handleUrgencyChange(urgency: number): void;
function handleStatusChange(status: string): void;
function handleDateRangeChange(dateFrom: string, dateTo: string): void;
```

---

### 1.5 TicketList

```typescript
interface TicketListProps {
  filters: TicketFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

function TicketList(props: TicketListProps): JSX.Element;

// Internal methods
function handleSort(column: string): void;
function handleRowClick(ticketId: string): void;
```

---

### 1.6 TicketRow

```typescript
interface TicketRowProps {
  ticket: Ticket;
  onClick: (ticketId: string) => void;
  expanded: boolean;
}

function TicketRow(props: TicketRowProps): JSX.Element;

// Internal methods
function toggleExpanded(): void;
function getUrgencyColor(urgency: number): string;
function getCategoryColor(category: string): string;
```

---

### 1.7 StatsPanel

```typescript
interface StatsPanelProps {
  refreshInterval?: number;
}

function StatsPanel(props: StatsPanelProps): JSX.Element;

// Internal methods
function formatPercentage(value: number, total: number): string;
function getCategoryChartData(distribution: CategoryDistribution[]): ChartData;
```

---

### 1.8 Shared UI Components

```typescript
// Button
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

function Button(props: ButtonProps): JSX.Element;

// Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'category' | 'urgency' | 'status';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

function Badge(props: BadgeProps): JSX.Element;

// LoadingSpinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  centered?: boolean;
}

function LoadingSpinner(props: LoadingSpinnerProps): JSX.Element;

// ErrorMessage
interface ErrorMessageProps {
  message: string;
  severity?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

function ErrorMessage(props: ErrorMessageProps): JSX.Element;
```

---

## 2. API Route Handler Methods

### 2.1 POST /api/tickets/route.ts

```typescript
// Request handler
async function POST(request: NextRequest): Promise<NextResponse>;

// Internal functions
async function validateTicketSubmission(body: unknown): Promise<{ userInput: string }>;
async function createTicket(userInput: string): Promise<TicketResponse>;
function handleGroqError(error: Error): TriageResult;
```

**Request Body Type**:
```typescript
interface TicketSubmissionRequest {
  userInput: string;
}
```

**Response Type**:
```typescript
interface TicketResponse {
  ticketId: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
  createdAt: string;
}
```

---

### 2.2 GET /api/tickets/route.ts

```typescript
// Request handler
async function GET(request: NextRequest): Promise<NextResponse>;

// Internal functions
async function validateQueryParams(searchParams: URLSearchParams): Promise<TicketQueryParams>;
async function fetchTickets(params: TicketQueryParams): Promise<TicketListResponse>;
function buildWhereClause(filters: TicketFilters): SQL;
function buildOrderByClause(sortBy: string, sortOrder: string): SQL;
```

**Query Parameters Type**:
```typescript
interface TicketQueryParams {
  category?: string;
  urgency?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

**Response Type**:
```typescript
interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
}
```

---

### 2.3 GET /api/stats/route.ts

```typescript
// Request handler
async function GET(request: NextRequest): Promise<NextResponse>;

// Internal functions
async function fetchStatistics(): Promise<TicketStatistics>;
async function getCategoryDistribution(): Promise<CategoryDistribution[]>;
async function getUrgencyDistribution(): Promise<UrgencyDistribution[]>;
async function getStatusDistribution(): Promise<StatusDistribution[]>;
async function calculateAverageUrgency(): Promise<number>;
```

**Response Type**:
```typescript
interface TicketStatistics {
  totalTickets: number;
  categoryDistribution: CategoryDistribution[];
  urgencyDistribution: UrgencyDistribution[];
  averageUrgency: number;
  statusDistribution: StatusDistribution[];
}

interface CategoryDistribution {
  category: string;
  count: number;
}

interface UrgencyDistribution {
  urgency: number;
  count: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}
```

---

### 2.4 /api/auth/[...nextauth]/route.ts

```typescript
// NextAuth configuration
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => Promise<User | null>,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => Promise<JWT>,
    session: async ({ session, token }) => Promise<Session>,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

// Route handlers
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**User Type**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'end_user' | 'it_staff' | 'admin';
}
```

---

## 3. Service Layer Methods

### 3.1 Groq AI Service

```typescript
// lib/services/groqService.ts

/**
 * Triage a ticket using Groq AI
 * @param userInput - The user's IT issue description
 * @returns Triage result with category, urgency, and summary
 * @throws Error if Groq API fails after retries
 */
async function triageTicket(userInput: string): Promise<TriageResult>;

/**
 * Build the system prompt for Groq API
 * @returns System prompt string
 */
function buildSystemPrompt(): string;

/**
 * Parse and validate Groq API response
 * @param response - Raw response from Groq API
 * @returns Validated triage result
 * @throws Error if response is invalid
 */
function parseGroqResponse(response: unknown): TriageResult;

/**
 * Get fallback triage result when Groq API fails
 * @param userInput - Original user input
 * @returns Fallback triage result
 */
function getFallbackTriage(userInput: string): TriageResult;
```

**TriageResult Type**:
```typescript
interface TriageResult {
  category: 'Hardware' | 'Network' | 'Access' | 'Software' | 'Uncategorized';
  urgency_score: number; // 1-5
  ai_summary: string;
}
```

---

### 3.2 Validation Service

```typescript
// lib/validation/schemas.ts

import { z } from 'zod';

// Ticket submission schema
const ticketSubmissionSchema = z.object({
  userInput: z.string()
    .min(10, 'Issue description must be at least 10 characters')
    .max(5000, 'Issue description must not exceed 5000 characters'),
});

// Ticket filters schema
const ticketFiltersSchema = z.object({
  category: z.enum(['Hardware', 'Network', 'Access', 'Software', 'Uncategorized']).optional(),
  urgency: z.number().int().min(1).max(5).optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Ticket sort schema
const ticketSortSchema = z.object({
  sortBy: z.enum(['urgency', 'createdAt', 'category', 'status']).default('urgency'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export validation functions
export function validateTicketSubmission(data: unknown): z.infer<typeof ticketSubmissionSchema>;
export function validateTicketFilters(data: unknown): z.infer<typeof ticketFiltersSchema>;
export function validateTicketSort(data: unknown): z.infer<typeof ticketSortSchema>;

// Export inferred types
export type TicketSubmission = z.infer<typeof ticketSubmissionSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type TicketSort = z.infer<typeof ticketSortSchema>;
```

---

## 4. Database Layer Methods

### 4.1 Drizzle Schema

```typescript
// lib/db/schema.ts

import { pgTable, uuid, text, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const tickets = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userInput: text('user_input').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  urgencyScore: integer('urgency_score').notNull(),
  aiSummary: text('ai_summary').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Export inferred types
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
```

---

### 4.2 Database Connection

```typescript
// lib/db/connection.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * Initialize database connection
 * @returns Drizzle database instance
 */
function initializeDatabase(): ReturnType<typeof drizzle>;

// Export database instance
export const db: ReturnType<typeof drizzle>;
```

---

## 5. Configuration Methods

### 5.1 Config Module

```typescript
// lib/config.ts

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

/**
 * Load and validate configuration from environment variables
 * @returns Typed configuration object
 * @throws Error if required variables are missing
 */
function loadConfig(): Config;

/**
 * Validate required environment variables exist
 * @throws Error if any required variable is missing
 */
function validateEnv(): void;

// Export config instance
export const config: Config;
```

---

## 6. Custom Hooks (React)

### 6.1 useTickets Hook

```typescript
// hooks/useTickets.ts

import useSWR from 'swr';

interface UseTicketsOptions {
  filters?: TicketFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  refreshInterval?: number;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

/**
 * Fetch tickets with SWR and optional polling
 * @param options - Query options and filters
 * @returns Tickets data and SWR utilities
 */
function useTickets(options: UseTicketsOptions): UseTicketsReturn;
```

---

### 6.2 useStats Hook

```typescript
// hooks/useStats.ts

import useSWR from 'swr';

interface UseStatsOptions {
  refreshInterval?: number;
}

interface UseStatsReturn {
  stats: TicketStatistics | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

/**
 * Fetch ticket statistics with SWR and optional polling
 * @param options - Polling options
 * @returns Statistics data and SWR utilities
 */
function useStats(options: UseStatsOptions): UseStatsReturn;
```

---

### 6.3 useTicketSubmission Hook

```typescript
// hooks/useTicketSubmission.ts

interface UseTicketSubmissionReturn {
  submitTicket: (userInput: string) => Promise<TicketResponse>;
  isSubmitting: boolean;
  error: Error | null;
  reset: () => void;
}

/**
 * Handle ticket submission with loading and error states
 * @returns Submission function and state
 */
function useTicketSubmission(): UseTicketSubmissionReturn;
```

---

## 7. Utility Functions

### 7.1 Error Handling Utilities

```typescript
// lib/utils/errors.ts

/**
 * Create standardized API error response
 * @param message - Error message
 * @param status - HTTP status code
 * @returns NextResponse with error
 */
function createErrorResponse(message: string, status: number): NextResponse;

/**
 * Log error with context
 * @param error - Error object
 * @param context - Additional context
 */
function logError(error: Error, context: Record<string, unknown>): void;

/**
 * Check if error is a Groq API error
 * @param error - Error object
 * @returns True if Groq API error
 */
function isGroqError(error: Error): boolean;
```

---

### 7.2 Formatting Utilities

```typescript
// lib/utils/format.ts

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
function formatRelativeTime(date: Date): string;

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
function truncateText(text: string, maxLength: number): string;

/**
 * Format UUID for display (show first 8 characters)
 * @param uuid - UUID string
 * @returns Shortened UUID
 */
function formatTicketId(uuid: string): string;
```

---

## Method Summary

**Total Methods/Functions**: 50+

**By Layer**:
- Frontend Components: 15 methods
- API Route Handlers: 12 methods
- Service Layer: 8 methods
- Database Layer: 4 methods
- Configuration: 3 methods
- Custom Hooks: 3 hooks
- Utility Functions: 8 functions

**Key Patterns**:
- Async/await for all API calls
- Try-catch error handling in all async functions
- TypeScript strict typing throughout
- Zod validation for all external inputs
- SWR for data fetching and caching
- NextAuth for authentication

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for review
