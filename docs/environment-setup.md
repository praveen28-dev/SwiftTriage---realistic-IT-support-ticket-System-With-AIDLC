# Environment Configuration Guide

This guide explains how to configure environment variables for the secure authentication system.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure required variables** (see below)

3. **Validate your configuration:**
   ```bash
   npm run validate-env
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### NEXTAUTH_SECRET (Required)

**Purpose:** Secret key for signing JWT tokens used in authentication sessions.

**Security Requirements:**
- Minimum 32 characters (256 bits)
- Cryptographically secure random value
- Never commit to version control
- Different value for each environment (dev, staging, production)

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Example:**
```env
NEXTAUTH_SECRET=Xk7mP9qR2sT5vW8yZ1aB4cD6eF9gH2jK5lM8nP1qR4sT7vW0yZ3aB6cD9eF2gH5j
```

### NEXTAUTH_URL (Required)

**Purpose:** Base URL of your application for NextAuth.js callbacks and redirects.

**Format:**
- Development: `http://localhost:3000`
- Production: `https://yourdomain.com`

**Example:**
```env
# Development
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://swifttriage.example.com
```

### DATABASE_URL (Required)

**Purpose:** PostgreSQL connection string for storing user credentials and sessions.

**Format:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Get your connection string:**
1. Sign up at [Neon](https://console.neon.tech) (or your PostgreSQL provider)
2. Create a new project
3. Copy the connection string from the dashboard

**Example:**
```env
DATABASE_URL=postgresql://user:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/swifttriage?sslmode=require
```

### BCRYPT_SALT_ROUNDS (Optional)

**Purpose:** Controls the computational cost of password hashing.

**Default:** 12 (if not specified)

**Valid Range:** 12-15

**Recommendations:**
- **12** (default): Good balance of security and performance for most applications
- **13**: Higher security, ~2x slower than 12
- **14**: Very high security, ~4x slower than 12
- **15**: Maximum security, ~8x slower than 12 (use only for high-security requirements)

**Performance Impact:**
Each increment doubles the computation time. Higher values provide better protection against brute force attacks but increase authentication latency.

**Example:**
```env
# Default (recommended for most applications)
BCRYPT_SALT_ROUNDS=12

# High security applications
BCRYPT_SALT_ROUNDS=13
```

## Environment Validation

The `validate-env` script checks that all required environment variables are properly configured before starting the application.

### Run Validation

```bash
npm run validate-env
```

### Validation Checks

The script validates:

1. **NEXTAUTH_SECRET**
   - ✓ Present and not empty
   - ✓ Minimum 32 characters
   - ✓ Not a placeholder value

2. **NEXTAUTH_URL**
   - ✓ Valid URL format
   - ✓ Uses http:// or https:// protocol
   - ⚠️ Warns if using http:// for non-localhost

3. **DATABASE_URL**
   - ✓ Valid PostgreSQL connection string format
   - ✓ Contains hostname and database name
   - ✓ Not a placeholder value

4. **BCRYPT_SALT_ROUNDS** (optional)
   - ✓ Valid number between 12 and 15
   - ✓ Falls back to default (12) if not set

### Example Output

**Success:**
```
🔒 Environment Variable Validation

✓ NEXTAUTH_SECRET (REQUIRED)
  Valid (44 characters)

✓ NEXTAUTH_URL (REQUIRED)
  Valid (http://localhost:3000)

✓ DATABASE_URL (REQUIRED)
  Valid (ep-cool-darkness-123456.us-east-2.aws.neon.tech/swifttriage)

✓ BCRYPT_SALT_ROUNDS (OPTIONAL)
  Valid (12 rounds)

Summary:
✅ All environment variables are valid.
```

**Failure:**
```
🔒 Environment Variable Validation

✗ NEXTAUTH_SECRET (REQUIRED)
  NEXTAUTH_SECRET too short (16 chars). Minimum 32 characters required for security.

✓ NEXTAUTH_URL (REQUIRED)
  Valid (http://localhost:3000)

✗ DATABASE_URL (REQUIRED)
  Missing DATABASE_URL. Required for user authentication and session storage.

✓ BCRYPT_SALT_ROUNDS (OPTIONAL)
  Not set (will use default: 12)

Summary:
❌ Validation failed. Fix the errors above before starting the application.
```

## Security Best Practices

### Development Environment

1. **Use strong secrets even in development**
   - Generate proper random values
   - Don't use simple strings like "secret" or "test"

2. **Never commit .env.local**
   - Already in .gitignore
   - Contains sensitive credentials

3. **Use localhost for NEXTAUTH_URL**
   ```env
   NEXTAUTH_URL=http://localhost:3000
   ```

### Production Environment

1. **Use environment-specific secrets**
   - Different NEXTAUTH_SECRET for each environment
   - Never reuse development secrets in production

2. **Always use HTTPS**
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Secure your DATABASE_URL**
   - Use strong database passwords
   - Enable SSL/TLS (sslmode=require)
   - Restrict database access by IP if possible

4. **Consider higher salt rounds**
   ```env
   BCRYPT_SALT_ROUNDS=13
   ```

5. **Use environment variable management**
   - Use your hosting provider's environment variable UI
   - Consider secrets management services (AWS Secrets Manager, HashiCorp Vault)
   - Never store secrets in code or version control

## Troubleshooting

### "Missing NEXTAUTH_SECRET" Error

**Problem:** NEXTAUTH_SECRET is not set or is empty.

**Solution:**
```bash
# Generate a new secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add to .env.local
echo "NEXTAUTH_SECRET=<generated-secret>" >> .env.local
```

### "NEXTAUTH_SECRET too short" Error

**Problem:** Your secret is less than 32 characters.

**Solution:** Generate a new secret using the command above. Don't try to manually create a secret.

### "Invalid DATABASE_URL format" Error

**Problem:** DATABASE_URL is not a valid PostgreSQL connection string.

**Solution:** Check that your connection string:
- Starts with `postgresql://` or `postgres://`
- Contains username and password
- Contains hostname
- Contains database name

Example format:
```
postgresql://user:password@host/database
```

### "BCRYPT_SALT_ROUNDS too low/high" Error

**Problem:** Salt rounds value is outside the valid range (12-15).

**Solution:** Set a value between 12 and 15, or remove the variable to use the default (12).

### Validation Passes But Application Fails

**Problem:** Environment variables are valid but the application still fails to start.

**Possible Causes:**
1. **Database connection issues**
   - Check that your database is running
   - Verify network connectivity
   - Check database credentials

2. **Port conflicts**
   - Ensure port 3000 is available
   - Or change NEXTAUTH_URL to match your port

3. **Missing dependencies**
   ```bash
   npm install
   ```

## Related Documentation

- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Neon PostgreSQL Setup](https://neon.tech/docs/get-started-with-neon/signing-up)
- [bcrypt Salt Rounds Explanation](https://github.com/kelektiv/node.bcrypt.js#a-note-on-rounds)

## Requirements Coverage

This environment configuration supports:
- **Requirement 4.2:** Secure token generation with cryptographically secure secret
- **Requirement 11.1:** Session management configuration
- **Security NFR 2:** Password hashing with configurable salt rounds (12-15)
