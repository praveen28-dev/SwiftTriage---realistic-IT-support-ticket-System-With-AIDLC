# SwiftTriage Performance Optimization Guide

## Overview
This guide provides detailed performance optimization strategies for SwiftTriage to ensure fast, responsive user experience at scale.

---

## 1. Frontend Performance Optimizations

### Already Implemented ✅

#### Code Splitting
- Next.js automatic code splitting enabled
- Dynamic imports for heavy components
- Route-based code splitting
- Vendor bundle optimization

#### Image Optimization
- Next.js Image component ready (when images added)
- Automatic WebP conversion
- Responsive image sizing
- Lazy loading by default

#### Font Optimization
- System fonts used (no external font loading)
- Font display swap for custom fonts
- Preload critical fonts

#### CSS Optimization
- Tailwind CSS with PurgeCSS
- Unused styles removed in production
- CSS minification enabled
- Critical CSS inlined

### Recommended Improvements

#### 1. Implement React.memo for Widgets
```typescript
// Memoize widget components to prevent unnecessary re-renders
export const TicketsByStatusWidget = React.memo(({ id, data, onEdit, onRemove, onRefresh }) => {
  // Component code
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.data === nextProps.data && prevProps.id === nextProps.id;
});
```

#### 2. Virtualize Long Lists
```typescript
// For activity feed with many items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={activities.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ActivityItem activity={activities[index]} />
    </div>
  )}
</FixedSizeList>
```

#### 3. Debounce Search Inputs
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => {
    setSearchQuery(value);
  },
  300 // 300ms delay
);
```

#### 4. Optimize Re-renders
```typescript
// Use useCallback for event handlers
const handleRefresh = useCallback((widgetType: string) => {
  // Refresh logic
}, []);

// Use useMemo for expensive calculations
const sortedWidgets = useMemo(() => {
  return [...widgets].sort((a, b) => a.gridPosition - b.gridPosition);
}, [widgets]);
```

---

## 2. API Performance Optimizations

### Already Implemented ✅

#### Database Query Optimization
- Drizzle ORM with prepared statements
- Parameterized queries (SQL injection prevention)
- Connection pooling via Neon
- Efficient joins for related data

#### Response Optimization
- JSON serialization optimized
- Gzip compression enabled (Vercel default)
- Appropriate HTTP status codes
- Pagination implemented

### Recommended Improvements

#### 1. Add Database Indexes
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_widget_configs_user_id ON widget_configs(user_id);
```

#### 2. Implement Response Caching
```typescript
// Add caching headers to API routes
export async function GET(request: NextRequest) {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

#### 3. Optimize Statistics Queries
```typescript
// Use database aggregation instead of in-memory
const stats = await db
  .select({
    status: tickets.status,
    count: sql<number>`count(*)`,
  })
  .from(tickets)
  .groupBy(tickets.status);
```

#### 4. Implement Query Result Caching
```typescript
// Use Redis or in-memory cache for frequently accessed data
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function getTicketStats(groupBy: string) {
  const cacheKey = `stats:${groupBy}`;
  const cached = cache.get(cacheKey);
  
  if (cached) return cached;
  
  const stats = await fetchStats(groupBy);
  cache.set(cacheKey, stats);
  
  return stats;
}
```

---

## 3. Database Performance

### Connection Pooling Configuration
```typescript
// drizzle.config.ts
export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};
```

### Query Optimization Checklist
- [ ] Add indexes on foreign keys
- [ ] Add indexes on frequently filtered columns
- [ ] Use EXPLAIN ANALYZE to identify slow queries
- [ ] Avoid N+1 queries (use joins)
- [ ] Limit result sets appropriately
- [ ] Use database-level aggregation
- [ ] Avoid SELECT * (select specific columns)
- [ ] Use prepared statements

### Monitoring Queries
```sql
-- Find slow queries (PostgreSQL)
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 4. SWR Configuration Optimization

### Current Configuration
```typescript
// Optimize SWR settings for production
const { data, error } = useSWR(
  '/api/tickets/stats',
  fetcher,
  {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000, // Prevent duplicate requests within 2s
    errorRetryCount: 3,
    errorRetryInterval: 5000,
    shouldRetryOnError: true,
    keepPreviousData: true, // Show stale data while revalidating
  }
);
```

### Recommended Adjustments
```typescript
// Different intervals for different data types
const POLLING_INTERVALS = {
  realtime: 5000,    // Activity feed
  frequent: 30000,   // Ticket stats
  moderate: 60000,   // Customer data
  infrequent: 300000, // Configuration data
};

// Conditional polling based on visibility
const { data } = useSWR(
  '/api/tickets/stats',
  fetcher,
  {
    refreshInterval: document.hidden ? 0 : POLLING_INTERVALS.frequent,
    revalidateOnFocus: true,
  }
);
```

---

## 5. Bundle Size Optimization

### Current Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check .next/analyze/ for bundle report
```

### Optimization Strategies

#### 1. Dynamic Imports for Heavy Libraries
```typescript
// Lazy load Recharts only when needed
const RechartsComponents = dynamic(
  () => import('./RechartsComponents'),
  { loading: () => <LoadingSpinner /> }
);
```

#### 2. Tree Shaking
```typescript
// Import only what you need
import { PieChart, Pie } from 'recharts'; // ✅ Good
// import * as Recharts from 'recharts'; // ❌ Bad
```

#### 3. Remove Unused Dependencies
```bash
# Find unused dependencies
npx depcheck

# Remove unused packages
npm uninstall <package-name>
```

---

## 6. Monitoring & Metrics

### Performance Monitoring Setup

#### 1. Web Vitals Tracking
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

#### 2. Custom Performance Metrics
```typescript
// lib/utils/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  
  console.log(`${name} took ${end - start}ms`);
  
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: Math.round(end - start),
    });
  }
}
```

#### 3. API Response Time Tracking
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const start = Date.now();
  
  return NextResponse.next({
    headers: {
      'X-Response-Time': `${Date.now() - start}ms`,
    },
  });
}
```

---

## 7. Caching Strategy

### Multi-Layer Caching

#### 1. Browser Cache (Client-Side)
```typescript
// SWR handles this automatically
// Data cached in memory
// Revalidation on focus/reconnect
```

#### 2. CDN Cache (Edge)
```typescript
// Vercel Edge Network
// Static assets cached automatically
// API routes can opt-in to caching
```

#### 3. Application Cache (Server-Side)
```typescript
// Redis or in-memory cache
// For expensive computations
// Shared across requests
```

#### 4. Database Cache
```typescript
// PostgreSQL query cache
// Connection pooling
// Prepared statement cache
```

### Cache Invalidation Strategy
```typescript
// Invalidate cache on data mutation
export async function POST(request: NextRequest) {
  const newTicket = await createTicket(data);
  
  // Invalidate related caches
  await cache.del('stats:status');
  await cache.del('stats:priority');
  
  // Trigger SWR revalidation
  await revalidatePath('/dashboard');
  
  return NextResponse.json(newTicket);
}
```

---

## 8. Load Testing

### Tools
- **Artillery**: Load testing
- **k6**: Performance testing
- **Lighthouse CI**: Automated audits

### Load Test Script (Artillery)
```yaml
# load-test.yml
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Dashboard flow"
    flow:
      - get:
          url: "/login"
      - post:
          url: "/api/auth/signin"
          json:
            email: "test@example.com"
            password: "password"
      - get:
          url: "/dashboard"
      - get:
          url: "/api/v1/tickets/stats?group_by=status"
```

### Run Load Test
```bash
npm install -g artillery
artillery run load-test.yml
```

---

## 9. Performance Budget

### Target Metrics
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint | < 1.8s | TBD | ⏳ |
| Largest Contentful Paint | < 2.5s | TBD | ⏳ |
| Time to Interactive | < 3.8s | TBD | ⏳ |
| Cumulative Layout Shift | < 0.1 | TBD | ⏳ |
| First Input Delay | < 100ms | TBD | ⏳ |
| Total Bundle Size | < 500KB | ~87KB | ✅ |
| API Response Time (p95) | < 500ms | TBD | ⏳ |
| Database Query Time (p95) | < 100ms | TBD | ⏳ |

### Monitoring Commands
```bash
# Lighthouse audit
npx lighthouse https://your-domain.com --view

# Bundle analysis
npm run build
# Check .next/analyze/

# Performance profiling
# Use Chrome DevTools Performance tab
```

---

## 10. Quick Wins Checklist

### Immediate Optimizations (< 1 hour)
- [ ] Enable gzip compression (Vercel default)
- [ ] Add Cache-Control headers to static assets
- [ ] Optimize images with next/image
- [ ] Remove console.logs in production
- [ ] Enable React strict mode
- [ ] Add loading skeletons

### Short-term Optimizations (< 1 day)
- [ ] Add database indexes
- [ ] Implement React.memo for widgets
- [ ] Add debouncing to search
- [ ] Optimize SWR polling intervals
- [ ] Add error boundaries
- [ ] Implement retry logic

### Medium-term Optimizations (< 1 week)
- [ ] Implement response caching
- [ ] Add Redis for session storage
- [ ] Virtualize long lists
- [ ] Optimize database queries
- [ ] Add performance monitoring
- [ ] Implement lazy loading

---

## 11. Performance Testing Checklist

### Before Deployment
- [ ] Run Lighthouse audit (score > 90)
- [ ] Test with slow 3G network
- [ ] Test with CPU throttling (4x slowdown)
- [ ] Check bundle size (< 500KB)
- [ ] Profile React components
- [ ] Analyze database queries
- [ ] Load test with 100+ concurrent users
- [ ] Check memory leaks
- [ ] Test on mobile devices
- [ ] Verify caching works correctly

### After Deployment
- [ ] Monitor real user metrics (RUM)
- [ ] Track Core Web Vitals
- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Monitor database performance
- [ ] Review slow query logs
- [ ] Check CDN hit rates
- [ ] Monitor server resources

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Next Review**: After performance testing
