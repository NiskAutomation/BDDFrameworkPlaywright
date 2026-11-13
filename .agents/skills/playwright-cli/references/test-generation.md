# Test planning, generation, and healing for this repository

Use the terminal Playwright CLI to explore and diagnose Teacher, Student, and Admin apps. Author and run tests with repository Cucumber BDD and TypeScript POM.

## Sources of truth

Read root AGENTS.md, then the relevant repository skill:
- Planner: .github/agents/skills/playwright-planner/SKILL.md
- Generator: .github/agents/skills/playwright-generator/SKILL.md
- Healer: .github/agents/skills/playwright-healer/SKILL.md

AGENTS.md takes precedence. These three skills govern their stages. Browser exploration uses terminal Playwright CLI, never browser MCP or WebMCP.

## Project separation

- POMs extend pages/basePage.ts and stay under pages/teacher/, pages/student/, or pages/admin/.
- Features and step definitions stay in their matching tests/web/features/<App>/ and tests/web/step-definitions/<App>/ folders.
- Plans stay under specs/teacher/, specs/student/, or specs/admin/.
- Load credentials and data from testdata/ or envs/. Never print or commit credentials, auth state, or tokens.
- Cross-application journeys require an approved orchestration location and isolated role contexts.

## CLI browser workflow

Check availability:

```powershell
npm.cmd run browser:cli -- --help
```

Use separate role sessions:

```powershell
npm.cmd run browser:teacher -- open https://teach-test.geneo.in/ --headed
npm.cmd run browser:student -- open https://learn-test.geneo.in/ --headed
npm.cmd run browser:admin -- open https://admin-test.geneo.in/ --headed
npm.cmd run browser:teacher -- snapshot
npm.cmd run browser:teacher -- click <current-ref>
npm.cmd run browser:teacher -- close
```

Refresh snapshots after navigation and significant UI changes. Use current snapshot refs only; never commit refs. For attributes, use read-only CLI eval and inspect data-id before data-test-id. Do not mutate app state through eval. Review console/request output for secrets. Close only task sessions; never close or kill unrelated sessions.

Follow AGENTS.md locator order: data-id, getByTestId (data-test-id), accessible role, label, placeholder, genuinely static text, then CSS/XPath only with explicit approval. Verify uniqueness and scope repeated names. CLI-generated code is a suggestion, not a locator policy.

## Plan

Planner explores the requested flow and writes a numbered Markdown plan under specs/<app>/. Include prerequisites, data, role/tier tags, detailed BDD actions and expected outcomes, shared data, locator candidates, and verified observations, assumptions, and blockers. Planning does not generate code or authorize state-changing actions. Scenarios are independent unless the approved use case requires one complete cross-app scenario.

## Generate

Generator reads the numbered approved scenario, checks locators in the live app through CLI, and creates Cucumber features, step definitions, and app-specific POMs.

- Features use Gherkin and role/tier tags.
- Steps import Given, When, Then from @cucumber/cucumber and use this: GeneoWorld.
- POMs extend BasePage, accept only page: Page in the constructor, and contain locators/actions, never assertions.
- Register each POM in tests/web/config/geneoWorld.ts.
- Keep interactions in POMs and assertions in steps. Use web-first assertions and state-based waits; no hardcoded sleeps or waitForSelector.
- Resolve URLs through tests/web/config/test.config.ts and load credentials/data from existing testdata.
- Do not add dependencies or change playwright.config.ts without approval. Ask before creating required files unless the user approved them.

Run generated features with Cucumber, not Playwright Test. Report separately what was observed, generated, compiled, and executed. Browser exploration and Cucumber dry runs do not count as a passing end-to-end test.

## Heal

Healer classifies failures as locator drift, UI restructure, copy change, real regression, environment issue, or timing race. Inspect current UI with CLI snapshots, console, and requests. Apply the smallest locator-priority-compliant fix while preserving assertion intent. Never weaken assertions, skip tests, add sleeps, or hide application failures. If evidence indicates a regression or cannot distinguish regression from drift, report evidence and stop for user direction. Report classification, root cause, evidence, exact fix, intent preservation, run results, changed files, and recommendation as defined by the Healer skill.

## Validation

```powershell
npm.cmd exec -- tsc --noEmit
npx.cmd cucumber-js tests/web/features/<App>/<feature>.feature
npm.cmd run test:teacher
npm.cmd run test:student
npm.cmd run test:admin
npm.cmd run test:web
```

Use a Node version supported by installed Cucumber. If Cucumber fails before loading because the runtime is unsupported, report the blocker; do not silently change dependencies or project runtime configuration.
