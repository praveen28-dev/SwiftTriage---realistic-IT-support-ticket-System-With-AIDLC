# Build Instructions - SwiftTriage

## Prerequisites

### Required Software
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (comes with Node.js)
- **Git**: For version control

### Required Accounts
- **Neon Account**: For PostgreSQL database ([neon.tech](https://neon.tech))
- **Groq Account**: For AI API access ([console.groq.com](https://console.groq.com))

### System Requirements
- **OS**: Windows, macOS, or Linux
- **Memory**: 4GB RAM minimum
- **Disk Space**: 500MB for dependencies and build artifacts

---

## Build Steps

### Step 1: Install Dependencies

Navigate to the project root and install all required npm packages:

\`\`\`bash
npm install
\`\`\`

**Expected Output**:
\`\`\`
added 300+ packages in 30s
\`\`\`

**Dependencies Installed**:
- Next.js 14.2.0
- React 18.3.0
- TypeScript 5.4.0
- Tailwind CSS 3.4.0
- Drizzle ORM 0.30.0
- NextAuth.js 4.24.0
- Groq SDK 0.3.0
- SWR 2.2.0
- Zod 3.23.0

---

### Step 2: Configure Environment Variables

#### 2.1 Create Environment File

Copy the example environment file:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

#### 2.2 Obtain Required Credentials

**Neon Database URL**:
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

**Groq API Key**:
1. Sign up at [console.groq.com](https://console.groq.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `gsk_`)

**NextAuth Secret**:
Generate a secure random string:
\`\`\`bash
openssl rand -base64 32
\`\`\`

#### 2.3 Edit .env.local

Open `.env.local` and add your credentials:

\`\`\`env
DATABASE_URL=postgresql://your_user:your_password@your_host/your_database?sslmode=require
GROQ_API_KEY=gsk_your_groq_api_key_here
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
POLLING_INTERVAL=5000
\`\`\`

**⚠️ Important**: Never commit `.env.local` to version control!

---

### Step 3: Set Up Database

#### 3.1 Generate Drizzle Migrations

Generate migration files from the schema:

\`\`\`bash
npm run db:generate
\`\`\`

**Expected Output**:
\`\`\`
✓ Generating migrations...
✓ Migrations generated in ./drizzle
\`\`\`

#### 3.2 Push Schema to Database

Apply the schema to your Neon database:

\`\`\`bash
npm run db:push
\`\`\`

**Expected Output**:
\`\`\`
✓ Pushing schema to database...
✓ Schema pushed successfully
✓ Table 'tickets' created
\`\`\`

**Verify Database**:
- Log into Neon dashboard
- Navigate to your database
- Confirm `tickets` table exists with 7 columns

---

### Step 4: Type Check

Verify TypeScript compilation without errors:

\`\`\`bash
npm run type-check
\`\`\`

**Expected Output**:
\`\`\`
✓ No TypeScript errors found
\`\`\`

**If Errors Occur**:
- Review error messages
- Check for missing type definitions
- Ensure all imports are correct
- Fix errors and rerun type-check

---

### Step 5: Build for Production

Build the Next.js application for production:

\`\`\`bash
npm run build
\`\`\`

**Expected Output**:
\`\`\`
✓ Creating an optimized production build...
✓ Compiled successfully
✓ Collecting page data...
✓ Generating static pages (6/6)
✓ Finalizing page optimization...

Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB         85.3 kB
├ ○ /dashboard                           2.5 kB         95.8 kB
├ ○ /login                               1.8 kB         87.1 kB
└ ○ /submit                              2.1 kB         89.4 kB

○  (Static)  automatically rendered as static HTML
\`\`\`

**Build Artifacts**:
- `.next/` directory contains compiled application
- Static pages generated for optimal performance
- Serverless functions bundled for API routes

---

### Step 6: Verify Build Success

#### 6.1 Check Build Directory

Verify `.next/` directory was created:

\`\`\`bash
ls -la .next/
\`\`\`

**Expected Contents**:
- `server/` - Server-side code
- `static/` - Static assets
- `cache/` - Build cache
- `BUILD_ID` - Build identifier

#### 6.2 Check for Warnings

Review build output for warnings:
- **Acceptable**: Unused dependencies, optimization hints
- **Action Required**: Missing environment variables, compilation errors

---

## Troubleshooting

### Issue: npm install fails with dependency errors

**Cause**: Network issues, npm registry problems, or incompatible Node.js version

**Solution**:
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
\`\`\`

---

### Issue: Database connection fails

**Cause**: Invalid DATABASE_URL or network connectivity

**Solution**:
1. Verify DATABASE_URL format is correct
2. Test connection from Neon dashboard
3. Check firewall/network settings
4. Ensure `?sslmode=require` is appended to URL

---

### Issue: TypeScript compilation errors

**Cause**: Type mismatches or missing type definitions

**Solution**:
1. Review error messages carefully
2. Check for missing imports
3. Verify all dependencies are installed
4. Run `npm install` again if types are missing

---

### Issue: Build fails with "Module not found"

**Cause**: Missing dependencies or incorrect import paths

**Solution**:
1. Verify all dependencies in package.json
2. Check import paths use `@/` alias correctly
3. Ensure files exist at specified paths
4. Run `npm install` to install missing packages

---

### Issue: Environment variables not loaded

**Cause**: `.env.local` not in correct location or syntax errors

**Solution**:
1. Ensure `.env.local` is in project root
2. Check for syntax errors (no spaces around `=`)
3. Restart development server after changes
4. Verify variable names match exactly

---

## Build Verification Checklist

- [ ] Dependencies installed successfully
- [ ] `.env.local` configured with all required variables
- [ ] Database schema pushed to Neon
- [ ] TypeScript type-check passes
- [ ] Production build completes without errors
- [ ] `.next/` directory created with build artifacts
- [ ] No critical warnings in build output

---

## Next Steps

After successful build:
1. Proceed to **Unit Test Execution** (unit-test-instructions.md)
2. Run development server for manual testing
3. Deploy to Vercel for production

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-05  
**Status**: Ready for execution
