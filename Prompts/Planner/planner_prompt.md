Follow AGENTS.md. Explore https://teach-test.geneo.in/ using the terminal
Playwright CLI instead of Playwright MCP tools.

1. Open: npm run browser:teacher -- open https://teach-test.geneo.in/ --headed
2. Inspect: npm run browser:teacher -- snapshot
3. Interact using current snapshot refs; refresh after navigation or UI changes.
   Inspect data-id and data-test-id attributes with read-only CLI eval as needed.
   Follow the locator priority in AGENTS.md.
4. Save observed behavior, expected outcomes, and stable locator candidates in
   specs/teacher/teacher-login.md. Explicitly identify unverified cases.
5. Close: npm run browser:teacher -- close

Load credentials from testdata/credentials.json when needed. Do not include passwords
or auth state in plans or terminal history. Ask before creating missing required files.

Cover the login flow with these scenarios:

- Optional analytics cookies (Reject analytics/Accept analytics)
- Pass the test with Accept analytics
- Valid credentials (successful login)
- Invalid credentials (shows error message)
- Empty username submission
- Empty password submission
- Edit username 
- Eye button mask password
- Help & Support
- Mobile browser check

