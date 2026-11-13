# Project rules for AI agents

You are working in a Playwright TypeScript automation project.
Follow these rules for every code change.

## Stack

- Playwright 1.56+, TypeScript, and Cucumber BDD using the Page Object Model (POM) design pattern.
- Node 20+
- Test runner: @cucumber/cucumber (CLI runner via `cucumber-js` with `ts-node/register/transpile-only`)
- Reporter: cucumber-html-reporter + built-in JSON report
- CI: GitHub Actions, sharded

## Project Architecture

The project contains three independent applications:
1. **Teacher Application** (`https://teach-test.geneo.in/`)
2. **Student Application** (`https://learn-test.geneo.in/`)
3. **Admin Application** (`https://admin-test.geneo.in/`)

All automation code must follow the Page Object Model (POM) architecture and maintain clear separation between these applications across page objects, feature files, step definitions, and test plans.

## Folder structure

- `pages/` — Page Object classes, strictly separated by application:
  - `pages/teacher/` — Page Objects for Teacher application
  - `pages/student/` — Page Objects for Student application
  - `pages/admin/` — Page Objects for Admin application
  - `pages/basePage.ts` — Common base page class extended by all page objects
- `fixtures/` — Driver interfaces and Playwright provider (`fixtures.ts`, `playwrightProvider.ts`)
- `utils/` — Pure helpers and framework utilities (`Assertion.ts` for soft assertions, `commonMethod.ts`)
- `tests/web/` — Web BDD test suite:
  - `tests/web/features/` — Gherkin `.feature` files, strictly partitioned by application:
    - `tests/web/features/Teacher/` — Feature files for Teacher application
    - `tests/web/features/Student/` — Feature files for Student application
    - `tests/web/features/Admin/` — Feature files for Admin application
  - `tests/web/step-definitions/` — Step definition files, strictly partitioned by application:
    - `tests/web/step-definitions/Teacher/` — Step definitions for Teacher application
    - `tests/web/step-definitions/Student/` — Step definitions for Student application
    - `tests/web/step-definitions/Admin/` — Step definitions for Admin application
  - `tests/web/config/` — Cucumber World context (`geneoWorld.ts`) and environment config (`test.config.ts`)
  - `tests/web/hooks/` — Cucumber lifecycle hooks (`hooks.ts`) for browser setup, teardown, and screenshots
- `tests/seed.spec.ts` — Reference baseline environment smoke test
- `testdata/` — Static test data (`credentials.json`, `assessmentCreation.json`, etc.) and uploads (`testdata/uploads/`)
- `envs/` — Role-based environment configurations (`teacher.env`, `student.env`, `admin.env`)
- `specs/` — Planner output (Markdown plans), partitioned by application:
  - `specs/teacher/` — Test plans for Teacher application
  - `specs/student/` — Test plans for Student application
  - `specs/admin/` — Test plans for Admin application
- `reports/` — Generated test reports (`cucumber-report.json`, `cucumber-html-report.html`)
- `custom-report/` — Custom HTML report generator script (`generate-report.js`)

## Coding conventions

- Import step functions (`Given`, `When`, `Then`) from `@cucumber/cucumber`
- Use `this: GeneoWorld` in step definitions to access page objects and utilities
- Every new Page Object must be registered in `GeneoWorld` (`tests/web/config/geneoWorld.ts`)
- Feature files use standard Gherkin syntax (`Feature`, `Scenario`, `Given`, `When`, `Then`, `And`)
- One logical feature area per `.feature` file
- Tag every scenario with role and tier (e.g. `@teacher`, `@student`, `@admin`, `@smoke`, `@regression`, `@critical`)
- File names:
  - Page objects: camelCase or PascalCase ending in `Page.ts` (e.g. `loginPage.ts`, `homepage.ts`)
  - Feature files: camelCase or PascalCase ending in `.feature` (e.g. `teacherLogin.feature`)
  - Step definitions: camelCase or kebab-case ending in `.ts` (e.g. `login.ts`, `admin_login.ts`)

## Locator priority (STRICT — do not deviate)

1. `data-id` — attribute name is `data-id` (Priority)
2. `getByTestId` (attribute is `data-test-id`)
3. `getByRole` with accessible name
4. `getByLabel` for form fields
5. `getByPlaceholder` when no label exists
6. `getByText` only for genuinely static UI text
7. CSS / XPath — forbidden unless approved in PR

## Page Object contract

- One class per page, extends `BasePage`
- Located in the corresponding application folder (`pages/teacher/`, `pages/student/`, or `pages/admin/`)
- Constructor takes `page: Page` only and calls `super(page)`
- All locators declared as `private` or `readonly` properties
- Action methods return `Promise<void>` OR the next page object
- No `expect()` or assertions calls inside page objects — assertions belong in step definitions
- No cross-application bleed — never mix or import page objects across teacher, student, and admin
- No raw selectors in step definitions — encapsulate all element interactions in page objects
- No business logic in tests — put it in page objects or helpers
- Register every page object in `GeneoWorld` (`tests/web/config/geneoWorld.ts`)

## Assertion rules

- Web-first assertions only (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`)
- Use `this.softAssert` for non-blocking UI validations with auto-screenshot capture
- No `page.waitForTimeout` — ever
- No `waitForSelector` — use locator auto-waiting or explicit state waits (`locator.waitFor({ state: 'visible' })`)
- Custom timeouts only when justified in a code comment

## When adding a new test

- Save feature file inside the appropriate application directory: `tests/web/features/Teacher/`, `tests/web/features/Student/`, or `tests/web/features/Admin/`
- Save step definitions inside the appropriate directory: `tests/web/step-definitions/Teacher/`, `tests/web/step-definitions/Student/`, or `tests/web/step-definitions/Admin/`
- Save page objects inside `pages/teacher/`, `pages/student/`, or `pages/admin/` and register them in `tests/web/config/geneoWorld.ts`
- Reuse existing page objects from `pages/<app>/` — do not create parallel infra
- Load test credentials and data from `testdata/` (`credentials.json`, etc.) or `envs/`, not inline
- Tag scenarios with `@teacher`, `@student`, or `@admin` along with `@smoke`, `@regression`, or `@critical` as appropriate

## Codex browser workflow (Playwright CLI)

- Use the Playwright CLI through the terminal for browser exploration, planning, locator inspection, and failure diagnosis instead of Playwright MCP tools.
- The CLI is an authoring tool. Keep automated test execution in Cucumber with the existing TypeScript POM, World, fixtures, hooks, and reports. Do not invoke the CLI from page objects, steps, hooks, or CI tests.
- Use the repository's installed Playwright through `npm run browser:cli -- <command>`; no global CLI package is required. Check availability with `npm run browser:cli -- --help`.
- Keep role sessions separate:
  - Teacher: `npm run browser:teacher -- open https://teach-test.geneo.in/ --headed`
  - Student: `npm run browser:student -- open https://learn-test.geneo.in/ --headed`
  - Admin: `npm run browser:admin -- open https://admin-test.geneo.in/ --headed`
- Use the same role script for subsequent commands, e.g. `npm run browser:teacher -- snapshot`, `npm run browser:teacher -- click <ref>`, and `npm run browser:teacher -- close`.
- Obtain element refs from a current snapshot; refresh after navigation or UI changes. Never copy snapshot refs into committed tests. Convert observed elements into stable POM locators using the strict locator priority above.
- For attribute inspection absent from snapshots, use read-only CLI `eval` on a current element ref, e.g. `npm run browser:teacher -- eval "el => el.getAttribute('data-id')" <ref>`. Inspect `data-id` first, then `data-test-id`. Do not alter application state through evaluated JavaScript.
- Read installed command help before using unfamiliar commands. CLI-generated locators and code are suggestions; adapt them to this repository's locator, POM, and Cucumber rules.
- Save plans in `specs/<app>/`; keep transient snapshots and browser artifacts in the ignored `.playwright-cli/` directory. Never save credentials or auth state in tracked files or print them in reports. Avoid literal passwords in terminal commands/history.
- Close only the session used for the task. Do not use `close-all` or `kill-all` on unrelated sessions.
- Validate generated or repaired tests using the existing Cucumber commands below. Browser exploration alone is not a passing automated test.

## Cucumber execution commands

- Run all web tests: `npm run test:web`
- Run Teacher tests: `npm run test:teacher`
- Run Student tests: `npm run test:student`
- Run Admin tests: `npm run test:admin`
- Run a specific feature: `npx cucumber-js tests/web/features/<App>/<feature>.feature`
- Generate HTML report: `npm run report`
- Open HTML report: `npm run open:report`

## Forbidden

- Do not skip or comment out failing tests to make CI green
- Do not use `page.evaluate` in framework code unless no locator-based alternative exists; use CLI snapshots and read-only element attribute inspection for browser exploration.
- Do not commit `.env`, credentials, `storage-state.json`, or auth tokens
- Do not modify `playwright.config.ts` without asking
- Do not add new npm dependencies without asking
- Do not use `page.pause()` in committed code
- Do not use `page.waitForTimeout` or hardcoded sleeps anywhere
- Do not put assertions in page objects or raw selectors in step definitions
- Do not mix page objects, features, or step definitions across different applications

## When you (the agent) are unsure

- Ask a clarifying question before generating code
- Prefer a smaller, focused change over a big refactor
- If a required file does not exist, ask before creating it
