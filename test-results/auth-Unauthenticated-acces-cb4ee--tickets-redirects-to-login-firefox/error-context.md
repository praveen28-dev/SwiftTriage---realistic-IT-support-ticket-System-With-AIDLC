# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Unauthenticated access — redirects to /login >> GET /dashboard/my-tickets redirects to /login
- Location: e2e\auth.spec.ts:66:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\Praveen\AppData\Local\ms-playwright\firefox-1511\firefox\firefox.exe
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```