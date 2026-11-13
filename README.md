# Playwright TypeScript + Cucumber BDD Automation Starter Template

A production-ready test automation framework skeleton built with **Playwright (v1.56+)**, **TypeScript**, and **Cucumber BDD** using the **Page Object Model (POM)** design pattern.

This template contains all configurations, utilities, reporting hooks, and directory structures without any pre-existing business test scripts, allowing you to build clean, maintainable test suites immediately.

---

## Architecture Overview

- **Stack**: Playwright + TypeScript + Cucumber BDD + ts-node
- **Design Pattern**: Page Object Model (POM) extending `BasePage`
- **Context Injection**: Cucumber World (`GeneoWorld`) for cross-step state, Playwright driver, and page objects
- **Reporting**: JSON report + `cucumber-html-reporter` (with automatic failure & soft-assertion screenshot capture)
- **Multi-Application Support**: Clean physical separation between apps:
  - Teacher (`tests/web/features/Teacher/`, `pages/teacher/`, `step-definitions/Teacher/`)
  - Student (`tests/web/features/Student/`, `pages/student/`, `step-definitions/Student/`)
  - Admin (`tests/web/features/Admin/`, `pages/admin/`, `step-definitions/Admin/`)

---

## Folder Structure

```
├── .github/                  # CI workflows and agent skills
├── .vscode/                  # Debugging configuration (launch.json, mcp.json)
├── api/                      # API automation clients and schemas
│   ├── endpoints/            # API endpoints wrapper
│   └── schemas/              # API validation schemas
├── custom-report/            # HTML report generation script
├── envs/                     # Environment configuration by role
│   ├── admin.env             # Admin app environment
│   ├── student.env           # Student app environment
│   └── teacher.env           # Teacher app environment
├── fixtures/                 # Playwright provider and driver interface
│   ├── fixtures.ts           # Driver interface
│   └── playwrightProvider.ts # Implementation of Driver with Playwright
├── pages/                    # Page Objects (extend BasePage)
│   ├── admin/                # Admin page objects
│   ├── student/              # Student page objects
│   ├── teacher/              # Teacher page objects
│   └── basePage.ts           # BasePage class extended by all pages
├── reports/                  # Generated JSON and HTML test reports
├── screenshots/              # Failure and assertion screenshots
├── specs/                    # Markdown test plans and specifications
├── testdata/                 # Test data JSON files and test attachments
│   ├── uploads/              # Sample files for file upload testing
│   └── credentials.json      # Test credentials
├── tests/                    # Test suites
│   ├── api/                  # API test files
│   ├── db/                   # Database test utilities
│   ├── seed.spec.ts          # Baseline Playwright smoke spec
│   └── web/                  # BDD Web Tests
│       ├── config/           # World context (geneoWorld.ts) & config (test.config.ts)
│       ├── features/         # Gherkin .feature files (Admin, Student, Teacher)
│       ├── hooks/            # Cucumber lifecycle hooks (browser launch, screenshot, teardown)
│       └── step-definitions/ # Cucumber step definition files (Admin, Student, Teacher)
├── utils/                    # Framework helpers
│   ├── Assertion.ts          # Soft assertions with automatic screenshot capture
│   └── commonMethod.ts       # Shared helper functions
├── .env                      # Default root environment variables
├── .gitignore                # Git ignore rules for node_modules, reports, screenshots
├── AGENTS.md                 # Framework architecture rules & locator priorities
├── cucumber.js               # Cucumber configuration profiles
├── package.json              # Project scripts and dependencies
├── playwright.config.ts      # Playwright core configuration
└── tsconfig.json             # TypeScript compiler configuration
```

---

## Prerequisites

1. **Node.js**: v20 or higher installed ([nodejs.org](https://nodejs.org/))
2. **npm**: v10 or higher (comes with Node.js)
3. **VS Code** (recommended) with Cucumber (Gherkin) and Playwright extensions

---

## Setup Steps

### 1. Extract the Archive
Unzip the downloaded template into your desired project directory:
```bash
unzip playwright-bdd-framework-template.zip -d my-automation-project
cd my-automation-project
```

### 2. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

### 3. Install Playwright Browsers
Install the required browser binaries (Chromium, Firefox, WebKit):
```bash
npx playwright install
```
*(On Linux/CI systems, also run: `npx playwright install-deps`)*

### 4. Configure Environment
Review and adjust `.env` or `envs/*.env` files to set your target environment, browser, and headless mode:
- `RUN_ENVIRONMENT`: `test`, `stage`, `prod`, `dev`
- `RUN_BROWSER`: `chromium`, `firefox`, `webkit`
- `RUN_HEADLESS`: `true` or `false`
- `USER_TYPE`: `teacher`, `student`, or `admin`

---

## Adding Your First Test

### Codex browser workflow with Playwright CLI

Use the CLI for browser inspection and test authoring in Codex. Automated tests
still use Cucumber, TypeScript page objects, GeneoWorld, hooks, and existing reports.
The installed Playwright package supplies the CLI; no additional dependency or
global installation is required for this checkout.

```powershell
npm run browser:cli -- --help
npm run browser:teacher -- open https://teach-test.geneo.in/ --headed
npm run browser:teacher -- snapshot
# Replace <ref> with a ref from the current snapshot before running:
npm run browser:teacher -- click <ref>
npm run browser:teacher -- snapshot
npm run browser:teacher -- close
```

For other roles, use separate sessions:

```powershell
npm run browser:student -- open https://learn-test.geneo.in/ --headed
npm run browser:admin -- open https://admin-test.geneo.in/ --headed
```

Continue and close each session using its corresponding role script. Snapshot refs
are temporary; convert observed elements into stable POM locators per AGENTS.md.
Save plans under specs/<app>/ and keep features, steps, and page objects in their
existing role folders. CLI artifacts under .playwright-cli/ are ignored. Never save
credentials or auth state in tracked files or literal passwords in terminal history.

The existing prompts under Prompts/Planner/, Prompts/Generator/, and Prompts/Healer/
now use this workflow. Example request to Codex:

> Use Prompts/Planner/planner_prompt.md to inspect Teacher login with the Playwright
> CLI. Follow AGENTS.md and save the plan under specs/teacher/.

Validate generated tests with `npm run test:teacher` (or the corresponding role)
and generate reports with `npm run report`. CLI exploration is not a Cucumber pass.
Browser MCP is not required for this workflow. Existing editor MCP settings remain
available for other workflows.

### Step 1: Create a Page Object
Create a new file in `pages/<role>/<pageName>Page.ts` extending `BasePage`:

```typescript
// pages/teacher/loginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';

export class LoginPage extends BasePage {
  // Define locators as readonly or private properties
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    // Locator Priority: data-id > getByTestId > getByRole > getByLabel > getByPlaceholder
    this.usernameInput = page.getByPlaceholder('Enter Username');
    this.passwordInput = page.getByPlaceholder('Enter Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }
}
```

### Step 2: Register the Page Object in World Context
Open `tests/web/config/geneoWorld.ts`:

```typescript
import { LoginPage } from '../../../pages/teacher/loginPage';

export class GeneoWorld extends World {
  // 1. Declare the property
  loginPage!: LoginPage;

  // 2. Instantiate in initializePageObjects
  initializePageObjects(page: Page) {
    this.loginPage = new LoginPage(page);
  }
}
```

### Step 3: Create the Feature File
Create `tests/web/features/Teacher/login.feature`:

```gherkin
@teacher @smoke
Feature: Teacher Authentication

  Scenario: Successful login with valid credentials
    Given Teacher opens the application
    When Teacher enters valid username and password
    And Teacher clicks on the login button
    Then Teacher should be navigated to dashboard
```

### Step 4: Implement Step Definitions
Create `tests/web/step-definitions/Teacher/loginSteps.ts`:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { GeneoWorld } from '../../config/geneoWorld';
import { config } from '../../config/test.config';

Given('Teacher opens the application', async function (this: GeneoWorld) {
  await this.page!.goto(config.getTeacherUrl());
});

When('Teacher enters valid username and password', async function (this: GeneoWorld) {
  await this.loginPage.enterUsername('sample_teacher');
  await this.loginPage.enterPassword('password123');
});

When('Teacher clicks on the login button', async function (this: GeneoWorld) {
  await this.loginPage.clickLogin();
});

Then('Teacher should be navigated to dashboard', async function (this: GeneoWorld) {
  await expect(this.page!).toHaveURL(/.*dashboard/);
});
```

---

## Executing Tests

| Command | Description |
|---|---|
| `npm test` / `npm run test:web` | Run all web feature tests |
| `npm run test:teacher` | Run all Teacher application feature tests |
| `npm run test:student` | Run all Student application feature tests |
| `npm run test:admin` | Run all Admin application feature tests |
| `npm run test:api` | Run API tests |
| `npx cucumber-js tests/web/features/<path>/<file>.feature` | Run a specific feature file |
| `npx cucumber-js --tags "@smoke"` | Run scenarios matching a specific tag |
| `npm run report` | Generate HTML report from `reports/cucumber-report.json` |
| `npm run open:report` | Open the generated HTML report in browser |
| `npm run zip:report` | Compress test reports for CI/archival |

### CLI Overrides
You can override environment dynamically:
```bash
# Run against stage environment
npm run test:teacher -- --env stage

# Run in headless mode
RUN_HEADLESS=true npm run test:web

# Run on Firefox
RUN_BROWSER=firefox npm run test:web
```

---

## Coding Rules & Conventions

1. **Locator Priority (Strict)**:
   1. `data-id` (`page.locator('[data-id="..."]')`)
   2. `getByTestId` (`data-test-id`)
   3. `getByRole` with accessible name
   4. `getByLabel`
   5. `getByPlaceholder`
   6. `getByText` (static text only)
   7. CSS / XPath: Forbidden unless unavoidable
2. **Page Objects**:
   - Encapsulate all locators and element actions.
   - **No assertions (`expect`) in page objects** — assertions belong in step definitions.
   - Extends `BasePage(page)`.
3. **No Hardcoded Waits**:
   - Never use `page.waitForTimeout()`.
   - Use web-first assertions or locator auto-waiting (`locator.waitFor({ state: 'visible' })`).
4. **Soft Assertions**:
   - Use `this.softAssert.assertElementVisible(locator)` for non-blocking UI validations. Screenshots are automatically captured and attached.
