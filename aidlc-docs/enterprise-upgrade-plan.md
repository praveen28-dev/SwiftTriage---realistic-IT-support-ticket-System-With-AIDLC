# Enterprise ITSM Dashboard Upgrade Plan

## Overview
Transforming SwiftTriage from a simple ticketing system into a comprehensive ITSM (IT Service Management) dashboard with enterprise features.

---

## Phase 1: Dependencies ✅ COMPLETE

**Installed Packages:**
- `recharts@^2.10.0` - For data visualization (pie charts, gauge charts)
- `lucide-react@^0.263.1` - For comprehensive icon library

**Command to install:**
```bash
npm install
```

---

## Phase 2: Database Schema Expansion ✅ COMPLETE

**New Tables Created:**

### 1. **customers** table
- Customer management with CDI ratings
- Fields: name, email, company, tier, annual revenue, territory, CDI rating
- Supports logo upload and primary contact

### 2. **tickets** table (Enhanced)
- Added `customerId` foreign key
- Added `assignedTo`, `tags`, `priority` fields
- Added `resolvedAt` and `updatedAt` timestamps

### 3. **products** table
- Product catalog management
- Fields: name, description, SKU, category, price

### 4. **customer_products** table
- Many-to-many relationship between customers and products
- Tracks quantity and purchase date

### 5. **activities** table
- Activity tracking for customers and tickets
- Types: Call, Email, Meeting, Note
- Links to both customers and tickets

### 6. **sla_policies** table
- SLA policy management
- Response time and resolution time tracking
- Priority-based policies

**Relations:**
- Customers → Tickets (one-to-many)
- Customers → Activities (one-to-many)
- Customers → Products (many-to-many)
- Tickets → Activities (one-to-many)

**Migration Command:**
```bash
npm run db:generate
npm run db:push
```

---

## Phase 3: Enterprise Layout Components ✅ COMPLETE

### 1. **Sidebar Component** (`app/components/layout/Sidebar.tsx`)

**Features:**
- Collapsible sidebar (64px collapsed, 256px expanded)
- Dark theme (bg-slate-900)
- Role-based navigation visibility
- Dynamic badge counts
- Smooth transitions

**Navigation Sections:**
- **Core Modules**: Dashboard, My Tickets, All Tickets
- **Management**: Ticket Tags, Knowledge Base, Community, Wiki
- **Utility**: Search, Messaging, Watercooler, Calendar
- **System** (IT Staff Only): Users, Groups, Customers, Products, Inventory, Reports, Insights, Admin

**Role-Based Access:**
- End users see: Core + Management + Utility
- IT staff see: All sections including System

### 2. **Top Navigation** (`app/components/layout/TopNav.tsx`)

**Features:**
- Global search bar with sort dropdown
- Real-time status indicators (Chat, Notifications)
- Help button
- User profile with sign-out
- Sticky positioning

### 3. **Enterprise Layout** (`app/components/layout/EnterpriseLayout.tsx`)

**Features:**
- Wraps entire application
- Manages sidebar + top nav + content area
- Responsive layout with proper spacing

---

## Phase 4: Dashboard with Data Visualization ✅ COMPLETE

### Components Created:

1. **Dashboard Page** (`app/dashboard/page.tsx`) ✅
   - Integrated EnterpriseLayout
   - Overview statistics with StatisticsCards
   - Pie chart (Open vs Closed tickets)
   - Gauge chart (CDI rating)
   - Recent ticket history widget
   - Error handling for API failures

2. **Charts Components** ✅
   - `TicketDistributionChart.tsx` - Pie chart using Recharts with legend and tooltips
   - `CDIGaugeChart.tsx` - SVG-based gauge chart with color-coded segments (Red to Green)
   - `RecentTicketsWidget.tsx` - Clickable ticket list with status icons and priority badges
   - `StatisticsCards.tsx` - Grid of metric cards with icons

### Features Implemented:
- Real-time data fetching with SWR hooks
- Responsive grid layouts
- Color-coded priority and status indicators
- Interactive charts with hover effects
- Loading states with spinner
- Error handling and display

---

## Phase 5: API Routes ✅ COMPLETE

### New API Endpoints to Create:

1. **Customers API** (`app/api/customers/route.ts`)
   - GET: List all customers with pagination
   - POST: Create new customer
   - GET by ID: Customer details with related data

2. **Products API** (`app/api/products/route.ts`)
   - GET: List all products
   - POST: Create new product

3. **Activities API** (`app/api/activities/route.ts`)
   - GET: List activities for customer/ticket
   - POST: Create new activity

4. **Dashboard Stats API** (`app/api/dashboard/route.ts`)
   - GET: Aggregated statistics for dashboard

---

## Phase 6: Custom Hooks (NEXT)

### Hooks to Create:

1. **useCustomers** - Fetch and manage customers with SWR
2. **useCustomer** - Fetch single customer with related data
3. **useProducts** - Fetch products list
4. **useActivities** - Fetch activities with polling
5. **useDashboardStats** - Fetch dashboard statistics

---

## Implementation Status

| Phase | Status | Files Created | Next Steps |
|-------|--------|---------------|------------|
| 1. Dependencies | ✅ Complete | package.json | Run `npm install` |
| 2. Database Schema | ✅ Complete | lib/db/schema.ts | Run migrations |
| 3. Layout Components | ✅ Complete | Sidebar, TopNav, EnterpriseLayout | Integrate into app |
| 4. Dashboard & Charts | ✅ Complete | Dashboard page, 4 chart components | Test dashboard |
| 5. API Routes | 🔄 Next | - | Create customer/product APIs |
| 6. Custom Hooks | ⏳ Pending | - | After Phase 5 |

---

## Next Steps for User

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Database Migrations
```bash
npm run db:generate
npm run db:push
```

### Step 3: Test the Layout
The layout components are ready. Next, I'll:
1. Create the enhanced dashboard page with charts
2. Create the customer management pages
3. Build the API routes
4. Add the custom hooks

---

## Technical Notes

### Styling Approach
- **Sidebar**: Dark theme (bg-slate-900) for high contrast
- **Content Area**: Light theme (bg-gray-50) for readability
- **Consistent spacing**: Using Tailwind's spacing scale
- **Smooth transitions**: 300ms duration on all interactive elements

### Authentication Integration
- NextAuth session data determines sidebar visibility
- Role-based access control: `end_user` vs `it_staff`
- Protected routes for admin sections

### Performance Optimization
- SWR for data fetching with automatic revalidation
- Polling intervals: 5 seconds for real-time updates
- Lazy loading for heavy components
- Optimistic UI updates

---

## File Structure

```
app/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx ✅
│   │   ├── TopNav.tsx ✅
│   │   └── EnterpriseLayout.tsx ✅
│   ├── dashboard/
│   │   ├── TicketDistributionChart.tsx (next)
│   │   ├── CDIGaugeChart.tsx (next)
│   │   └── RecentTicketsWidget.tsx (next)
│   └── customers/
│       ├── CustomerTabs.tsx (next)
│       ├── CustomerInfoCard.tsx (next)
│       └── CustomerMetadataGrid.tsx (next)
├── dashboard/
│   └── page.tsx (to be enhanced)
├── customers/
│   ├── page.tsx (next)
│   └── [id]/
│       └── page.tsx (next)
└── api/
    ├── customers/
    │   └── route.ts (next)
    ├── products/
    │   └── route.ts (next)
    └── dashboard/
        └── route.ts (next)

lib/
└── db/
    └── schema.ts ✅ (expanded)
```

---

## Estimated Timeline

- **Phase 4** (Dashboard & Charts): 30-45 minutes
- **Phase 5** (API Routes): 20-30 minutes
- **Phase 6** (Custom Hooks): 15-20 minutes

**Total remaining**: ~1.5-2 hours for complete enterprise upgrade

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Phases 1-3 Complete, Ready for Phase 4


---

## Phase 7: Advanced Dashboard Widgets (NEW - Based on Web Help Desk Analysis)

This phase implements a comprehensive widget system inspired by the Web Help Desk dashboard interface.

### Widget System Architecture

**Core Components:**
1. **Widget Container** - Reusable card component with drag-and-drop support
2. **Widget Header** - Title bar with controls (drag handle, menu icon)
3. **Widget Content** - Pluggable content area for different widget types
4. **Widget Grid** - Dashboard layout manager with CSS Grid

### Widget Types to Implement:

#### 1. Tickets by Status (Pie Chart Widget)
- **Component**: `app/components/widgets/TicketsByStatusWidget.tsx`
- **API**: `GET /api/v1/tickets/stats?group_by=status`
- **Features**:
  - Pie chart visualization using Recharts
  - Clickable legend items with dynamic counts `[33] Open`
  - Color-coded status indicators (blue, orange, green, red, etc.)
  - Routes to filtered ticket list on click: `/tickets?status=Open`
  - Legend items: Open, Closed, Resolved, Approved, Pending, Cancelled, Assigned, Denied

#### 2. Tickets by Tech Group (Pie Chart Widget)
- **Component**: `app/components/widgets/TicketsByTechGroupWidget.tsx`
- **API**: `GET /api/v1/tickets/stats?group_by=tech_group`
- **Features**:
  - Workload distribution visualization across tech teams
  - Clickable legend routing to filtered views: `/tickets?tech_group=DesktopSupport`
  - Tech group color coding with distinct colors per group
  - Groups: E-Mail Reports, IT Desktop Support, IT Network Support, Human Resources, Legal, Facilities, IT Hardware Support, IT Project, Web, IT Changes

#### 3. Tickets by Alert Level (Pie Chart Widget)
- **Component**: `app/components/widgets/TicketsByAlertLevelWidget.tsx`
- **API**: `GET /api/v1/tickets/stats?group_by=alert_level`
- **Features**:
  - SLA alert status visualization
  - Three-tier alert system: No Alerts, Second Alert Level, Third Alert Level
  - Drill-down to filtered tickets: `/tickets?alert=level3`
  - Color-coded urgency indicators

#### 4. Tickets by Request Type (Horizontal Bar Chart Widget)
- **Component**: `app/components/widgets/TicketsByRequestTypeWidget.tsx`
- **API**: `GET /api/v1/tickets/stats?group_by=request_type&sort=desc`
- **Features**:
  - Horizontal bar chart with varying bar lengths
  - Sorted by volume (descending) - highest volume at top
  - Clickable counts for drill-down: clicking "7" routes to `/tickets?request_type=upgrade`
  - Request type labels on Y-axis: Upgrade Request, Installation Request, Web, Insurance, Phones, etc.
  - X-axis shows numeric counts

#### 5. Ticket Activity Feed (Dynamic List Widget)
- **Component**: `app/components/widgets/TicketActivityWidget.tsx`
- **API**: `GET /api/v1/activity-feed?limit=5`
- **Features**:
  - Real-time activity stream showing recent ticket changes
  - Expandable/collapsible entries with chevron icon
  - Ticket ID badge (teal/dark blue rectangle with number)
  - User profile links: clicking "Joe Admin" routes to `/users/:id`
  - Ticket links: clicking entire entry routes to `/tickets/:id`
  - Timestamp display: "6 days ago" (relative time)
  - Action type indicators: "De-escalated to Joe Admin"
  - Comment snippets: "Schedule change - postponing release"
  - Expand/collapse icon: Double downward-pointing chevrons in circle

#### 6. Tickets by Alert Condition (Simple Bar Chart Widget)
- **Component**: `app/components/widgets/TicketsByAlertConditionWidget.tsx`
- **API**: `GET /api/v1/tickets/stats?group_by=alert_condition`
- **Features**:
  - Minimalistic bar chart
  - Two categories: "No Alerts" and "Not Completed"
  - Clickable counts: clicking "41" routes to `/tickets?alert_cond=not_completed`
  - Monitors SLA breaches and incomplete tasks

### Widget Configuration System

**Database Schema Addition:**
```typescript
// Add to lib/db/schema.ts

export const widgetConfigs = pgTable('widget_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  widgetType: varchar('widget_type', { length: 100 }).notNull(), // 'tickets_by_status', 'tickets_by_tech_group', etc.
  title: varchar('title', { length: 255 }).notNull(),
  gridPosition: integer('grid_position').notNull(), // Position in dashboard grid
  gridColumn: integer('grid_column').default(1), // Column span (1-3)
  gridRow: integer('grid_row').default(1), // Row span
  queryConfig: text('query_config'), // JSON string with widget-specific filters
  isVisible: boolean('is_visible').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const widgetConfigsRelations = relations(widgetConfigs, ({ one }) => ({
  // Relations if needed
}));
```

**Widget Configuration API Endpoints:**
- `GET /api/v1/dashboard/widgets` - Get user's widget configuration
- `POST /api/v1/dashboard/widgets` - Add new widget to dashboard
- `PUT /api/v1/dashboard/widgets/:id` - Update widget config (title, position, filters)
- `DELETE /api/v1/dashboard/widgets/:id` - Remove widget from dashboard
- `PUT /api/v1/dashboard/widgets/reorder` - Update grid positions after drag-and-drop

### Widget Interaction Patterns

**Drag-and-Drop Functionality:**
- Use `@dnd-kit/core` for drag-and-drop
- Drag handle: Six gray dots icon in widget header
- Persist new positions to database via API
- Smooth animations during reorder
- Visual feedback during drag (shadow, opacity)

**Widget Header Menu:**
- Hamburger icon (three horizontal lines) in widget header
- Dropdown menu options:
  - **Edit Widget** - Opens configuration modal to change title, filters, display options
  - **Remove Widget** - Shows confirmation dialog, then removes from dashboard
  - **Refresh Data** - Manually triggers data refetch from API
  - **Export Data** - Downloads widget data as CSV or JSON file

**Drill-Down Navigation:**
- **Legend clicks**: `/tickets?status=Open` (filter by clicked status)
- **Count clicks**: `/tickets?request_type=upgrade` (filter by clicked type)
- **User clicks**: `/users/:id` (view user profile)
- **Ticket clicks**: `/tickets/:id` (view ticket details)
- **Activity entry clicks**: `/tickets/:id` (view related ticket)

### Statistics API Design

**Endpoint**: `GET /api/v1/tickets/stats`

**Query Parameters:**
- `group_by`: status | tech_group | alert_level | request_type | alert_condition
- `sort`: asc | desc (default: desc)
- `limit`: number (default: 20)
- `date_range`: last_7_days | last_30_days | last_90_days | custom
- `start_date`: ISO date string (for custom range)
- `end_date`: ISO date string (for custom range)
- `filters`: JSON string with additional filters (e.g., `{"priority": "Critical"}`)

**Response Format:**
```json
{
  "data": [
    {
      "label": "Open",
      "value": "open",
      "count": 33,
      "color": "#007bff",
      "percentage": 61.1
    },
    {
      "label": "Closed",
      "value": "closed",
      "count": 10,
      "color": "#fd7e14",
      "percentage": 18.5
    },
    {
      "label": "Resolved",
      "value": "resolved",
      "count": 1,
      "color": "#10b981",
      "percentage": 1.9
    }
  ],
  "total": 54,
  "timestamp": "2026-05-05T12:00:00Z",
  "group_by": "status"
}
```

### Activity Feed API Design

**Endpoint**: `GET /api/v1/activity-feed`

**Query Parameters:**
- `limit`: number (default: 5, max: 50)
- `offset`: number (for pagination)
- `ticket_id`: UUID (filter by specific ticket)
- `user_id`: UUID (filter by specific user)
- `action_types`: comma-separated list (e.g., `status_change,comment,assignment`)

**Response Format:**
```json
{
  "activities": [
    {
      "id": 108,
      "ticket_id": "456abc",
      "ticket_number": "#35000953",
      "action_type": "status_change",
      "action_detail": "De-escalated to Joe Admin",
      "comment_snippet": "Schedule change - postponing release",
      "user_id": "789def",
      "user_name": "Joe Admin",
      "user_avatar": "/avatars/joe.jpg",
      "timestamp": "2023-10-21T09:00:00Z",
      "relative_time": "6 days ago",
      "is_expandable": true,
      "expanded_content": "Full comment text here..."
    }
  ],
  "total": 150,
  "has_more": true,
  "next_offset": 5
}
```

### Implementation Files Structure:

```
app/
├── components/
│   ├── widgets/
│   │   ├── WidgetContainer.tsx          # Reusable widget wrapper with drag-and-drop
│   │   ├── WidgetHeader.tsx             # Header with title, drag handle, menu
│   │   ├── WidgetMenu.tsx               # Dropdown menu component
│   │   ├── WidgetGrid.tsx               # Dashboard grid layout manager
│   │   ├── TicketsByStatusWidget.tsx    # Pie chart - status distribution
│   │   ├── TicketsByTechGroupWidget.tsx # Pie chart - tech group workload
│   │   ├── TicketsByAlertLevelWidget.tsx # Pie chart - SLA alerts
│   │   ├── TicketsByRequestTypeWidget.tsx # Horizontal bar - request types
│   │   ├── TicketActivityWidget.tsx     # Activity feed list
│   │   └── TicketsByAlertConditionWidget.tsx # Simple bar - alert conditions
│   └── dashboard/
│       ├── DashboardWidgetGrid.tsx      # Main dashboard with widget grid
│       └── WidgetConfigModal.tsx        # Modal for editing widget settings
└── api/
    └── v1/
        ├── tickets/
        │   └── stats/
        │       └── route.ts             # Statistics aggregation endpoint
        ├── activity-feed/
        │   └── route.ts                 # Activity feed endpoint
        └── dashboard/
            └── widgets/
                ├── route.ts             # GET (list), POST (create)
                ├── [id]/
                │   └── route.ts         # PUT (update), DELETE (remove)
                └── reorder/
                    └── route.ts         # PUT (reorder positions)

hooks/
├── useWidgetConfig.ts                   # Manage user's widget configuration
├── useTicketStats.ts                    # Fetch ticket statistics
├── useActivityFeed.ts                   # Fetch activity feed with polling
└── useWidgetDragDrop.ts                 # Handle drag-and-drop logic

lib/
└── db/
    └── schema.ts                        # Add widgetConfigs table
```

### Color Palette for Widgets

**Status Colors:**
- Open: `#007bff` (blue)
- Closed: `#fd7e14` (orange)
- Resolved: `#10b981` (green)
- Approved: `#dc3545` (red)
- Pending: `#17a2b8` (light blue)
- Cancelled: `#ffc107` (light orange)
- Assigned: `#28a745` (light green)
- Denied: `#f8d7da` (light red)

**Tech Group Colors:**
- Use a predefined palette with 10+ distinct colors
- Assign colors consistently per group name

**Alert Level Colors:**
- No Alerts: `#1e3a8a` (dark blue)
- Second Alert: `#f97316` (orange)
- Third Alert: `#3b82f6` (medium blue)

### Widget Drag-and-Drop Implementation

**Using @dnd-kit/core:**

```typescript
// Example structure
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

function DashboardWidgetGrid({ widgets, onReorder }) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      // Update widget positions
      onReorder(active.id, over?.id);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={widgets} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-3 gap-6">
          {widgets.map(widget => (
            <SortableWidget key={widget.id} widget={widget} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
```

### Next Steps for Phase 7:

1. **Add widget_configs table to database schema**
2. **Create widget container and header components**
3. **Implement drag-and-drop with @dnd-kit**
4. **Create statistics API endpoint**
5. **Create activity feed API endpoint**
6. **Build individual widget components**
7. **Create widget configuration API**
8. **Add widget management hooks**
9. **Integrate widgets into dashboard page**
10. **Test drag-and-drop and drill-down navigation**

---

## Updated Implementation Status

| Phase | Status | Files Created | Next Steps |
|-------|--------|---------------|------------|
| 1. Dependencies | ✅ Complete | package.json | Run `npm install` |
| 2. Database Schema | ✅ Complete | lib/db/schema.ts | Run migrations |
| 3. Layout Components | ✅ Complete | Sidebar, TopNav, EnterpriseLayout | ✓ Integrated |
| 4. Dashboard & Charts | ✅ Complete | Dashboard page, 4 chart components | ✓ Working |
| 5. API Routes | ✅ Complete | 5 API endpoints | ✓ Tested |
| 6. Custom Hooks | ✅ Complete | 3 hooks (useCustomers, useCustomer, useProducts) | ✓ Working |
| 7. Advanced Widgets | 🔄 Next | - | Implement widget system |

---

**Document Version**: 2.0  
**Last Updated**: 2026-05-05  
**Status**: Phases 1-6 Complete, Phase 7 (Advanced Widgets) Ready to Start
