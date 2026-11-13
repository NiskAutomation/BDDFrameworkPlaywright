The test at #tests/web/step-definitions/Teacher/teacher-login.spec.ts is failing.

Diagnose and fix following your rules:

1. Run the test to reproduce the failure
2. Read the error output carefully
3. Follow AGENTS.md and inspect through the terminal Playwright CLI, not MCP:
   npm run browser:teacher -- open https://teach-test.geneo.in/ --headed
   npm run browser:teacher -- snapshot
   Use current snapshot refs and read-only attribute inspection to identify stable
   locators in the priority required by AGENTS.md.
4. Determine root cause
5. Apply the minimum-viable fix
6. Preserve assertion intent — do NOT weaken any assertion
7. Do NOT add waitForTimeout
8. Do NOT skip the test
9. Re-run twice to confirm stability
10. Produce a final report explaining what you did and why
11. Close only the task session: npm run browser:teacher -- close

Execute the corresponding .feature with cucumber-js, not the step-definition file
with the Playwright runner. Ask before creating missing required files. Keep CLI
calls out of framework code and never expose credentials in logs.
