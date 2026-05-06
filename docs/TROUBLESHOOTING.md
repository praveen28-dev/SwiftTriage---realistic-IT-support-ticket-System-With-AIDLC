# SwiftTriage Troubleshooting Guide

Common issues and solutions for SwiftTriage installation, configuration, and operation.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Build Errors](#build-errors)
3. [Database Issues](#database-issues)
4. [Authentication Problems](#authentication-problems)
5. [API Errors](#api-errors)
6. [Widget Issues](#widget-issues)
7. [Performance Problems](#performance-problems)
8. [Deployment Issues](#deployment-issues)
9. [Browser Compatibility](#browser-compatibility)
10. [Getting Help](#getting-help)

---

## Installation Issues

### Issue: `npm install` fails with dependency conflicts

**Symptoms:**
```
npm ERR! ERESOLVE could not resolve
npm ERR! While resolving: drizzle-orm@0.30.0
```

**Solutions:**

**Option 1: Use legacy peer deps**
```bash
npm install --legacy-peer-deps
```

**Option 2: Clear cache and reinstall**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Option 3: Use specific Node version**
```bash
nvm use 18
npm install
```

---

### Issue: Node.js version too old

**Symptoms:**
```
error: The engine "node" is incompatible with this module
```

**Solution:**
```bash
# Check current version
node --version

# Install Node 18 or higher
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from nodejs.org
```

---

### Issue: Permission denied errors (macOS/Linux)

**Symptoms:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Don't use sudo! Fix npm permissions instead
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall
npm install
```

---

## Build Errors

### Issue: TypeScript compilation errors

**Symptoms:**
```
Type error: Property 'role' does not exist on type 'User'
```

**Solutions:**

**Option 1: Check TypeScript version**
```bash
npm list typescript
# Should be 5.4.0 or higher
```

**Option 2: Clear Next.js cache**
```bash
rm -rf .next
npm run build
```

**Option 3: Restart TypeScript server (VS Code)**
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows)
- Type "TypeScript: Restart TS Server"
- Press Enter

---

### Issue: ESLint errors

**Symptoms:**
```
Error: Failed to load config "next" to extend from
```

**Solution:**
```bash
# Reinstall ESLint dependencies
npm install -D eslint eslint-config-next@14.2.35

# Or disable ESLint during build (not recommended)
# In next.config.js:
module.exports = {
  eslint: {
    ignoreDuringBuilds: true
  }
}
```

---

### Issue: Out of memory during build

**Symptoms:**
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solution:**

Already configured in `package.json`:
```json
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

If still failing:
```bash
# Increase memory further
NODE_OPTIONS='--max-old-space-size=8192' npm run build
```

---

### Issue: Module not found errors

**Symptoms:**
```
Module not found: Can't resolve '@/lib/config'
```

**Solutions:**

**Option 1: Check tsconfig.json paths**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Option 2: Reinstall dependencies**
```bash
rm -rf node_modules .next
npm install
npm run build
```

---

## Database Issues

### Issue: Database connection fails

**Symptoms:**
```
Error: Database connection string format invalid
Error: Connection refused
```

**Solutions:**

**Check 1: Verify connection string format**
```env
# Correct format
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Common mistakes:
# ❌ Missing ?sslmode=require
# ❌ Wrong protocol (postgres:// instead of postgresql://)
# ❌ Spaces in connection string
```

**Check 2: Test connection**
```bash
# Using psql
psql $DATABASE_URL -c "SELECT 1"

# Using Node.js
node -e "const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT 1\`.then(console.log)"
```

**Check 3: Verify Neon database is active**
- Go to [neon.tech](https://neon.tech)
- Check database status
- Ensure it's not paused (free tier auto-pauses after inactivity)

---

### Issue: Migration fails

**Symptoms:**
```
Error: relation "tickets" already exists
Error: Invalid input Either connectionString or host, database are required
```

**Solutions:**

**Option 1: Fix drizzle.config.ts**
```typescript
// Ensure using 'connectionString' not 'url'
import { config } from 'dotenv';
config({ path: '.env.local' });

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
};
```

**Option 2: Drop and recreate tables**
```bash
# ⚠️ WARNING: This deletes all data!
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Then run migrations
npm run db:generate
npm run db:push
```

**Option 3: Manual migration**
```bash
# Apply SQL files manually
psql $DATABASE_URL -f drizzle/0000_curved_chronomancer.sql
psql $DATABASE_URL -f drizzle/0001_useful_miracleman.sql
psql $DATABASE_URL -f drizzle/0002_little_valeria_richards.sql
```

---

### Issue: Slow database queries

**Symptoms:**
- Dashboard takes > 5 seconds to load
- API requests timeout
- High database CPU usage

**Solutions:**

**Add indexes:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

**Enable connection pooling:**
```env
# Use pooled connection string
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require&pgbouncer=true
```

**Optimize queries:**
```typescript
// Bad: N+1 query
const tickets = await db.select().from(tickets);
for (const ticket of tickets) {
  const customer = await db.select().from(customers).where(eq(customers.id, ticket.customerId));
}

// Good: Join query
const tickets = await db
  .select()
  .from(tickets)
  .leftJoin(customers, eq(tickets.customerId, customers.id));
```

---

## Authentication Problems

### Issue: Can't log in

**Symptoms:**
- Login button does nothing
- Redirects to login page after successful login
- "Invalid credentials" error

**Solutions:**

**Check 1: Verify NEXTAUTH_SECRET**
```bash
# Generate new secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=your-new-secret-here

# Restart dev server
npm run dev
```

**Check 2: Verify NEXTAUTH_URL**
```env
# Development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://your-domain.com
```

**Check 3: Clear browser cookies**
```
Chrome: Settings → Privacy → Clear browsing data → Cookies
Firefox: Settings → Privacy → Clear Data → Cookies
Safari: Preferences → Privacy → Manage Website Data → Remove All
```

**Check 4: Check browser console**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed requests

---

### Issue: Session expires immediately

**Symptoms:**
- Logged out after page refresh
- Session cookie not persisting

**Solution:**

**Check session configuration:**
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // ...
};
```

**Check cookie settings:**
```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  }
}
```

---

### Issue: "CSRF token mismatch" error

**Symptoms:**
```
Error: CSRF token mismatch
```

**Solution:**

**Check 1: Verify NEXTAUTH_URL matches current URL**
```env
# If accessing via localhost:3000
NEXTAUTH_URL=http://localhost:3000

# If accessing via 127.0.0.1:3000
NEXTAUTH_URL=http://127.0.0.1:3000
```

**Check 2: Clear cookies and try again**

**Check 3: Disable browser extensions**
- Ad blockers can interfere with authentication
- Try in incognito/private mode

---

## API Errors

### Issue: API returns 401 Unauthorized

**Symptoms:**
```json
{
  "error": "Unauthorized",
  "code": "AUTHENTICATION_REQUIRED"
}
```

**Solutions:**

**Check 1: Verify logged in**
```bash
# Check session
curl http://localhost:3000/api/auth/session
```

**Check 2: Include credentials in fetch**
```typescript
// Client-side fetch
fetch('/api/tickets', {
  credentials: 'include', // Important!
  headers: {
    'Content-Type': 'application/json'
  }
})
```

**Check 3: Check API route authentication**
```typescript
// app/api/tickets/route.ts
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

### Issue: API returns 500 Internal Server Error

**Symptoms:**
```json
{
  "error": "Internal server error"
}
```

**Solutions:**

**Check 1: View server logs**
```bash
# Development
# Check terminal where npm run dev is running

# Production (Vercel)
# Go to Vercel Dashboard → Logs
```

**Check 2: Check database connection**
```typescript
// Test database connection
try {
  await db.execute(sql`SELECT 1`);
  console.log('Database connected');
} catch (error) {
  console.error('Database error:', error);
}
```

**Check 3: Add error logging**
```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error); // Add this
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### Issue: Groq API errors

**Symptoms:**
```
Error: Invalid API key
Error: Model not found
Error: Rate limit exceeded
```

**Solutions:**

**Check 1: Verify API key**
```bash
# Test Groq API key
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer $GROQ_API_KEY"
```

**Check 2: Verify model name**
```typescript
// lib/config.ts
groq: {
  model: 'llama-3.3-70b-versatile', // Correct model name
}
```

**Check 3: Handle rate limits**
```typescript
// Add retry logic
async function callGroqWithRetry(prompt: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await groq.chat.completions.create({...});
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}
```

---

## Widget Issues

### Issue: Widgets not loading

**Symptoms:**
- Dashboard shows loading spinner indefinitely
- Widgets display "Error loading data"
- Empty dashboard

**Solutions:**

**Check 1: Check browser console**
```
F12 → Console tab
Look for errors like:
- Failed to fetch
- Network error
- CORS error
```

**Check 2: Verify API endpoints**
```bash
# Test statistics API
curl http://localhost:3000/api/v1/tickets/stats?group_by=status

# Test activity feed API
curl http://localhost:3000/api/v1/activity-feed?limit=5
```

**Check 3: Check SWR configuration**
```typescript
// Verify polling is working
const { data, error } = useSWR(
  '/api/v1/tickets/stats?group_by=status',
  fetcher,
  {
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    onError: (err) => console.error('SWR Error:', err) // Add this
  }
);
```

---

### Issue: Drag-and-drop not working

**Symptoms:**
- Can't drag widgets
- Widgets snap back to original position
- No drag handle visible

**Solutions:**

**Check 1: Verify @dnd-kit installed**
```bash
npm list @dnd-kit/core @dnd-kit/sortable
```

**Check 2: Check browser compatibility**
- @dnd-kit requires modern browser
- Test in Chrome/Firefox/Safari latest
- Disable browser extensions

**Check 3: Check console for errors**
```
F12 → Console
Look for @dnd-kit errors
```

---

### Issue: Widget positions not persisting

**Symptoms:**
- Widgets reorder correctly
- After page refresh, widgets return to original positions

**Solutions:**

**Check 1: Verify API call succeeds**
```typescript
// Check network tab
// PUT /api/v1/dashboard/widgets/reorder
// Should return 200 OK
```

**Check 2: Check database**
```sql
-- Verify widget_configs table exists
SELECT * FROM widget_configs;

-- Check grid_position values
SELECT id, widget_type, grid_position FROM widget_configs ORDER BY grid_position;
```

**Check 3: Clear browser cache**
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## Performance Problems

### Issue: Slow page load

**Symptoms:**
- Pages take > 5 seconds to load
- Dashboard feels sluggish
- High CPU usage in browser

**Solutions:**

**Check 1: Run Lighthouse audit**
```bash
npx lighthouse http://localhost:3000 --view
```

**Check 2: Check bundle size**
```bash
npm run build
# Check output for large bundles
```

**Check 3: Optimize images**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
/>
```

**Check 4: Reduce polling frequency**
```typescript
// Increase refresh interval
const { data } = useSWR('/api/tickets', fetcher, {
  refreshInterval: 60000, // 60 seconds instead of 30
});
```

---

### Issue: High memory usage

**Symptoms:**
- Browser tab uses > 500MB RAM
- Browser becomes unresponsive
- "Page unresponsive" warnings

**Solutions:**

**Check 1: Check for memory leaks**
```typescript
// Use React DevTools Profiler
// Look for components that re-render frequently
```

**Check 2: Memoize expensive components**
```typescript
import { memo } from 'react';

export const TicketsByStatusWidget = memo(({ data }) => {
  // Component code
});
```

**Check 3: Limit data fetching**
```typescript
// Add pagination
const { data } = useSWR(
  `/api/tickets?limit=20&offset=${page * 20}`,
  fetcher
);
```

---

## Deployment Issues

### Issue: Vercel build fails

**Symptoms:**
```
Error: Build failed
Error: Command "npm run build" exited with 1
```

**Solutions:**

**Check 1: Verify environment variables**
- Go to Vercel Dashboard → Settings → Environment Variables
- Ensure all required variables are set
- Check for typos

**Check 2: Check build logs**
- Vercel Dashboard → Deployments → Click deployment → View logs
- Look for specific error messages

**Check 3: Test build locally**
```bash
# Simulate production build
NODE_ENV=production npm run build
npm start
```

---

### Issue: Database migrations fail in production

**Symptoms:**
```
Error: relation "tickets" does not exist
```

**Solutions:**

**Option 1: Run migrations manually**
```bash
# Using Vercel CLI
vercel env pull .env.production
npm run db:push
```

**Option 2: Add to build script**
```json
{
  "scripts": {
    "build": "npm run db:push && next build"
  }
}
```

**Option 3: Use Vercel build hook**
```yaml
# vercel.json
{
  "buildCommand": "npm run db:push && npm run build"
}
```

---

### Issue: Environment variables not working in production

**Symptoms:**
- Features work locally but not in production
- "undefined" errors in production

**Solutions:**

**Check 1: Verify variables are set**
- Vercel Dashboard → Settings → Environment Variables
- Check "Production" environment is selected

**Check 2: Redeploy after adding variables**
- Environment variable changes require redeployment
- Vercel Dashboard → Deployments → Redeploy

**Check 3: Check variable names**
```env
# Client-side variables must start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=https://api.example.com

# Server-side variables don't need prefix
DATABASE_URL=postgresql://...
```

---

## Browser Compatibility

### Issue: Application doesn't work in Internet Explorer

**Solution:**
SwiftTriage does not support Internet Explorer. Supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### Issue: Features not working in Safari

**Symptoms:**
- Drag-and-drop doesn't work
- Widgets don't display correctly

**Solutions:**

**Check 1: Update Safari**
- Requires Safari 14 or higher
- Update macOS/iOS to latest version

**Check 2: Enable JavaScript**
- Safari → Preferences → Security → Enable JavaScript

**Check 3: Clear Safari cache**
- Safari → Preferences → Privacy → Manage Website Data → Remove All

---

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Search existing GitHub issues**
3. **Check browser console for errors**
4. **Try in incognito/private mode**
5. **Test with different browser**

### Gathering Information

When reporting an issue, include:

1. **Environment:**
   - OS (Windows/macOS/Linux)
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Browser and version

2. **Error Messages:**
   - Full error message
   - Stack trace
   - Browser console errors

3. **Steps to Reproduce:**
   - What you did
   - What you expected
   - What actually happened

4. **Configuration:**
   - Relevant environment variables (redact secrets!)
   - package.json dependencies
   - next.config.js settings

### Support Channels

- **Documentation**: [docs/](.)
- **GitHub Issues**: [github.com/yourusername/swifttriage/issues](https://github.com/yourusername/swifttriage/issues)
- **GitHub Discussions**: [github.com/yourusername/swifttriage/discussions](https://github.com/yourusername/swifttriage/discussions)
- **Email**: support@swifttriage.com

### Emergency Support

For production emergencies:
- **Email**: emergency@swifttriage.com
- **Response Time**: < 1 hour (business hours)

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| `AUTHENTICATION_REQUIRED` | Not logged in | Log in first |
| `INSUFFICIENT_PERMISSIONS` | Wrong role | Need IT staff role |
| `VALIDATION_ERROR` | Invalid input | Check request format |
| `RESOURCE_NOT_FOUND` | Item doesn't exist | Verify ID is correct |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry |
| `DATABASE_ERROR` | Database issue | Check connection |
| `GROQ_API_ERROR` | AI service issue | Check API key |

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Need More Help?** Contact support@swifttriage.com
