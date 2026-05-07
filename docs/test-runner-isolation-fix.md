# Test Runner Collision Fix

## Problem
Vitest was attempting to run Playwright e2e tests, causing the error:
```
test.describe() is only available in the test file
```

This happened because both test runners scan for `.spec.ts` files by default, and Vitest was finding and trying to execute Playwright tests in the `e2e/` directory.

## Root Cause
The `vitest.config.ts` file did not have an `exclude` array to prevent Vitest from scanning the `e2e/` directory where Playwright tests are located.

## Solution Applied

### 1. Updated `vitest.config.ts`
Added an `exclude` array to the test configuration:

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Exclude Playwright e2e tests from Vitest runner
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // 👈 Critical: Prevents Vitest from running Playwright tests
      '**/playwright-report/**',
      '**/.next/**',
    ],
  },
  // ... rest of config
});
```

### 2. Verified Playwright Configuration
Confirmed `playwright.config.ts` already has proper isolation:
```typescript
export default defineConfig({
  testDir: './e2e', // ✅ Ensures Playwright only looks here
  // ... rest of config
});
```

### 3. Verified Package.json Scripts
Confirmed test scripts are properly separated:
```json
{
  "scripts": {
    "test:run": "vitest run",      // ✅ Runs unit tests only
    "test:e2e": "playwright test"   // ✅ Runs e2e tests only
  }
}
```

## Test Runner Boundaries

### Vitest (Unit Tests)
- **Runs**: All `.test.ts` and `.spec.ts` files EXCEPT those in `e2e/`
- **Location**: Throughout the codebase (lib/, app/, components/, etc.)
- **Command**: `npm run test:run`

### Playwright (E2E Tests)
- **Runs**: Only `.spec.ts` files in `e2e/` directory
- **Location**: `e2e/` directory only
- **Command**: `npm run test:e2e`

## Verification
After applying this fix:
1. ✅ Vitest will ignore the `e2e/` directory completely
2. ✅ Playwright will only run tests in the `e2e/` directory
3. ✅ No more "test.describe() is only available in the test file" errors
4. ✅ CI/CD pipeline will run cleanly with separated test stages

## CI/CD Impact
This fix ensures your GitHub Actions workflow runs correctly:
```yaml
- name: Run Unit Tests
  run: npm run test:run  # ✅ Now excludes e2e tests

- name: Run E2E Tests
  run: npm run test:e2e  # ✅ Only runs Playwright tests
```

## Additional Notes
- The `exclude` patterns use glob syntax (`**/` matches any nested directory)
- The `.next/` directory is also excluded to prevent scanning build artifacts
- This is a standard pattern for projects using both Vitest and Playwright
