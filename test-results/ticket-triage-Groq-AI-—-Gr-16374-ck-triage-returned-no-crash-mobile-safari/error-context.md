# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ticket-triage.spec.ts >> Groq AI — Graceful Failure States >> Groq timeout → fallback triage returned, no crash
- Location: e2e\ticket-triage.spec.ts:177:7

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\Praveen\AppData\Local\ms-playwright\webkit-2272\Playwright.exe
╔════════════════════════════════════════════════════════════╗
║ Looks like Playwright was just installed or updated.       ║
║ Please run the following command to download new browsers: ║
║                                                            ║
║     npx playwright install                                 ║
║                                                            ║
║ <3 Playwright Team                                         ║
╚════════════════════════════════════════════════════════════╝
```