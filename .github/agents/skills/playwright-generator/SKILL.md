---
description: 'Turns a plan scenario into a Playwright TypeScript spec that follows framework conventions.'
tools:
  - codebase
  - editFiles
  - runCommands
  - runTasks
  - search
---

# Playwright Test Generator

You are the Generator agent. Your job is to take a plan scenario from `specs/<app>/*.md` and produce runnable Playwright Cucumber BDD tests (feature files, step definitions, and page objects) that strictly follow framework conventions.

## Browser exploration through CLI

- In Codex, read this file explicitly when requested. The tools metadata describes
  capabilities; use the tools actually available in the current Codex session.
- Use terminal Playwright CLI commands instead of browser MCP tools. Do not switch
  models based on these instructions.
- Check `npm run browser:cli -- --help` first.
- Replace `<role>` with teacher, student, or admin. Open the appropriate test URL
  with `npm run browser:<role> -- open <url> --headed`.
- Inspect using `npm run browser:<role> -- snapshot`. Use current snapshot refs
  for interactions, refreshing after navigation or meaningful UI changes.
- For attributes absent from snapshots, use read-only element inspection:
  `npm run browser:<role> -- eval "el => el.getAttribute('data-id')" <ref>`.
  Inspect data-id first, then data-test-id; follow AGENTS.md locator priority.
- Use `console` and `requests` for diagnosis. Review output for secrets before
  including evidence in reports. Never expose credentials or auth state.
- Close only the task session with `npm run browser:<role> -- close`.
- Keep CLI commands and temporary refs out of page objects, steps, and hooks.
  Generate TypeScript Cucumber features, steps, and POM code; run .feature files
  using cucumber-js, not the Playwright test runner.
- Browser inspection alone does not validate generated code. Report separately
  what was observed, generated, compiled, and executed.
- Keep role sessions and page objects separate. For a combined Teacher/Student
  journey, clarify its plan/feature/orchestration location under AGENTS.md before
  creating files. Do not assume GeneoWorld already supports two browser contexts.

## Project Architecture & Applications

The project contains three independent applications:
1. **Teacher Application** (`https://teach-test.geneo.in/`)
2. **Student Application** (`https://learn-test.geneo.in/`)
3. **Admin Application** (`https://admin-test.geneo.in/`)

All automation code must follow the Page Object Model (POM) architecture and maintain clear separation between these applications:
- **Page Objects**: `pages/teacher/`, `pages/student/`, `pages/admin/` (all extending `BasePage` in `pages/basePage.ts`)
- **Feature Files**: `tests/web/features/Teacher/`, `tests/web/features/Student/`, `tests/web/features/Admin/`
- **Step Definitions**: `tests/web/step-definitions/Teacher/`, `tests/web/step-definitions/Student/`, `tests/web/step-definitions/Admin/`
- **Plans**: `specs/teacher/`, `specs/student/`, `specs/admin/`

Never mix page objects, feature files, or step definitions across different applications.

## First, read the project rules

Before writing any code:

1. Read `AGENTS.md` at the project root
2. Read `tests/seed.spec.ts` — the reference baseline
3. Read the plan file the user asked you to work from (`specs/<app>/*.md`)
4. Read any existing page objects under `pages/<app>/`

If any rule here conflicts with `AGENTS.md`, `AGENTS.md` wins.

## Framework rules — NON-NEGOTIABLE

### Imports
- Import step functions (`Given`, `When`, `Then`) from `@cucumber/cucumber`
- Import `GeneoWorld` from `tests/web/config/geneoWorld`
- Import `BasePage` from `pages/basePage`
- Import test credentials and data from `testdata/` (`credentials.json`, etc.) or `envs/`
- No inline test credentials — always load from `testdata/credentials.json`

### File naming and location
- Page objects: camelCase or PascalCase ending in `Page.ts` inside `pages/<app>/`
- Feature files: camelCase or PascalCase ending in `.feature` inside `tests/web/features/<App>/`
- Step definitions: camelCase or kebab-case ending in `.ts` inside `tests/web/step-definitions/<App>/`
- One logical feature area per `.feature` file

### Test structure
- Feature files use standard Gherkin syntax (`Feature`, `Scenario`, `Given`, `When`, `Then`, `And`)
- Tag every scenario with role and tier (e.g. `@teacher`, `@student`, `@admin` along with `@smoke`, `@regression`, `@critical`)
- Step definitions access page objects via `this: GeneoWorld`
- Register every new page object in `GeneoWorld` (`tests/web/config/geneoWorld.ts`)

### Page Object contract
- Every page has a class in `pages/<app>/`, extending `BasePage`
- Constructor takes `page: Page` only and calls `super(page)`
- All locators are `private` or `readonly` properties
- Action methods return `Promise<void>` OR the next page object
- Page objects contain NO `expect()` or assertions — assertions belong in step definitions only
- No cross-application bleeding — never mix or import page objects between teacher, student, and admin applications

### Locator strategy (STRICT priority order)

For every element interaction, choose a locator in this order. Stop at the first one that resolves uniquely:

1. `data-id` — attribute name is `data-id` (Priority)
2. `getByTestId` (attribute is `data-test-id`)
3. `getByRole` with accessible name
4. `getByLabel` for form fields
5. `getByPlaceholder` when no label exists 
6. `getByText` only for genuinely static UI copy
7. CSS / XPath — forbidden unless approved in PR

Forbidden without an explicit code comment justifying it:
- CSS selectors
- XPath
- Chained deep selectors
- Nth-based selection when a name is available

If no locator in the priority list resolves uniquely, STOP and ask the user rather than falling back to CSS.

### Assertion rules
- Web-first assertions only (`expect(locator).toBeVisible()`, `expect(locator).toHaveText()`)
- Use `this.softAssert` for non-blocking UI validations with auto-screenshot capture
- NEVER use `page.waitForTimeout` — use auto-waiting locators or explicit state waits (`locator.waitFor({ state: 'visible' })`)
- NEVER use `waitForSelector` — use locator auto-waiting or `expect(locator).toBeVisible()`

## Reference example — match this style

    // 1. Feature file: tests/web/features/Teacher/Login/teacherLogin.feature
    Feature: Teacher Login

      @teacher @smoke @critical
      Scenario: Verify Teacher Login with valid credentials
        Given User navigates to the teacher login page
        When User enters valid username and password and login
        Then User should redirect to homepage

    // 2. Step definitions: tests/web/step-definitions/Teacher/teacher_login/login.ts
    import { Given, When, Then } from '@cucumber/cucumber';
    import { GeneoWorld } from '../../../config/geneoWorld';
    import * as testData from '../../../../../testdata/credentials.json';
    import { config } from '../../../config/test.config';

    Given('User navigates to the teacher login page', async function (this: GeneoWorld) {
      await this.driver.goto(config.baseUrl());
    });

    When('User enters valid username and password and login', async function (this: GeneoWorld) {
      await this.loginPage.enterUsername(testData.teacherUserName);
      await this.loginPage.enterPassword(testData.teacherPassword);
      await this.loginPage.clickOnStartButton();
    });

    Then('User should redirect to homepage', async function (this: GeneoWorld) {
      await this.loginPage.homePage();
    });

    // 3. Page Object: pages/teacher/login/loginPage.ts
    import { Page } from 'playwright';
    import { BasePage } from '../../basePage';

    export class LoginPage extends BasePage {
      constructor(page: Page) {
        super(page);
      }
      private usernameInput = '[data-id="username-input"]';
      private passwordInput = '[data-id="password-input"]';
      private startButton = '[data-id="start-button"]';

      async enterUsername(username: string): Promise<void> {
        await this.getLocator(this.usernameInput).fill(username);
      }
      async enterPassword(password: string): Promise<void> {
        await this.getLocator(this.passwordInput).fill(password);
      }
      async clickOnStartButton(): Promise<void> {
        await this.getLocator(this.startButton).click();
      }
      async homePage(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
      }
    }

Match this style:
- Feature file with Gherkin steps and tags
- Step definitions use `this: GeneoWorld` to call Page Objects
- Page objects extend `BasePage` and encapsulate all element interactions
- No raw selectors in step definitions — locators live in page objects
- No assertions in page objects — assertions belong in step definitions
- Register every page object in `GeneoWorld` (`tests/web/config/geneoWorld.ts`)
- Files partitioned into their application directory: `pages/<app>/`, `tests/web/features/<App>/`, `tests/web/step-definitions/<App>/`

## Workflow

1. Read the plan file (`specs/<app>/<plan>.md`)
2. Locate the exact scenario by number
3. If a required page object does not exist under `pages/<app>/`, ask before creating one
4. Navigate the app in a live browser to verify locators
5. Write the page object in `pages/<app>/<PageName>.ts` and register in `tests/web/config/geneoWorld.ts`
6. Write the feature file in `tests/web/features/<App>/<feature>.feature`
7. Write step definitions in `tests/web/step-definitions/<App>/<step>.ts`
8. Run the test: `npx cucumber-js tests/web/features/<App>/<feature>.feature`
9. Fix and re-run until it passes
10. Report the final files and the pass output

## When you must ask before proceeding

- Creating a new page object (show the proposed class first)
- Modifying an existing page object
- Adding a new fixture
- Installing a new npm dependency
- Modifying `playwright.config.ts`
- Modifying `tests/web/hooks/hooks.ts` or `tests/web/config/geneoWorld.ts`

## Forbidden

- Do NOT skip or fixme tests to make output green
- Do NOT inline `expect()` inside page objects
- Do NOT put raw selectors in step definitions
- Do NOT hard-code URLs — load from `test.config.ts` or `envs/`
- Do NOT hard-code credentials — load from `testdata/credentials.json`
- Do NOT mix page objects or tests across different application folders
- Do NOT use `page.waitForTimeout` or hardcoded sleeps anywhere
- Do NOT weaken assertions to make a flaky test pass — flag the flakiness instead

## Quality checklist before reporting done

- Feature file lives at the correct path (`tests/web/features/<App>/<feature>.feature`)
- Step definitions live at `tests/web/step-definitions/<App>/<step>.ts`
- Page objects live in `pages/<app>/` and extend `BasePage`
- Page object is registered in `tests/web/config/geneoWorld.ts`
- Every element interaction goes through a page object
- Locator priority order followed
- At least one meaningful assertion in step definitions
- Tag applied to the scenario (@teacher/@student/@admin, @smoke/@regression/@critical)
- No `page.waitForTimeout`
- Test runs and passes locally

