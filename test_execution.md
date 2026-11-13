# Test Execution Guide

This document provides commands to execute Playwright Cucumber BDD test scenarios across various scopes and filters.

---

## 1. Run Specific Scenarios

### Run by Scenario Name
```powershell
npx cucumber-js tests/web/features/Teacher/teacherLogin.feature --name "1.1 Reject Analytics Cookie Consent Banner"
```
```powershell
npx cucumber-js tests/web/features/Teacher/teacherLogin.feature --name "1.2 Accept Analytics Cookie Consent Banner"
```
```powershell
npx cucumber-js tests/web/features/Teacher/teacherLogin.feature --name "2.1 Empty Username Submission Validation"
```
```powershell
npx cucumber-js tests/web/features/Teacher/teacherLogin.feature --name "2.2 Invalid Username Submission"
```

### Run by Line Number in Feature File

- **Scenario 1.1** (starts at line 4):
  ```powershell
  npx cucumber-js tests/web/features/Teacher/teacherLogin.feature:4
  ```

- **Scenario 1.2** (starts at line 12):
  ```powershell
  npx cucumber-js tests/web/features/Teacher/teacherLogin.feature:12
  ```

- **Scenario 2.1** (starts at line 20):
  ```powershell
  npx cucumber-js tests/web/features/Teacher/teacherLogin.feature:20
  ```

- **Scenario 2.2** (starts at line 28):
  ```powershell
  npx cucumber-js tests/web/features/Teacher/teacherLogin.feature:28
  ```

---

## 2. Run by Feature File

Run all scenarios in `teacherLogin.feature`:
```powershell
npx cucumber-js tests/web/features/Teacher/teacherLogin.feature
```

---

## 3. Run by Application Suite (npm scripts)

- **Run all Teacher tests:**
  ```powershell
  npm run test:teacher
  ```

- **Run all Web tests across all apps:**
  ```powershell
  npm run test:web
  ```

---

## 4. Run by Tags

- **Run `@smoke` scenarios:**
  ```powershell
  npx cucumber-js --tags "@smoke"
  ```

- **Run scenarios tagged with both `@teacher` and `@critical`:**
  ```powershell
  npx cucumber-js --tags "@teacher and @critical"
  ```

---

## 5. Generate & View HTML Reports

- **Generate HTML report:**
  ```powershell
  npm run report
  ```

- **Open the generated report in browser:**
  ```powershell
  npm run open:report
  ```
