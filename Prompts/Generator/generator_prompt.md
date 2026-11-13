Use scenario 1.1 from specs/teacher/teacher-login.md. Follow AGENTS.md.

App: https://teach-test.geneo.in/
Credentials: load from testdata/credentials.json; never inline or log passwords.

1. Read the plan, existing Teacher page objects, steps, and GeneoWorld.
2. Inspect the current UI through the terminal Playwright CLI, not MCP:
   npm run browser:teacher -- open https://teach-test.geneo.in/ --headed
   npm run browser:teacher -- snapshot
   Use current snapshot refs for exploration only. Inspect data-id first and
   data-test-id second; follow the full locator priority in AGENTS.md.
3. Reuse existing Teacher page objects. Ask before creating missing required files.
   Keep page objects under pages/teacher/, features under tests/web/features/Teacher/,
   and step definitions under tests/web/step-definitions/Teacher/.
4. Import Given, When, Then from @cucumber/cucumber. Gherkin And steps reuse these
   definitions; do not import And. Use this: GeneoWorld. Register new page objects.
5. Extend BasePage, encapsulate locators/actions, and assert only in steps using
   web-first assertions. Tag scenarios @teacher @smoke @critical. No hardcoded sleeps.
6. Run the specific .feature through cucumber-js with the existing configuration.
   Do not run step-definition files as Playwright tests. Do not put CLI calls or
   temporary snapshot refs inside the framework code.
7. Close the task session: npm run browser:teacher -- close
8. Report changed files and actual Cucumber results, including blocked checks.
