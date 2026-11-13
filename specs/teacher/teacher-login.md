# Test Plan: Teacher Login Flow

**Target:** https://teach-test.geneo.in/
**Seed:** tests/seed.spec.ts
**Date:** 2026-11-07

## Overview
Comprehensive test plan covering the end-to-end authentication workflow for the Teacher Application on Geneo (`https://teach-test.geneo.in/`). It encompasses cookie consent management (Amplitude analytics opt-in/opt-out), multi-step login progression (username entry to password verification), client-side and server-side validation error handling, credential mask toggling, username editing, customer support modal access, and mobile responsive layout behavior.

## Preconditions
- Target environment is reachable at `https://teach-test.geneo.in/` (redirects to `https://teach-test.geneo.in/enter-uid`).
- Teacher user role required.
- Test credentials are loaded from `testdata/credentials.json`:
  - Valid username: `teacher_admin`
  - Valid password: `geneo`
- Browser starts with a clean session (no pre-existing cookies or localStorage keys like `amplitudeAnalyticsConsent`).

---

## Scenarios

### Scenario 1.1 — Reject Analytics Cookie Consent Banner
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Fresh browser session with no `amplitudeAnalyticsConsent` stored in localStorage.
- **Steps:**
  1. Given Teacher navigates to "https://teach-test.geneo.in/" — expected: Redirected to "/enter-uid" with "Optional analytics cookies" dialog visible.
  2. When Teacher clicks "Reject analytics" button using `getByRole('button', { name: 'Reject analytics' })` — expected: Cookie modal closes and dismisses backdrop.
  3. Then The cookie dialog should no longer be visible — expected: `getByRole('dialog')` is hidden or detached.
  4. And Local storage item "amplitudeAnalyticsConsent" should be set to "false" — expected: Browser localStorage has key `amplitudeAnalyticsConsent` equal to `"false"`.
- **Assertions:**
  - Expect `getByRole('dialog')` not to be visible.
  - Expect `localStorage.getItem('amplitudeAnalyticsConsent')` to equal `'false'`.
- **Edge cases considered:**
  - Page refresh after rejection retains consent decision and does not re-display the banner.

### Scenario 1.2 — Accept Analytics Cookie Consent Banner (Pass and Persist)
- **Priority:** P0
- **Tags:** @teacher, @smoke, @critical
- **Preconditions:** Fresh browser session with no `amplitudeAnalyticsConsent` stored in localStorage.
- **Steps:**
  1. Given Teacher navigates to "https://teach-test.geneo.in/" — expected: Redirected to "/enter-uid" with "Optional analytics cookies" dialog displayed.
  2. When Teacher clicks "Accept analytics" button using `getByRole('button', { name: 'Accept analytics' })` — expected: Cookie modal is dismissed.
  3. Then The cookie dialog should no longer be visible — expected: `getByRole('dialog')` is hidden.
  4. And Local storage item "amplitudeAnalyticsConsent" should be set to "true" — expected: Browser localStorage has key `amplitudeAnalyticsConsent` equal to `"true"`.
  5. And Teacher is able to interact with the underlying login form — expected: Username textbox `getByRole('textbox')` is enabled and focusable.
- **Assertions:**
  - Expect `getByRole('dialog')` not to be visible.
  - Expect `localStorage.getItem('amplitudeAnalyticsConsent')` to equal `'true'`.
  - Expect `locator('[data-id="Next"]')` to be visible.
- **Edge cases considered:**
  - Subsequent test scenarios pass without cookie modal interference when consent is accepted.

---

### Scenario 2.1 — Empty Username Submission Validation
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the Enter UID page (`/enter-uid`) with cookie consent accepted.
- **Steps:**
  1. Given Teacher is on the login UID screen "https://teach-test.geneo.in/enter-uid" — expected: Username textbox is empty.
  2. Then The "Next" button should be disabled by default — expected: `locator('[data-id="Next"]')` has `disabled` attribute.
  3. When Teacher types only whitespace spaces into the username field — expected: "Next" button becomes clickable.
  4. And Teacher clicks the "Next" button using `locator('[data-id="Next"]')` — expected: Form submission is blocked and validation message is shown.
  5. Then Validation error "Please enter a valid username, phone number, or email.*" should be displayed — expected: `getByRole('heading', { name: 'Please enter a valid username, phone number, or email.*' })` is visible.
- **Assertions:**
  - Expect `locator('[data-id="Next"]')` to be disabled when input is empty.
  - Expect `getByRole('heading', { name: 'Please enter a valid username, phone number, or email.*' })` to be visible after submitting whitespace.
- **Edge cases considered:**
  - Clearing the whitespace input disables the "Next" button again.

### Scenario 2.2 — Invalid Username Submission
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the Enter UID page (`/enter-uid`) with cookie consent accepted.
- **Steps:**
  1. Given Teacher is on the login UID screen "https://teach-test.geneo.in/enter-uid" — expected: Username input is displayed.
  2. When Teacher fills username input with an unregistered username "invalid_user_9999" — expected: Text is populated and "Next" button is enabled.
  3. And Teacher clicks the "Next" button using `locator('[data-id="Next"]')` — expected: API validation check runs.
  4. Then Error message "Invalid username*" should be displayed — expected: `getByRole('heading', { name: 'Invalid username*' })` is visible below the input.
  5. And Teacher remains on the "/enter-uid" page — expected: URL remains `https://teach-test.geneo.in/enter-uid`.
- **Assertions:**
  - Expect `getByRole('heading', { name: 'Invalid username*' })` to be visible.
  - Expect page URL to remain `https://teach-test.geneo.in/enter-uid`.
- **Edge cases considered:**
  - Entering invalid email format or invalid phone number characters shows appropriate validation error.

### Scenario 2.3 — Valid Username Progression to Password Screen
- **Priority:** P0
- **Tags:** @teacher, @smoke, @critical
- **Preconditions:** Teacher is on the Enter UID page (`/enter-uid`) with cookie consent accepted.
- **Steps:**
  1. Given Teacher is on the login UID screen "https://teach-test.geneo.in/enter-uid" — expected: Username input is empty.
  2. When Teacher enters valid username "teacher_admin" from "testdata/credentials.json" — expected: Input field contains "teacher_admin" and "Next" button is enabled.
  3. And Teacher clicks the "Next" button using `locator('[data-id="Next"]')` — expected: Request succeeds and page transitions.
  4. Then Teacher should be navigated to "/login_password" — expected: URL contains `/login_password`.
  5. And Heading "Welcome Teacher" should be visible — expected: `getByRole('heading', { name: 'Welcome' })` and `getByRole('heading', { name: 'Teacher' })` are visible.
  6. And The entered username "teacher_admin" should be displayed in a disabled input with an edit icon — expected: Username textbox has value "teacher_admin" and is disabled, with `locator('[data-id="Edit"]')` visible.
- **Assertions:**
  - Expect page URL to be `https://teach-test.geneo.in/login_password`.
  - Expect `getByRole('heading', { name: 'Welcome' })` to be visible.
  - Expect `getByRole('textbox').first()` to have value `"teacher_admin"` and be disabled.
- **Edge cases considered:**
  - Username case-insensitivity handling during lookup.

### Scenario 2.4 — Edit Username Navigation from Password Screen
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher has entered a valid username and is on the password screen (`/login_password`).
- **Steps:**
  1. Given Teacher is on the password screen "https://teach-test.geneo.in/login_password" with username "teacher_admin" displayed — expected: Username field is disabled with edit button `locator('[data-id="Edit"]')` visible.
  2. When Teacher clicks the Edit button using `locator('[data-id="Edit"]')` — expected: Navigation back to UID entry screen occurs.
  3. Then Teacher should be navigated back to "/enter-uid" — expected: URL is `https://teach-test.geneo.in/enter-uid`.
  4. And The username field should be editable with the previous username "teacher_admin" pre-filled — expected: `getByRole('textbox')` is enabled and has value `"teacher_admin"`.
  5. When Teacher modifies the username to another value or re-submits — expected: "Next" button is enabled and submission functions properly.
- **Assertions:**
  - Expect page URL to be `https://teach-test.geneo.in/enter-uid`.
  - Expect `getByRole('textbox')` to be enabled (`toBeEnabled()`).
  - Expect `getByRole('textbox')` to have value `"teacher_admin"`.
- **Edge cases considered:**
  - Clearing and modifying the username after editing updates the target user profile on re-progression.

---

### Scenario 3.1 — Empty Password Submission Validation
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the password screen (`/login_password`) for user "teacher_admin".
- **Steps:**
  1. Given Teacher is on the password screen "https://teach-test.geneo.in/login_password" — expected: Password input `locator('[data-id="password"]')` is empty.
  2. Then The "Start" button should be disabled — expected: `locator('[data-id="Start"]')` has `disabled` attribute.
  3. When Teacher types only whitespace spaces into the password field — expected: Password input value contains spaces.
  4. Then The "Start" button should still remain disabled — expected: `locator('[data-id="Start"]')` is disabled and cannot be submitted.
- **Assertions:**
  - Expect `locator('[data-id="Start"]')` to have attribute `disabled` when password is empty.
  - Expect `locator('[data-id="Start"]')` to have attribute `disabled` when password contains only whitespace.
- **Edge cases considered:**
  - Attempting to submit via Enter key while password is empty does not trigger login request.

### Scenario 3.2 — Eye Button Mask / Unmask Password Toggle
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the password screen (`/login_password`) for user "teacher_admin".
- **Steps:**
  1. Given Teacher is on the password screen "https://teach-test.geneo.in/login_password" — expected: Password field is present.
  2. When Teacher fills password field with "geneo" using `locator('[data-id="password"]')` — expected: Text is entered.
  3. Then The password field input type should be "password" by default — expected: `locator('[data-id="password"]')` has attribute `type="password"` (masked).
  4. When Teacher clicks the eye icon button using `getByRole('button', { name: 'toggle password visibility' })` — expected: Password becomes unmasked.
  5. Then The password field input type should change to "text" — expected: `locator('[data-id="password"]')` has attribute `type="text"` (visible text).
  6. When Teacher clicks the eye icon button again using `getByRole('button', { name: 'toggle password visibility' })` — expected: Password becomes masked again.
  7. Then The password field input type should revert to "password" — expected: `locator('[data-id="password"]')` has attribute `type="password"`.
- **Assertions:**
  - Expect `locator('[data-id="password"]')` to have attribute `type` with value `'password'` initially.
  - Expect `locator('[data-id="password"]')` to have attribute `type` with value `'text'` after one click on toggle.
  - Expect `locator('[data-id="password"]')` to have attribute `type` with value `'password'` after second click on toggle.
- **Edge cases considered:**
  - Text entered while unmasked remains intact after re-masking.

### Scenario 3.3 — Invalid Password Submission
- **Priority:** P1
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the password screen (`/login_password`) for user "teacher_admin".
- **Steps:**
  1. Given Teacher is on the password screen "https://teach-test.geneo.in/login_password" — expected: Password field is displayed.
  2. When Teacher fills password field with an incorrect password "wrong_password_123" using `locator('[data-id="password"]')` — expected: "Start" button becomes enabled.
  3. And Teacher clicks the "Start" button using `locator('[data-id="Start"]')` — expected: Authentication fails.
  4. Then Error message "Invalid username/nickname or password" should be displayed — expected: `getByRole('heading', { name: 'Invalid username/nickname or password' })` is visible.
  5. And Teacher remains on the "/login_password" page — expected: URL remains `https://teach-test.geneo.in/login_password`.
- **Assertions:**
  - Expect `getByRole('heading', { name: 'Invalid username/nickname or password' })` to be visible.
  - Expect URL to remain `https://teach-test.geneo.in/login_password`.
- **Edge cases considered:**
  - Repeated failed password attempts do not crash the application and error message updates reliably.

### Scenario 3.4 — Valid Credentials Successful Teacher Login
- **Priority:** P0
- **Tags:** @teacher, @smoke, @critical
- **Preconditions:** Teacher is on the password screen (`/login_password`) with valid username "teacher_admin".
- **Steps:**
  1. Given Teacher is on the password screen "https://teach-test.geneo.in/login_password" — expected: Welcome message and password field are present.
  2. When Teacher fills password field with "geneo" from "testdata/credentials.json" using `locator('[data-id="password"]')` — expected: Password is input and "Start" button is enabled.
  3. And Teacher clicks the "Start" button using `locator('[data-id="Start"]')` — expected: Authentication succeeds and dashboard loads.
  4. Then Teacher should be redirected to the home dashboard "/home" — expected: URL is `https://teach-test.geneo.in/home`.
  5. And The dashboard header should display user profile "Teacher Admin" — expected: `getByText('Teacher Admin')` is visible.
  6. And Main module navigation actions ("Teach", "Assess", "Analysis", "Laboratory") should be visible — expected: `getByRole('heading', { name: 'Teach' })` and `getByRole('heading', { name: 'Assess' })` are visible.
- **Assertions:**
  - Expect page URL to be `https://teach-test.geneo.in/home`.
  - Expect `getByText('Teacher Admin')` to be visible.
  - Expect `getByRole('button', { name: /Choose Class & Subject/i })` to be visible.
- **Edge cases considered:**
  - Authentication token and session state persist across tab reload.

---

### Scenario 4.1 — Help & Support Modal Display and Dismissal
- **Priority:** P2
- **Tags:** @teacher, @regression
- **Preconditions:** Teacher is on the login UID screen (`/enter-uid`) with cookie consent accepted.
- **Steps:**
  1. Given Teacher is on "https://teach-test.geneo.in/enter-uid" — expected: "Help & Support" link is displayed at the bottom of the card.
  2. When Teacher clicks "Help & Support" using `locator('[data-id="Help & Support"]')` — expected: Support modal opens.
  3. Then The "Help & Support" dialog should be visible — expected: `getByRole('dialog')` is visible with heading "Help & Support".
  4. And Support contact number "Call: +917042980055" should be displayed — expected: `getByText('Call: +917042980055')` is visible.
  5. And Support email "geneo_support@schoolnetindia.com" should be displayed — expected: `getByText('geneo_support@schoolnetindia.com')` is visible.
  6. When Teacher presses the "Escape" key or clicks the close icon — expected: Dialog closes.
  7. Then The "Help & Support" dialog should no longer be visible — expected: `getByRole('dialog')` is hidden.
- **Assertions:**
  - Expect `getByRole('dialog')` to be visible upon clicking Help & Support.
  - Expect `getByText('Call: +917042980055')` to be visible inside the dialog.
  - Expect `getByText('geneo_support@schoolnetindia.com')` to be visible inside the dialog.
  - Expect `getByRole('dialog')` not to be visible after pressing Escape.
- **Edge cases considered:**
  - Clicking outside the modal backdrop also dismisses the dialog.

### Scenario 4.2 — Mobile Browser Viewport Layout & Responsiveness Check
- **Priority:** P2
- **Tags:** @teacher, @regression
- **Preconditions:** Viewport size set to mobile dimensions (375x667, mobile emulation).
- **Steps:**
  1. Given Browser viewport is set to 375x667 (mobile portrait) — expected: Mobile responsive styling is activated.
  2. When Teacher navigates to "https://teach-test.geneo.in/" — expected: Mobile layout renders with onboarding carousel and stacked login container.
  3. And Teacher handles cookie consent by clicking "Accept analytics" — expected: Cookie banner closes cleanly without overlapping content.
  4. Then Mobile onboarding controls "Skip" and "GET STARTED" should be visible — expected: `getByRole('button', { name: 'Skip' })` and `getByRole('button', { name: 'GET STARTED' })` are visible.
  5. And The login UID input and "Next" button should be properly rendered and interactable — expected: `getByRole('textbox')` and `locator('[data-id="Next"]')` are displayed within mobile viewport bounds.
  6. When Teacher enters "teacher_admin" and clicks "Next" — expected: Transitions to password screen in mobile viewport without visual distortion.
  7. Then Mobile password screen displays welcome banner, masked password input, eye toggle, and "Start" button — expected: All login elements are accessible without horizontal overflow.
- **Assertions:**
  - Expect `getByRole('button', { name: 'Skip' })` to be visible on mobile viewport.
  - Expect `getByRole('textbox')` to be visible and within viewport bounds.
  - Expect navigation from mobile enter-uid to mobile login_password to succeed seamlessly.
- **Edge cases considered:**
  - Soft keyboard opening on mobile device does not obscure the "Next" or "Start" submission buttons.

---

## Not covered (and why)
- **First Time User Self-Registration Flow ("Register Here"):** Leads to external registration onboarding wizard (`/registration`), which belongs to a distinct feature domain with separate student/teacher registration paths.
- **Forgot Password Flow:** Redirects to the credential recovery / OTP verification service, which requires external SMS/email gateway integrations outside the standard login flow.
- **Social / SSO Sign-In Integration:** Third-party SSO providers (Google/MCB) require external auth mocking and are reserved for a dedicated SSO feature plan.
- **Post-Login Module Deep Dive (Teach / Assess / Laboratory):** Covered in their respective module test plans (`specs/teacher/teach.md`, `specs/teacher/assess.md`).
