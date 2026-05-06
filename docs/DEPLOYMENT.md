# SwiftTriage Deployment Guide

Complete guide for deploying SwiftTriage to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Alternative Platforms](#alternative-platforms)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Domain Configuration](#domain-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Post-Deployment](#post-deployment)
9. [Monitoring Setup](#monitoring-setup)
10. [Rollback Procedures](#rollback-procedures)

---

## Pre-Deployment Checklist

### Code Readiness

- [ ] All tests passing
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Git repository clean (no uncommitted changes)

### Environment Setup

- [ ] Production environment variables prepared
- [ ] Database connection string ready (Neon)
- [ ] Groq API key obtained and tested
- [ ] NextAuth secret generated (32+ characters)
- [ ] Production domain name registered

### Database

- [ ] Database migrations generated (`npm run db:generate`)
- [ ] Database schema reviewed
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Security

- [ ] Secrets not committed to repository
- [ ] Environment variables secured
- [ ] Authentication tested
- [ ] Authorization rules verified
- [ ] CORS configured appropriately

### Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] User guide available
- [ ] Admin guide available
- [ ] Deployment notes documented

---

## Vercel Deployment

Vercel is the recommended platform for deploying SwiftTriage (built with Next.js).

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git status

# Commit any pending changes
git add .
git commit -m "Prepare for production deployment"

# Push to GitHub
git push origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click "Add New Project"
2. Select "Import Git Repository"
3. Choose your SwiftTriage repository
4. Click "Import"

### Step 4: Configure Project

**Framework Preset:**
- Vercel auto-detects Next.js
- No changes needed

**Root Directory:**
- Leave as default (root)

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Environment Variables:**

Click "Environment Variables" and add:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/swifttriage?sslmode=require
NEXTAUTH_SECRET=your-production-secret-32-chars-minimum
NEXTAUTH_URL=https://your-domain.com
GROQ_API_KEY=gsk_your_groq_api_key
```

**Important:**
- Use production values (not development)
- Generate new NEXTAUTH_SECRET for production
- Set NEXTAUTH_URL to your production domain

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel provides a preview URL: `https://swifttriage-xxx.vercel.app`

### Step 6: Verify Deployment

1. Visit the preview URL
2. Test login functionality
3. Submit a test ticket
4. Verify dashboard loads
5. Check all widgets display correctly

### Step 7: Configure Custom Domain

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain: `swifttriage.yourdomain.com`
4. Follow DNS configuration instructions:

**For Subdomain (Recommended):**
```
Type: CNAME
Name: swifttriage
Value: cname.vercel-dns.com
```

**For Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

5. Wait for DNS propagation (5-60 minutes)
6. Vercel automatically provisions SSL certificate

### Step 8: Update Environment Variables

After domain is configured:

1. Go to Project Settings → Environment Variables
2. Update `NEXTAUTH_URL`:
   ```
   NEXTAUTH_URL=https://swifttriage.yourdomain.com
   ```
3. Redeploy to apply changes

### Step 9: Run Database Migrations

```bash
# Set production DATABASE_URL locally (temporarily)
export DATABASE_URL="your-production-database-url"

# Generate and push migrations
npm run db:generate
npm run db:push

# Unset the variable
unset DATABASE_URL
```

**Alternative: Use Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
vercel link

# Run migrations using production env
vercel env pull .env.production
npm run db:push
```

---

## Alternative Platforms

### Netlify

**Prerequisites:**
- Netlify account
- Next.js plugin installed

**Deployment Steps:**

1. **Install Next.js Plugin**
   ```bash
   npm install -D @netlify/plugin-nextjs
   ```

2. **Create netlify.toml**
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Deploy**
   - Push to GitHub
   - Import repository in Netlify
   - Configure environment variables
   - Deploy

### Railway

**Deployment Steps:**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose SwiftTriage repository
5. Railway auto-detects Next.js
6. Add environment variables
7. Deploy

**Railway Configuration:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### DigitalOcean App Platform

**Deployment Steps:**

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click "Create" → "Apps"
3. Connect GitHub repository
4. Configure app:
   - **Type**: Web Service
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
5. Add environment variables
6. Deploy

### AWS Amplify

**Deployment Steps:**

1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```
5. Add environment variables
6. Deploy

---

## Environment Configuration

### Production Environment Variables

**Required:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/swifttriage?sslmode=require

# Authentication
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://swifttriage.yourdomain.com

# AI Service (Groq)
GROQ_API_KEY=gsk_your_production_groq_api_key
```

**Optional (Recommended):**

```env
# Error Monitoring (Sentry)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Analytics (Vercel)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Performance Monitoring
NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID=your_speed_insights_id

# Node Environment
NODE_ENV=production
```

### Generating Secrets

**NEXTAUTH_SECRET:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Online
# https://generate-secret.vercel.app/32
```

### Environment Variable Security

**Best Practices:**
- ✅ Use different secrets for dev/staging/production
- ✅ Rotate secrets regularly (every 90 days)
- ✅ Never commit secrets to Git
- ✅ Use platform secret management (Vercel, AWS Secrets Manager)
- ✅ Limit access to production secrets
- ❌ Don't share secrets via email or chat
- ❌ Don't log secrets in application code
- ❌ Don't expose secrets in client-side code

---

## Database Setup

### Neon Database Configuration

**Production Database:**

1. **Create Production Database**
   - Go to [neon.tech](https://neon.tech)
   - Create new project: "SwiftTriage Production"
   - Select region closest to your users
   - Copy connection string

2. **Configure Connection Pooling**
   - Enable connection pooling in Neon dashboard
   - Use pooled connection string for production
   - Format: `postgresql://user:password@host.neon.tech/swifttriage?sslmode=require&pgbouncer=true`

3. **Set Connection Limits**
   - Min connections: 2
   - Max connections: 10
   - Idle timeout: 30 seconds

4. **Enable SSL**
   - SSL is required for production
   - Ensure connection string includes `?sslmode=require`

### Running Migrations

**Option 1: Local Machine**
```bash
# Set production DATABASE_URL
export DATABASE_URL="your-production-url"

# Generate migrations
npm run db:generate

# Review generated SQL files in drizzle/
ls -la drizzle/

# Apply migrations
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

**Option 2: CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: |
    npm run db:generate
    npm run db:push
```

### Database Backup

**Neon Automatic Backups:**
- Neon provides automatic backups
- Point-in-time recovery available
- Retention: 7 days (free tier), 30 days (paid)

**Manual Backup:**
```bash
# Backup database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore database
psql $DATABASE_URL < backup-20260505.sql
```

---

## Domain Configuration

### DNS Setup

**Subdomain (Recommended):**
```
Type: CNAME
Name: swifttriage
Value: cname.vercel-dns.com
TTL: 3600
```

**Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**Verification:**
```bash
# Check DNS propagation
dig swifttriage.yourdomain.com

# Or use online tool
# https://dnschecker.org
```

### Domain Providers

**Common Providers:**
- **Namecheap**: Advanced DNS → Add CNAME record
- **GoDaddy**: DNS Management → Add CNAME record
- **Cloudflare**: DNS → Add CNAME record
- **Google Domains**: DNS → Custom records → Add CNAME

---

## SSL/HTTPS Setup

### Vercel (Automatic)

Vercel automatically provisions SSL certificates:
- Uses Let's Encrypt
- Auto-renewal every 90 days
- No configuration needed
- HTTPS enforced by default

### Custom SSL Certificate

If using custom certificate:

1. Go to Project Settings → Domains
2. Click domain → Configure
3. Upload certificate files:
   - Certificate (`.crt`)
   - Private key (`.key`)
   - Certificate chain (`.ca-bundle`)

### Force HTTPS

**Next.js Configuration:**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  }
};
```

---

## Post-Deployment

### Verification Checklist

- [ ] Application loads at production URL
- [ ] SSL certificate valid (green padlock)
- [ ] Login functionality works
- [ ] Ticket submission works
- [ ] AI triage processes correctly
- [ ] Dashboard displays all widgets
- [ ] Drag-and-drop works
- [ ] Customer management accessible
- [ ] API endpoints respond correctly
- [ ] Database queries execute successfully

### Smoke Tests

**1. Health Check**
```bash
curl https://swifttriage.yourdomain.com/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "api": "healthy"
  }
}
```

**2. Authentication Test**
```bash
# Login
curl -X POST https://swifttriage.yourdomain.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"it_admin","password":"password"}'
```

**3. Ticket Creation Test**
```bash
# Create ticket
curl -X POST https://swifttriage.yourdomain.com/api/tickets \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"userInput":"Test ticket","contactEmail":"test@example.com"}'
```

### Performance Baseline

**Run Lighthouse Audit:**
```bash
npx lighthouse https://swifttriage.yourdomain.com --view
```

**Target Metrics:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## Monitoring Setup

### Error Monitoring (Sentry)

**1. Install Sentry**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**2. Configure Environment Variables**
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=your_auth_token
```

**3. Verify Integration**
- Trigger test error
- Check Sentry dashboard
- Configure alerts

### Performance Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Add to layout.tsx:**
```typescript
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

### Uptime Monitoring

**UptimeRobot (Free):**
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor
3. Type: HTTPS
4. URL: `https://swifttriage.yourdomain.com`
5. Interval: 5 minutes
6. Configure alerts (email, SMS, Slack)

---

## Rollback Procedures

### Vercel Rollback

**Via Dashboard:**
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

**Via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### Database Rollback

**Restore from Backup:**
```bash
# Restore Neon backup
# Via Neon dashboard: Backups → Select backup → Restore

# Or restore from manual backup
psql $DATABASE_URL < backup-20260505.sql
```

### Emergency Procedures

**If Application is Down:**

1. **Check Vercel Status**
   - Visit [vercel-status.com](https://www.vercel-status.com)

2. **Check Database**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Check Logs**
   - Vercel Dashboard → Logs
   - Filter by errors

4. **Rollback if Needed**
   - Promote previous deployment
   - Restore database backup

5. **Notify Users**
   - Status page update
   - Email notification
   - Social media post

---

## CI/CD Pipeline (Optional)

### GitHub Actions

**Create `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          npm run db:generate
          npm run db:push
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Support

- **Deployment Issues**: deployment@swifttriage.com
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Support**: [neon.tech/docs](https://neon.tech/docs)
- **Documentation**: [docs/](.)

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026  
**Platform**: Vercel (Recommended)
