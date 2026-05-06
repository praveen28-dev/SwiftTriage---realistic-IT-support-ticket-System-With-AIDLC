# SwiftTriage Error Monitoring Setup Guide

## Overview
This guide provides comprehensive error monitoring and logging setup for SwiftTriage to ensure quick detection and resolution of issues in production.

---

## 1. Error Monitoring with Sentry (Recommended)

### Installation
```bash
npm install @sentry/nextjs
```

### Configuration

#### 1. Initialize Sentry
```bash
npx @sentry/wizard@latest -i nextjs
```

#### 2. Configure sentry.client.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.1, // 10% of transactions
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Before send hook
  beforeSend(event, hint) {
    // Filter out sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

#### 3. Configure sentry.server.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  tracesSampleRate: 0.1,
  
  environment: process.env.NODE_ENV,
  
  // Server-specific options
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],
  
  beforeSend(event) {
    // Remove sensitive server data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});
```

#### 4. Configure sentry.edge.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Environment Variables
```env
# .env.local
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## 2. Custom Error Handling

### Global Error Boundary
```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/app/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          We've been notified and are working on a fix.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### API Error Handler
```typescript
// lib/utils/apiErrorHandler.ts
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Log to Sentry
  Sentry.captureException(error, {
    tags: {
      type: 'api_error',
    },
  });

  // Handle different error types
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message = process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : error.message;

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 }
  );
}

// Usage in API routes
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Client-Side Error Tracking
```typescript
// lib/utils/errorTracking.ts
import * as Sentry from '@sentry/nextjs';

export function trackError(
  error: Error,
  context?: Record<string, any>
) {
  console.error('Error:', error, context);

  Sentry.captureException(error, {
    extra: context,
  });
}

export function trackMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, any>
) {
  console.log(`[${level}]`, message, context);

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

// Usage
try {
  await createWidget(data);
} catch (error) {
  trackError(error as Error, {
    widgetType: data.widgetType,
    userId: session.user.id,
  });
}
```

---

## 3. Logging Strategy

### Structured Logging
```typescript
// lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
}

class Logger {
  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };

    // Console output
    console[level === 'debug' ? 'log' : level](
      JSON.stringify(entry, null, 2)
    );

    // Send to external logging service (optional)
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToLoggingService(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  private sendToLoggingService(entry: LogEntry) {
    // Implement external logging service integration
    // e.g., Datadog, LogRocket, etc.
  }
}

export const logger = new Logger();

// Usage
logger.info('Widget created', { widgetType: 'tickets_by_status' });
logger.error('Failed to fetch tickets', error, { userId: 'user-123' });
```

### API Request Logging
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/utils/logger';

export function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Log request
  logger.info('API Request', {
    requestId,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  });

  // Continue with request
  const response = NextResponse.next();

  // Log response
  const duration = Date.now() - start;
  logger.info('API Response', {
    requestId,
    status: response.status,
    duration: `${duration}ms`,
  });

  // Add request ID to response headers
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Response-Time', `${duration}ms`);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 4. Performance Monitoring

### Custom Performance Tracking
```typescript
// lib/utils/performance.ts
import * as Sentry from '@sentry/nextjs';

export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const transaction = startTransaction(name, 'function');
  
  return fn()
    .then((result) => {
      transaction.setStatus('ok');
      return result;
    })
    .catch((error) => {
      transaction.setStatus('internal_error');
      throw error;
    })
    .finally(() => {
      transaction.finish();
    });
}

// Usage
const tickets = await measureAsync('fetch-tickets', async () => {
  return await db.select().from(tickets);
});
```

### Database Query Monitoring
```typescript
// lib/db/connection.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as Sentry from '@sentry/nextjs';

const sql = neon(process.env.DATABASE_URL!);

// Wrap queries with monitoring
const monitoredSql = new Proxy(sql, {
  apply(target, thisArg, args) {
    const start = Date.now();
    const query = args[0];

    return Reflect.apply(target, thisArg, args)
      .then((result) => {
        const duration = Date.now() - start;
        
        // Log slow queries
        if (duration > 1000) {
          Sentry.captureMessage('Slow database query', {
            level: 'warning',
            extra: {
              query,
              duration: `${duration}ms`,
            },
          });
        }

        return result;
      })
      .catch((error) => {
        Sentry.captureException(error, {
          extra: {
            query,
          },
        });
        throw error;
      });
  },
});

export const db = drizzle(monitoredSql);
```

---

## 5. Alert Configuration

### Sentry Alert Rules

#### 1. High Error Rate
- **Condition**: Error count > 10 in 5 minutes
- **Action**: Email + Slack notification
- **Priority**: High

#### 2. Slow API Response
- **Condition**: API response time > 2s (p95)
- **Action**: Email notification
- **Priority**: Medium

#### 3. Database Connection Errors
- **Condition**: Database error count > 5 in 1 minute
- **Action**: Email + SMS notification
- **Priority**: Critical

#### 4. Authentication Failures
- **Condition**: Auth error count > 20 in 5 minutes
- **Action**: Email notification
- **Priority**: High

### Custom Alerts
```typescript
// lib/utils/alerts.ts
import * as Sentry from '@sentry/nextjs';

export function sendAlert(
  title: string,
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  // Log to Sentry
  Sentry.captureMessage(title, {
    level: severity === 'critical' ? 'fatal' : 'error',
    extra: {
      message,
      severity,
    },
  });

  // Send to external alerting service
  if (severity === 'critical') {
    // Implement PagerDuty, OpsGenie, etc.
  }
}

// Usage
if (errorRate > threshold) {
  sendAlert(
    'High Error Rate Detected',
    `Error rate: ${errorRate}/min`,
    'high'
  );
}
```

---

## 6. Health Checks

### API Health Endpoint
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/connection';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      api: 'healthy',
    },
  };

  try {
    // Check database connection
    await db.execute(sql`SELECT 1`);
    checks.checks.database = 'healthy';
  } catch (error) {
    checks.checks.database = 'unhealthy';
    checks.status = 'unhealthy';
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}
```

### Uptime Monitoring
- **UptimeRobot**: Free tier available
- **Pingdom**: Comprehensive monitoring
- **StatusCake**: Multiple check locations

---

## 7. Error Dashboard

### Key Metrics to Track
1. **Error Rate**: Errors per minute
2. **Error Types**: Categorized by type
3. **Affected Users**: Number of users impacted
4. **Response Time**: API response times
5. **Database Performance**: Query times
6. **Uptime**: System availability
7. **User Sessions**: Active sessions
8. **Failed Requests**: HTTP error codes

### Sentry Dashboard Widgets
- Error frequency over time
- Top errors by count
- Errors by release
- Errors by browser
- Errors by user
- Performance metrics
- Release health

---

## 8. Incident Response

### Incident Severity Levels

#### P0 - Critical
- System completely down
- Data loss occurring
- Security breach
- **Response Time**: Immediate
- **Notification**: SMS + Email + Slack

#### P1 - High
- Major feature broken
- Significant performance degradation
- High error rate
- **Response Time**: < 15 minutes
- **Notification**: Email + Slack

#### P2 - Medium
- Minor feature broken
- Moderate performance issues
- **Response Time**: < 1 hour
- **Notification**: Email

#### P3 - Low
- Cosmetic issues
- Minor bugs
- **Response Time**: < 24 hours
- **Notification**: Ticket system

### Incident Response Checklist
1. [ ] Acknowledge incident
2. [ ] Assess severity
3. [ ] Notify stakeholders
4. [ ] Investigate root cause
5. [ ] Implement fix or workaround
6. [ ] Verify resolution
7. [ ] Document incident
8. [ ] Post-mortem review
9. [ ] Implement preventive measures

---

## 9. Testing Error Handling

### Manual Error Testing
```typescript
// Test error boundary
throw new Error('Test error boundary');

// Test API error handling
fetch('/api/test-error');

// Test Sentry integration
Sentry.captureException(new Error('Test Sentry'));
```

### Automated Error Testing
```typescript
// __tests__/error-handling.test.ts
describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('should log errors to Sentry', () => {
    const spy = jest.spyOn(Sentry, 'captureException');
    
    try {
      throw new Error('Test error');
    } catch (error) {
      trackError(error as Error);
    }

    expect(spy).toHaveBeenCalled();
  });
});
```

---

## 10. Checklist

### Setup
- [ ] Sentry account created
- [ ] Sentry SDK installed
- [ ] Configuration files created
- [ ] Environment variables set
- [ ] Source maps uploaded
- [ ] Release tracking configured

### Error Handling
- [ ] Global error boundary implemented
- [ ] API error handler created
- [ ] Client-side error tracking added
- [ ] Structured logging implemented
- [ ] Performance monitoring enabled

### Monitoring
- [ ] Alert rules configured
- [ ] Health check endpoint created
- [ ] Uptime monitoring setup
- [ ] Dashboard configured
- [ ] Incident response plan documented

### Testing
- [ ] Error boundary tested
- [ ] API error handling tested
- [ ] Sentry integration tested
- [ ] Alert notifications tested
- [ ] Health checks tested

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Next Review**: After production deployment
