# Design Document: IT Staff Dashboard Pages

## Overview

This design document specifies the technical implementation for two new IT staff dashboard pages in the SwiftTriage application:

1. **My Tickets Page** (`/dashboard/my-tickets`) - A dedicated view for IT staff to manage their assigned tickets with real-time updates, search/filter capabilities, and quick actions
2. **Admin Page** (`/dashboard/admin`) - A system administration interface for managing users, monitoring system health, and viewing audit logs

Both pages extend the existing dashboard functionality while maintaining strict adherence to the Phase 1 Design System, TypeScript type safety, and NextAuth role-based access control.

### Design Goals

- **Consistency**: Leverage existing UI components and design patterns
- **Real-time**: Use SWR for automatic data revalidation and live updates
- **Type Safety**: Maintain strict TypeScript typing throughout
- **Accessibility**: Follow WCAG guidelines with proper ARIA labels
- **Performance**: Optimize data fetching with appropriate polling intervals
- **Security**: Enforce role-based access control at both client and server levels

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  My Tickets Page │         │    Admin Page    │         │
│  │  /dashboard/     │         │  /dashboard/     │         │
│  │   my-tickets     │         │     admin        │         │
│  └────────┬─────────┘         └────────┬─────────┘         │
│           │                            │                    │
│           ├────────────────────────────┤                    │
│           │                            │                    │
│  ┌────────▼────────────────────────────▼─────────┐         │
│  │         SWR Data Fetching Layer               │         │
│  │  - useTickets (5s polling)                    │         │
│  │  - useSystemHealth (10s polling)              │         │
│  │  - useAuditLog (15s polling)                  │         │
│  │  - useUsers                                    │         │
│  └────────┬──────────────────────────────────────┘         │
│           │                                                 │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ /api/tickets │  │ /api/users   │  │ /api/health  │     │
│  │              │  │              │  │              │     │
│  │ GET, PATCH   │  │ GET, PATCH   │  │ GET          │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│  ┌──────▼─────────────────▼─────────────────▼───────┐     │
│  │         NextAuth Middleware                       │     │
│  │  - Session validation                             │     │
│  │  - Role-based authorization                       │     │
│  └──────┬────────────────────────────────────────────┘     │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│                   Data Layer (Drizzle ORM)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Tickets    │  │    Users     │  │  Audit Log   │     │
│  │   Table      │  │   Table      │  │   Table      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│                    Neon PostgreSQL Database                 │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
EnterpriseLayout
├── MyTicketsPage
│   ├── Card (container)
│   │   ├── Input (search)
│   │   └── DataTable
│   │       ├── TableHeader (sortable columns)
│   │       ├── TableBody
│   │       │   └── TicketRow[]
│   │       │       ├── Badge (status, urgency)
│   │       │       └── QuickActionButtons
│   │       │           ├── Button (Change Status)
│   │       │           └── Button (Add Comment)
│   │       └── EmptyState (no results)
│   └── LoadingSpinner (loading state)
│
└── AdminPage
    ├── Card (User Management Panel)
    │   ├── CardHeader
    │   ├── UserList
    │   │   └── UserRow[]
    │   │       ├── Badge (role)
    │   │       └── RoleToggle
    │   └── EmptyState (no users)
    │
    ├── Card (System Health Panel)
    │   ├── CardHeader
    │   ├── HealthBadge (Groq API)
    │   ├── HealthBadge (Neon DB)
    │   ├── Timestamp (last check)
    │   └── Button (manual refresh)
    │
    └── Card (Audit Log Panel)
        ├── CardHeader
        ├── AuditLogFeed
        │   └── AuditLogEntry[]
        │       ├── Icon (action type)
        │       ├── Description
        │       └── Timestamp (relative)
        └── EmptyState (no activity)
```

## Components and Interfaces

### 1. My Tickets Page Component

**File**: `app/dashboard/my-tickets/page.tsx`

**TypeScript Interfaces**:

```typescript
// Session type extension
interface ExtendedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: 'it_staff' | 'ADMIN' | 'end_user';
  };
}

// Ticket type (from schema)
interface Ticket {
  id: string;
  customerId: string | null;
  userInput: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
  assignedTo: string | null;
  tags: string | null;
  priority: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// SWR hook response
interface UseTicketsResponse {
  tickets: Ticket[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

// Component props
interface MyTicketsPageProps {}

// DataTable props
interface DataTableProps {
  tickets: Ticket[];
  searchQuery: string;
  sortColumn: keyof Ticket;
  sortDirection: 'asc' | 'desc';
  onSort: (column: keyof Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: string) => Promise<void>;
  onAddComment: (ticketId: string, comment: string) => Promise<void>;
}

// QuickActionButtons props
interface QuickActionButtonsProps {
  ticketId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => Promise<void>;
  onAddComment: (comment: string) => Promise<void>;
}
```

**Component Structure**:

```typescript
'use client';

export default function MyTicketsPage() {
  // Authentication
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Ticket>('urgencyScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Data fetching with SWR (5-second polling)
  const { tickets, isLoading, isError, mutate } = useTickets({
    assignedTo: session?.user?.name,
    refreshInterval: 5000
  });
  
  // Authentication guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'it_staff') {
      router.push('/dashboard');
    }
  }, [status, session, router]);
  
  // Event handlers
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    // PATCH /api/tickets/[id]
    // Trigger SWR revalidation
  };
  
  const handleAddComment = async (ticketId: string, comment: string) => {
    // POST /api/tickets/[id]/comments
    // Trigger SWR revalidation
  };
  
  // Client-side filtering and sorting
  const filteredAndSortedTickets = useMemo(() => {
    // Filter by search query
    // Sort by column and direction
    return processedTickets;
  }, [tickets, searchQuery, sortColumn, sortDirection]);
  
  // Render logic
  if (status === 'loading' || isLoading) {
    return <LoadingSpinner centered size="lg" />;
  }
  
  return (
    <EnterpriseLayout>
      <div className="p-8">
        <Card padding="lg">
          <CardHeader
            title="My Tickets"
            subtitle={`${filteredAndSortedTickets.length} tickets assigned to you`}
          />
          
          <Input
            placeholder="Search by ID, summary, category, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<SearchIcon />}
          />
          
          <DataTable
            tickets={filteredAndSortedTickets}
            searchQuery={searchQuery}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            onStatusChange={handleStatusChange}
            onAddComment={handleAddComment}
          />
        </Card>
      </div>
    </EnterpriseLayout>
  );
}
```

### 2. Admin Page Component

**File**: `app/dashboard/admin/page.tsx`

**TypeScript Interfaces**:

```typescript
// User type
interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'STAFF';
  email: string;
  createdAt: Date;
}

// System health status
interface HealthStatus {
  service: 'groq' | 'database';
  status: 'connected' | 'disconnected' | 'degraded';
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

// Audit log entry
interface AuditLogEntry {
  id: string;
  actionType: string;
  description: string;
  performedBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Component props
interface AdminPageProps {}

// User management panel props
interface UserManagementPanelProps {
  users: User[];
  onRoleToggle: (userId: string, newRole: 'ADMIN' | 'STAFF') => Promise<void>;
}

// System health panel props
interface SystemHealthPanelProps {
  groqStatus: HealthStatus;
  databaseStatus: HealthStatus;
  onRefresh: () => void;
}

// Audit log panel props
interface AuditLogPanelProps {
  entries: AuditLogEntry[];
  isLoading: boolean;
}
```

**Component Structure**:

```typescript
'use client';

export default function AdminPage() {
  // Authentication with admin check
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Data fetching with SWR
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers();
  const { groqStatus, databaseStatus, mutate: mutateHealth } = useSystemHealth({
    refreshInterval: 10000
  });
  const { entries, isLoading: auditLoading, mutate: mutateAudit } = useAuditLog({
    limit: 10,
    refreshInterval: 15000
  });
  
  // Authentication and authorization guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const userRole = (session?.user as any)?.role;
      if (userRole === 'it_staff') {
        // Non-admin IT staff - redirect to dashboard
        router.push('/dashboard');
      } else if (userRole !== 'ADMIN') {
        // End users - redirect to home
        router.push('/');
      }
    }
  }, [status, session, router]);
  
  // Event handlers
  const handleRoleToggle = async (userId: string, newRole: 'ADMIN' | 'STAFF') => {
    // PATCH /api/users/[id]
    // Trigger SWR revalidation
  };
  
  const handleHealthRefresh = () => {
    mutateHealth();
  };
  
  // Render logic
  if (status === 'loading' || usersLoading) {
    return <LoadingSpinner centered size="lg" />;
  }
  
  // Only render for ADMIN role
  if ((session?.user as any)?.role !== 'ADMIN') {
    return null;
  }
  
  return (
    <EnterpriseLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black mb-6">System Administration</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: User Management */}
          <Card padding="lg">
            <UserManagementPanel
              users={users}
              onRoleToggle={handleRoleToggle}
            />
          </Card>
          
          {/* Column 2: System Health */}
          <Card padding="lg">
            <SystemHealthPanel
              groqStatus={groqStatus}
              databaseStatus={databaseStatus}
              onRefresh={handleHealthRefresh}
            />
          </Card>
          
          {/* Column 3: Audit Log */}
          <Card padding="lg">
            <AuditLogPanel
              entries={entries}
              isLoading={auditLoading}
            />
          </Card>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
```

### 3. Custom Hooks

**File**: `hooks/useTickets.ts`

```typescript
import useSWR from 'swr';
import { Ticket } from '@/lib/db/schema';

interface UseTicketsOptions {
  assignedTo?: string;
  status?: string;
  category?: string;
  refreshInterval?: number;
}

export function useTickets(options: UseTicketsOptions = {}) {
  const { assignedTo, status, category, refreshInterval = 0 } = options;
  
  // Build query string
  const params = new URLSearchParams();
  if (assignedTo) params.append('assignedTo', assignedTo);
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  
  const { data, error, mutate } = useSWR<{ tickets: Ticket[] }>(
    `/api/tickets?${params.toString()}`,
    fetcher,
    { refreshInterval }
  );
  
  return {
    tickets: data?.tickets || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

**File**: `hooks/useSystemHealth.ts`

```typescript
import useSWR from 'swr';

interface HealthStatus {
  service: 'groq' | 'database';
  status: 'connected' | 'disconnected' | 'degraded';
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

interface UseSystemHealthOptions {
  refreshInterval?: number;
}

export function useSystemHealth(options: UseSystemHealthOptions = {}) {
  const { refreshInterval = 0 } = options;
  
  const { data, error, mutate } = useSWR<{
    groq: HealthStatus;
    database: HealthStatus;
  }>(
    '/api/health',
    fetcher,
    { refreshInterval }
  );
  
  return {
    groqStatus: data?.groq,
    databaseStatus: data?.database,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

**File**: `hooks/useAuditLog.ts`

```typescript
import useSWR from 'swr';

interface AuditLogEntry {
  id: string;
  actionType: string;
  description: string;
  performedBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface UseAuditLogOptions {
  limit?: number;
  refreshInterval?: number;
}

export function useAuditLog(options: UseAuditLogOptions = {}) {
  const { limit = 10, refreshInterval = 0 } = options;
  
  const { data, error, mutate } = useSWR<{ entries: AuditLogEntry[] }>(
    `/api/audit-log?limit=${limit}`,
    fetcher,
    { refreshInterval }
  );
  
  return {
    entries: data?.entries || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
```

## Data Models

### Extended Session Type

```typescript
// types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'it_staff' | 'ADMIN' | 'end_user';
    };
  }
  
  interface User {
    role: 'it_staff' | 'ADMIN' | 'end_user';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'it_staff' | 'ADMIN' | 'end_user';
  }
}
```

### API Response Types

```typescript
// types/api.ts

// GET /api/tickets response
export interface GetTicketsResponse {
  tickets: Ticket[];
  total: number;
}

// PATCH /api/tickets/[id] request
export interface UpdateTicketRequest {
  status?: string;
  assignedTo?: string;
  priority?: string;
}

// PATCH /api/tickets/[id] response
export interface UpdateTicketResponse {
  ticket: Ticket;
  message: string;
}

// POST /api/tickets/[id]/comments request
export interface AddCommentRequest {
  comment: string;
}

// POST /api/tickets/[id]/comments response
export interface AddCommentResponse {
  commentId: string;
  message: string;
}

// GET /api/users response
export interface GetUsersResponse {
  users: User[];
}

// PATCH /api/users/[id] request
export interface UpdateUserRequest {
  role: 'ADMIN' | 'STAFF';
}

// PATCH /api/users/[id] response
export interface UpdateUserResponse {
  user: User;
  message: string;
}

// GET /api/health response
export interface GetHealthResponse {
  groq: HealthStatus;
  database: HealthStatus;
}

// GET /api/audit-log response
export interface GetAuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
}
```

## Error Handling

### Client-Side Error Handling

**SWR Error Handling**:

```typescript
const { tickets, isLoading, isError, mutate } = useTickets({
  assignedTo: session?.user?.name,
  refreshInterval: 5000,
  onError: (error) => {
    console.error('Failed to fetch tickets:', error);
    // Show toast notification
    toast.error('Failed to load tickets. Retrying...');
  },
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Retry up to 3 times with exponential backoff
    if (retryCount >= 3) return;
    setTimeout(() => revalidate({ retryCount }), 1000 * Math.pow(2, retryCount));
  }
});

// Display error state
if (isError) {
  return (
    <ErrorEmptyState
      onRetry={() => mutate()}
    />
  );
}
```

**API Call Error Handling**:

```typescript
const handleStatusChange = async (ticketId: string, newStatus: string) => {
  try {
    const response = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update ticket');
    }
    
    // Success - trigger revalidation
    mutate();
    toast.success('Ticket status updated successfully');
  } catch (error) {
    console.error('Error updating ticket:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to update ticket');
  }
};
```

### Server-Side Error Handling

**API Route Error Responses**:

```typescript
// app/api/tickets/[id]/route.ts
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate session
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'it_staff') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const { status, assignedTo, priority } = body;
    
    // Update ticket
    const [updatedTicket] = await db
      .update(tickets)
      .set({
        status,
        assignedTo,
        priority,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, params.id))
      .returning();
    
    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ticket: updatedTicket,
      message: 'Ticket updated successfully',
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Testing Strategy

### Property-Based Testing Assessment

**PBT is NOT appropriate for this feature** because:

1. **UI Rendering**: These are React components focused on rendering and user interaction, not pure functions with universal properties
2. **External Dependencies**: Heavy reliance on NextAuth sessions, SWR data fetching, and database queries
3. **Side Effects**: Components perform side effects (API calls, navigation, state updates)
4. **Integration Focus**: Testing requires verifying integration between components, authentication, and API endpoints

**Alternative Testing Approach**: Use example-based unit tests, integration tests, and end-to-end tests.

### Unit Testing Strategy

**Component Tests** (using React Testing Library + Vitest):

```typescript
// app/dashboard/my-tickets/page.test.tsx
describe('MyTicketsPage', () => {
  it('redirects unauthenticated users to login', async () => {
    // Mock useSession to return unauthenticated
    // Verify router.push('/login') is called
  });
  
  it('redirects non-IT staff to dashboard', async () => {
    // Mock useSession with end_user role
    // Verify router.push('/dashboard') is called
  });
  
  it('displays loading spinner while fetching tickets', () => {
    // Mock useTickets to return isLoading: true
    // Verify LoadingSpinner is rendered
  });
  
  it('displays tickets in data table when loaded', () => {
    // Mock useTickets with sample tickets
    // Verify tickets are rendered in table
  });
  
  it('filters tickets by search query', () => {
    // Mock useTickets with sample tickets
    // Enter search query
    // Verify filtered results
  });
  
  it('sorts tickets by column', () => {
    // Mock useTickets with sample tickets
    // Click column header
    // Verify sort order changes
  });
  
  it('calls API when changing ticket status', async () => {
    // Mock fetch
    // Click "Change Status" button
    // Verify PATCH request sent
  });
  
  it('displays error state when fetch fails', () => {
    // Mock useTickets to return isError: true
    // Verify ErrorEmptyState is rendered
  });
});
```

**Hook Tests**:

```typescript
// hooks/useTickets.test.ts
describe('useTickets', () => {
  it('fetches tickets with correct query parameters', async () => {
    // Mock SWR fetcher
    // Call useTickets with options
    // Verify correct API endpoint called
  });
  
  it('polls for updates at specified interval', async () => {
    // Mock SWR fetcher
    // Call useTickets with refreshInterval: 5000
    // Verify fetcher called multiple times
  });
  
  it('returns loading state initially', () => {
    // Call useTickets
    // Verify isLoading is true
  });
  
  it('returns tickets when fetch succeeds', async () => {
    // Mock successful fetch
    // Verify tickets array returned
  });
  
  it('returns error state when fetch fails', async () => {
    // Mock failed fetch
    // Verify isError is true
  });
});
```

### Integration Testing Strategy

**API Integration Tests**:

```typescript
// app/api/tickets/[id]/route.test.ts
describe('PATCH /api/tickets/[id]', () => {
  it('returns 401 for unauthenticated requests', async () => {
    // Send request without session
    // Verify 401 response
  });
  
  it('returns 401 for non-IT staff', async () => {
    // Mock session with end_user role
    // Send request
    // Verify 401 response
  });
  
  it('updates ticket status successfully', async () => {
    // Mock session with it_staff role
    // Send PATCH request
    // Verify ticket updated in database
    // Verify 200 response
  });
  
  it('returns 404 for non-existent ticket', async () => {
    // Mock session with it_staff role
    // Send request with invalid ID
    // Verify 404 response
  });
});
```

**Authentication Flow Tests**:

```typescript
// integration/auth-flow.test.ts
describe('Authentication Flow', () => {
  it('allows IT staff to access My Tickets page', async () => {
    // Login as IT staff
    // Navigate to /dashboard/my-tickets
    // Verify page renders
  });
  
  it('allows admin to access Admin page', async () => {
    // Login as admin
    // Navigate to /dashboard/admin
    // Verify page renders
  });
  
  it('redirects non-admin IT staff from Admin page', async () => {
    // Login as IT staff (non-admin)
    // Navigate to /dashboard/admin
    // Verify redirect to /dashboard
  });
});
```

### End-to-End Testing Strategy

**User Workflows** (using Playwright or Cypress):

```typescript
// e2e/my-tickets.spec.ts
test('IT staff can manage their tickets', async ({ page }) => {
  // Login as IT staff
  await page.goto('/login');
  await page.fill('[data-testid="login-username"]', 'it_admin');
  await page.fill('[data-testid="login-password"]', 'password');
  await page.click('[data-testid="login-submit"]');
  
  // Navigate to My Tickets
  await page.goto('/dashboard/my-tickets');
  
  // Search for ticket
  await page.fill('input[placeholder*="Search"]', 'network');
  await expect(page.locator('table tbody tr')).toHaveCount(2);
  
  // Change ticket status
  await page.click('button:has-text("Change Status")');
  await page.click('button:has-text("In Progress")');
  await expect(page.locator('.badge:has-text("In Progress")')).toBeVisible();
  
  // Add comment
  await page.click('button:has-text("Add Comment")');
  await page.fill('textarea', 'Working on this issue');
  await page.click('button:has-text("Submit")');
  await expect(page.locator('text=Comment added successfully')).toBeVisible();
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage for components and hooks
- **Integration Tests**: All API endpoints and authentication flows
- **E2E Tests**: Critical user workflows (login, ticket management, admin actions)

### Manual Testing Checklist

- [ ] Authentication redirects work correctly for all roles
- [ ] Real-time updates appear within specified intervals
- [ ] Search and filter functionality works as expected
- [ ] Sort functionality works for all columns
- [ ] Quick actions (status change, add comment) work correctly
- [ ] Admin role toggle works and persists
- [ ] System health badges display correct status
- [ ] Audit log displays recent actions
- [ ] Error states display appropriately
- [ ] Loading states display during data fetching
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen readers can access all content

---

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Status**: Draft - Awaiting Approval
