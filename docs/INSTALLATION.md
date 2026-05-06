# SwiftTriage Installation Guide

This guide provides detailed instructions for installing and configuring SwiftTriage on your local machine or server.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 1 GB free space
- **OS**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 5+ GB free space
- **Network**: Stable internet connection

---

## Prerequisites

### 1. Node.js and npm

**Required Version**: Node.js 18.0.0 or higher

#### Check Current Version
```bash
node --version
npm --version
```

#### Install Node.js

**Windows:**
- Download from [nodejs.org](https://nodejs.org/)
- Run the installer
- Verify installation: `node --version`

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

**Linux (Ubuntu/Debian):**
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Git

**Check if installed:**
```bash
git --version
```

**Install Git:**
- **Windows**: Download from [git-scm.com](https://git-scm.com/)
- **macOS**: `brew install git`
- **Linux**: `sudo apt-get install git`

### 3. Neon Database Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (format: `postgresql://user:password@host.neon.tech/dbname`)

### 4. Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

---

## Installation Steps

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/swifttriage.git

# Or clone via SSH
git clone git@github.com:yourusername/swifttriage.git

# Navigate to project directory
cd swifttriage
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 250 packages, and audited 251 packages in 30s
```

**If you encounter errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Step 3: Configure Environment Variables

```bash
# Copy example file
cp .env.local.example .env.local
```

**Edit `.env.local` with your credentials:**

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/swifttriage?sslmode=require

# Authentication Configuration
NEXTAUTH_SECRET=your-generated-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# AI Service Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here

# Optional: Polling Interval (milliseconds)
POLLING_INTERVAL=5000
```

**Generate NEXTAUTH_SECRET:**

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use online generator
# https://generate-secret.vercel.app/32
```

### Step 4: Set Up Database

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:push
```

**Expected Output:**
```
✓ Pulling schema from database...
✓ Generating migrations...
✓ Applying migrations...
✓ Done!
```

**Verify Tables Created:**
- customers
- tickets
- products
- customer_products
- activities
- sla_policies
- widget_configs

### Step 5: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

✓ Ready in 2.5s
```

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

---

## Database Setup

### Understanding the Schema

SwiftTriage uses 7 main tables:

#### 1. **tickets**
- Stores support tickets with AI triage data
- Fields: id, user_input, category, urgency_score, ai_summary, status, customer_id, assigned_to, priority, tags, created_at, resolved_at, updated_at

#### 2. **customers**
- Customer profiles and CDI ratings
- Fields: id, name, email, company, tier, annual_revenue, territory, cdi_rating, logo_url, primary_contact, created_at, updated_at

#### 3. **products**
- Product catalog
- Fields: id, name, description, sku, category, price, created_at, updated_at

#### 4. **customer_products**
- Many-to-many relationship between customers and products
- Fields: id, customer_id, product_id, quantity, purchase_date

#### 5. **activities**
- Activity tracking (calls, emails, meetings, notes)
- Fields: id, type, description, customer_id, ticket_id, user_id, created_at

#### 6. **sla_policies**
- SLA definitions and policies
- Fields: id, name, priority, response_time_hours, resolution_time_hours, created_at

#### 7. **widget_configs**
- User dashboard configurations
- Fields: id, user_id, widget_type, title, grid_position, grid_column, grid_row, query_config, is_visible, created_at, updated_at

### Manual Database Setup (Alternative)

If `npm run db:push` fails, you can manually create tables:

1. **Connect to your Neon database** using psql or a GUI tool
2. **Run the SQL files** in `drizzle/` directory in order:
   ```bash
   psql $DATABASE_URL -f drizzle/0000_curved_chronomancer.sql
   psql $DATABASE_URL -f drizzle/0001_useful_miracleman.sql
   psql $DATABASE_URL -f drizzle/0002_little_valeria_richards.sql
   ```

### Seed Data (Optional)

To populate the database with sample data for testing:

```bash
# Create seed script (not included by default)
npm run seed
```

Or manually insert test data via SQL:

```sql
-- Insert test customer
INSERT INTO customers (name, email, company, tier, cdi_rating)
VALUES ('Acme Corp', 'contact@acme.com', 'Acme Corporation', 'Enterprise', 4.5);

-- Insert test ticket
INSERT INTO tickets (user_input, category, urgency_score, ai_summary, status)
VALUES (
  'My laptop won''t turn on after the latest update',
  'Hardware',
  4,
  'Laptop power issue following system update',
  'Open'
);
```

---

## Configuration

### Application Configuration

Edit `lib/config.ts` to customize application behavior:

```typescript
export const config = {
  database: {
    url: process.env.DATABASE_URL,
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile', // Change AI model here
  },
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  },
  app: {
    pollingInterval: 5000, // Change polling interval (ms)
  },
};
```

### Authentication Configuration

Edit `lib/auth.ts` to customize authentication:

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Customize authentication logic
      async authorize(credentials) {
        // Add your authentication logic here
        // Example: Check against database, LDAP, etc.
      },
    }),
  ],
  callbacks: {
    // Customize JWT and session callbacks
  },
  pages: {
    signIn: '/login', // Custom login page
  },
};
```

### Widget Configuration

Default widgets are created automatically for new users. To customize:

1. **Edit default widgets** in `app/dashboard/page.tsx`
2. **Modify widget types** in `app/components/widgets/`
3. **Adjust polling intervals** in widget hooks

---

## Verification

### 1. Check Application Health

```bash
# Test API health endpoint
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-05T14:00:00Z",
  "checks": {
    "database": "healthy",
    "api": "healthy"
  }
}
```

### 2. Test Authentication

1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - **End User**: username: `user`, password: `password`
   - **IT Staff**: username: `it_admin`, password: `password`
3. Verify successful login and redirect to dashboard

### 3. Test Ticket Submission

1. Navigate to `http://localhost:3000/submit`
2. Fill out the form:
   - **Description**: "My computer won't start"
   - **Contact**: "john@example.com"
3. Submit the form
4. Verify AI triage results appear
5. Check ticket appears in dashboard

### 4. Test Widget System

1. Navigate to `http://localhost:3000/dashboard`
2. Verify 6 default widgets appear
3. Test drag-and-drop reordering
4. Test widget menu (Edit, Remove, Refresh, Export)
5. Verify data displays correctly

### 5. Run Build Test

```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (9/9)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         87.3 kB
├ ○ /api/auth/[...nextauth]             0 B                0 B
├ ○ /dashboard                           8.1 kB         95.2 kB
├ ○ /login                               3.4 kB         85.5 kB
└ ○ /submit                              6.7 kB         93.8 kB

○  (Static)  automatically rendered as static HTML
```

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Use legacy peer deps
npm install --legacy-peer-deps

# Or use specific Node version
nvm use 18
npm install
```

### Issue: Database connection fails

**Symptoms:**
- Error: "Database connection string format invalid"
- Error: "Connection refused"

**Solution:**
1. Verify `DATABASE_URL` in `.env.local`
2. Ensure connection string includes `?sslmode=require`
3. Check Neon database is active (not paused)
4. Test connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

### Issue: Groq API errors

**Symptoms:**
- Error: "Invalid API key"
- Error: "Model not found"

**Solution:**
1. Verify `GROQ_API_KEY` in `.env.local`
2. Check API key is valid at [console.groq.com](https://console.groq.com)
3. Ensure model name is correct: `llama-3.3-70b-versatile`
4. Check API rate limits

### Issue: NextAuth errors

**Symptoms:**
- Error: "NEXTAUTH_SECRET is not set"
- Error: "Invalid session"

**Solution:**
1. Generate new secret: `openssl rand -base64 32`
2. Add to `.env.local`: `NEXTAUTH_SECRET=your-secret`
3. Restart dev server: `npm run dev`
4. Clear browser cookies

### Issue: Build fails with memory error

**Symptoms:**
- Error: "JavaScript heap out of memory"

**Solution:**
```bash
# Increase Node memory (already configured in package.json)
npm run build

# Or manually:
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000

# Kill the process or use different port
PORT=3001 npm run dev
```

### Issue: TypeScript errors

**Solution:**
```bash
# Run type check
npm run type-check

# Fix common issues
# 1. Delete .next directory
rm -rf .next

# 2. Reinstall dependencies
npm install

# 3. Restart TypeScript server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

---

## Next Steps

After successful installation:

1. **Read the [User Guide](USER_GUIDE.md)** to learn how to use SwiftTriage
2. **Read the [Admin Guide](ADMIN_GUIDE.md)** for IT staff features
3. **Review [API Documentation](API.md)** for integration
4. **Check [Deployment Guide](DEPLOYMENT.md)** for production setup

---

## Getting Help

- **Documentation**: [docs/](.)
- **Issues**: [GitHub Issues](https://github.com/yourusername/swifttriage/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/swifttriage/discussions)
- **Email**: support@swifttriage.com

---

**Document Version**: 1.0  
**Last Updated**: May 5, 2026
