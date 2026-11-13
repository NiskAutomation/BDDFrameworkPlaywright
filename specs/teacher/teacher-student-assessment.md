# Test Plan: Teacher-to-Student Homework Assessment

**Targets:** Teacher — https://teach-test.geneo.in/; Student — https://learn-test.geneo.in/
**Seed:** `tests/seed.spec.ts`
**Date:** 2026-11-11
**Status:** End-to-end browser journey verified; automated execution not performed.
**Location approval:** The user approved creating this file and including the Student journey in this Teacher-initiated cross-application plan as an exception to application-separated plans.
**Guidance:** `AGENTS.md`, `.github/agents/skills/playwright-planner/SKILL.md`, and `Prompts/Planner/planner_prompt.md`.

## Overview

Verify that a Teacher creates and assigns one four-question Homework assessment for 8A Science, the matching Student finds and submits it, and Teacher records that Student's submission. Keep creation, Student completion, and Teacher verification within Scenario 1.1 so no scenario depends on another scenario running first.

Exploration used the repository Playwright CLI with separate `geneo-teacher` and `geneo-student` sessions. The user explicitly authorized creating and assigning one assessment and submitting it as Student, overriding the planner's read-only restriction for those actions. Both task sessions were closed after verification; no automation code was generated.

## Preconditions

- Use the test URLs above, with working access to both applications and the repository's installed Playwright CLI.
- Load Teacher credentials from `testdata/credentials.json` fields `teacherUserName` and `teacherPassword`; load Student credentials from `studentUserName` and `studentPassword`. All four fields were present and both logins succeeded. Never include values or authentication state in the plan, logs, reports, or terminal history.
- Maintain separate authenticated Teacher and Student browser sessions throughout the scenario. Preserve Teacher's assessment context while completing the Student attempt.
- Verify the Student's configured class and subject before creating the assessment, and select 8A Science as Teacher. School details vary by environment and must not be compared. Verify delivery and submission using the newly assigned assessment's identity.
- An older completed assessment's roster did not establish target membership. Do not use historical roster absence as proof that the Student is not currently enrolled. The new assessment subsequently included the target Student among 16 students.
- The first displayed chapter and its first topic must support exactly two Easy and two Medium questions. If either count is unavailable, stop and report the shortage; do not change counts, chapter, or topic to force completion.
- Generate one unique title per authorized new run and retain the assigned assessment ID immediately. During retries, resume the existing assessment using that identity; do not create another assessment or start a reattempt.
- Review the selected section and audience before assignment. This exploration used section A and **All Students**, resulting in 16 recipients. A target-only assignment was not verified: **Select Specific Students** showed no student-selection list and left ASSIGN disabled.
- Start and end dates must allow the Student attempt within the assignment window. Inspect visible validation before changing scheduling. Use UI availability checks rather than hardcoded sleeps.
- Score validation and completion of evaluation are outside scope. A recorded submission can remain under evaluation.

### Required test data

| Data | Source or rule | Verification |
| --- | --- | --- |
| Teacher and Student credentials | Existing fields in `testdata/credentials.json` | Present; successful login for both roles |
| Target Student identity | Authenticated Student profile, matched to Teacher's roster at runtime | Matched; credential value intentionally omitted |
| Class/subject relationship | Student profile and Teacher class selector | Student 8 A; Teacher 8 A - Science; no school-detail comparison |
| Assessment type and conduction | Homework; Geneo App | Verified |
| Chapter/topic | First displayed chapter, then its first displayed topic | Actual names recorded below |
| Question distribution | Easy 2, Medium 2, Hard 0; total 4 | Verified in selection and review |
| Title and ID | Unique title; capture ID after assignment | Recorded below |
| Answers | Valid nonempty answers appropriate to each displayed question; account for shuffling | All four typed answers saved and seen in Teacher |
| Schedule/timezone | Capture UI dates/times and timezone evidence for each run | Recorded below; explicit application timezone label unverified |

No missing credential or answer data blocked this exploration. No new credential, upload, or automation files are required for this Markdown deliverable.

## Shared assessment identity and scheduling data

This is the single assessment created during exploration. Reuse this record when investigating or retrying the observed run.

| Field | Observed value |
| --- | --- |
| Exact title | `PLAN-HW-8A-20261111-094720` |
| Assessment ID | `23972` |
| Class and subject | 8A Science |
| Chapter | `1. Crop Production and Management` |
| Topic | `1.1 Agricultural Practices` |
| Type / mode | Homework / Geneo App |
| Questions | 4 total: 2 Easy, 2 Medium, 0 Hard |
| Review summary | 12 Minutes; Medium overall difficulty; 11 total marks |
| Start | 2026-11-11, 03:20 PM (15:20) |
| End | 2026-11-11, 11:59 PM (23:59) |
| Timezone evidence | Host timezone was India Standard Time, UTC+05:30. UI times matched the host's local time; no explicit application timezone label was observed. Record the schedule as IST with this qualification. |
| Initial start / validation | 03:17 PM became invalid; UI displayed `Invalid Time` and ASSIGN was disabled |
| Scheduling adjustment | At approximately 15:18 IST, selected the earliest enabled future picker choice, 03:20 PM; picker options were in five-minute increments |
| Audience | Section A, All Students; 16 students |
| Daily Reminder | 06:00 pm |
| Question Shuffling / Reattempt | YES / YES; no reattempt initiated |
| Time Test / Proctoring | NO / NO |
| Assignment confirmation | `Congratulations!` and `Assessment Successfully Assigned` |
| Student initial status | `Pending` |
| Student completion | `Assessment Submitted`; `Evaluation in Progress` |
| Teacher baseline / final | `0/16` to `1/16` Submissions; `15 Students not Submitted` after submission |
| Target Student evidence | All four submitted responses visible under `Student's Attempt:` in the target's performance record |

Identity was corroborated by Teacher's `/assessment-congratulations/23972` route and Student routes containing `assessmentId=23972`, including `/homework-start-cover` and `/submitted-homework`. Teacher's `/homework-ongoing` route did not include the assessment ID, so verify the exact title and class/topic there before opening a Student record.

## Scenarios

### Scenario 1.1 — Assign Homework, submit as the enrolled Student, and verify in Teacher

- **Priority:** P0
- **Tags:** `@teacher @student @critical @regression`
- **Preconditions:** Both test accounts are available; membership is verified before creation; two separate sessions exist; one authorized assessment identity is maintained throughout the run.
- **Steps:**

| Step | BDD action | Expected outcome and observed behavior |
| --- | --- | --- |
| 1 | **Given** separate Teacher and Student CLI sessions, open each application root. | Each session displays its own login page at `/enter-uid`; session state remains separate. |
| 2 | **When** the Teacher's `Optional analytics cookies` dialog is shown, choose `Accept analytics`. | Dialog closes. Verified in the Teacher session. If absent on a later run, continue without manufacturing a dialog. |
| 3 | **And** enter the Teacher username from existing test data, select `Next`, enter the password, and select `Start`. | Successful navigation to Teacher `/home`; no credential values are exposed. |
| 4 | **And** accept `Accept analytics` in Student if shown, enter the existing Student username, select `Next`, enter its password, and select `Start`. | Successful navigation to Student `/home`. Verified independently of Teacher login. |
| 5 | **Then** inspect Student Profile and Teacher Profile, and select Teacher's `8 A - Science` class context. | Both schools match; Student Profile explicitly shows `8 A` and Science. Stop for clarification if membership cannot be established. This check occurred before creation. |
| 6 | **When** Teacher selects `Assess`. | The Assessment page opens at `/homework-manage`, with creation and previous-assessment management controls. |
| 7 | **And** Teacher selects `Create Assessment`. | `Choose Type of Assessment` is displayed. Because 8A Science was selected during membership verification, the observed flow already displayed `8A - Science` here; no second class-selection screen appeared. If a class chooser appears on another run, select the matching 8A Science entry and verify its context. |
| 8 | **And** Teacher selects `Homework`, then `Geneo App` under `Choose Mode of Conduction` when shown. | Homework and app conduction are selected; `PROCEED` is available. Conduction selection was shown in this run. |
| 9 | **And** Teacher selects `PROCEED`. | `Choose Chapter to Create Homework` appears for Class 8A, Science. |
| 10 | **And** Teacher selects the first displayed chapter and records its actual name. | Observed first chapter: `1. Crop Production and Management`. Its topic-selection page opens. |
| 11 | **And** Teacher selects the first displayed topic and records its actual name. | Observed first topic: `1.1 Agricultural Practices`. `Create Assessment From Question Bank` appears with difficulty controls. |
| 12 | **And** Teacher uses Easy `Add`, then `+`, and Medium `Add`, then `+`. | Easy = 2, Medium = 2, Hard = 0, total Questions = 4. Stop and report insufficient availability if either requested count cannot be achieved. |
| 13 | **And** Teacher selects `CREATE`. | `My Assessment` opens with four review questions and a breakdown of 2 Easy, 2 Medium, 0 Hard. Verify Geneo App conduction and record question content before continuing. |
| 14 | **Then** inspect the generated content and summary. | Observed summary: 12 Minutes, 11 marks, Medium overall difficulty. Record the observed mismatch: questions about molecules and ions appeared under Agricultural Practices. Do not silently replace questions or regenerate the assessment. |
| 15 | **When** Teacher selects `Proceed`. | `Assign Daily Assessment` opens for Class 8A Science with title, schedule, section, audience, and other settings. |
| 16 | **And** Teacher enters the unique assessment title and reviews assignment settings. | Title is retained. Verify section A, recipient scope, start/end, reminder, shuffling, reattempt, timed-test and proctoring settings. Observed values are in the shared-data table. |
| 17 | **And** if ASSIGN is disabled, inspect all validation and audience selection before changing the start time. | In this run, the elapsed start showed `Invalid Time`. `Select Specific Students` independently left ASSIGN disabled with no selection list; restoring All Students removed that audience-related obstacle. Do not treat every disabled state as a time error. |
| 18 | **And** when scheduling is invalid, open the start-time picker, select its earliest valid future choice, and confirm with `OK`. | Observed picker choices were five minutes apart; 15:20 was the earliest enabled future choice at approximately 15:18 IST. Start validation cleared. Record the final start/end and timezone evidence; do not assume seconds are supported. |
| 19 | **And** Teacher selects the enabled `ASSIGN` once. | `Assessment Successfully Assigned` appears with the exact title, `8A Science`, and the deadline. Capture ID `23972` from the success route. On an ambiguous result, inspect the existing assessment before attempting another assignment. |
| 20 | **And** Teacher selects `Go To Assessment`. | The same title and `8A \| Science \| 1.1 Agricultural Practices` appear. Record baseline `0/16` Submissions and the start/deadline. Keep this session available. |
| 21 | **When** Student returns to its dashboard and selects `Assess`. | `Your Assessments` opens at `/student-homework-dash`. |
| 22 | **And** Student opens `Search by Assessment Type` and selects `Homework`. | Filter shows Homework. The actual label is Search by Assessment Type, not Search by Homework. |
| 23 | **Then** locate the exact shared title and verify its status before opening. | The matching card shows the exact title, Science, the topic, 4 Questions, and `Pending`. Match the full identity; do not select an unrelated homework by topic alone. |
| 24 | **When** Student checks the assessment's availability and opens the exact matching card. | Cover route contains the captured assessment ID; the cover repeats the title, 4 questions, 12 minutes, and `0/4 Submitted`. If start is not yet available, continue bounded UI-state checks until enabled or report a scheduling blocker. No hardcoded sleeps. In this run the start time had already passed. |
| 25 | **And** Student selects the enabled `LET'S START`. | The attempt opens at `/active-homework?assessmentId=23972&sessionMode=1` with Total Questions:4 and 0% completed. The observed start label was LET'S START. |
| 26 | **And** Student reads the first displayed question, enters a valid answer in `Your Answer`, and selects `Next`. | Next is disabled when the answer is empty and enabled after entry; completion advances to 25%. No question is skipped. |
| 27 | **And** Student answers the next two displayed questions, selecting `Next` after each. | Responses are saved and completion advances. Use the displayed prompts because shuffling changes order. Match multipart questions with a response covering each part. |
| 28 | **And** Student answers the fourth question and selects `Next`. | Completion shows 100%. A dialog says `You have answered all the questions.` and `Do you want to end the test?`, with END TEST and REVIEW TEST choices. |
| 29 | **And** Student selects `END TEST` within that confirmation dialog. | Navigation to `/submitted-homework?assessmentId=23972`; `Assessment Submitted` and `Evaluation in Progress` appear. Do not click REATTEMPT. |
| 30 | **When** returning to the existing Teacher session, refresh/reopen the same assessment and verify its title. | Same assessment remains selected; Submissions changes from `0/16` to `1/16`, and `15 Students not Submitted` is shown. Do not rely on the aggregate count alone. |
| 31 | **And** Teacher finds the target Student using the identity obtained from Student Profile and opens that record. | The target's Performance page opens with `Answer & Explanations` and four numbered question controls. |
| 32 | **Then** inspect each of the four Teacher-side questions and its `Student's Attempt:` content. | All four typed responses are recorded and match by question content despite different ordering. `Answer is being evaluated. Check again in some time.` is acceptable evidence of recorded answers awaiting evaluation; it is not a final score result. |
| 33 | **And** close only the Teacher and Student task CLI sessions after recording results. | Both `geneo-teacher` and `geneo-student` close. Preserve the assessment identity for investigation; do not delete the assessment, end it for the class, or initiate another attempt. |

- **Assertions:**
  - Membership matches before assessment creation.
  - The review contains exactly four questions with the required 2/2/0 difficulty distribution.
  - Assignment success identifies the exact title, class, and deadline.
  - Student sees the same title/ID and Pending status before starting.
  - All four required responses are saved before confirming END TEST.
  - Student displays Assessment Submitted for the captured ID.
  - Teacher records the target Student's four answers within the same assessment; the aggregate submission count supports this finding.
  - Evaluation-in-progress indicators are not mistaken for submission failure or a final score.

- **Edge cases considered:**
  - Cookie dialog absent because consent is already stored.
  - Invalid credentials, mismatched school/class, or target Student missing from current membership evidence: stop and request corrected test data.
  - Class preselected versus an explicit class chooser: verify 8A Science in either path.
  - Insufficient Easy/Medium availability: stop without substitution.
  - Stale start time, invalid end time, or missing audience: inspect actual validation before editing scheduling.
  - Earliest future time elapses before assignment: recheck the UI and adjust the same assessment without creating a duplicate.
  - Delayed Student visibility/submission propagation: bounded state checks using the same identity; report a blocker if it never appears.
  - Shuffled questions and multipart answers: match prompts, not ordinal positions.
  - Submission response is ambiguous: inspect the submitted page and Teacher record before repeating any state-changing action.

## Observed question and response mapping

These are records of the explored attempt, not a fixed expected question bank or score key for future runs.

| Topic of displayed prompt | Teacher review position | Student position | Submitted response summary |
| --- | --- | --- | --- |
| Atomicity and a diatomic example | 1, Easy | 4 | Atomicity is the number of atoms in a molecule; O2 contains two oxygen atoms. |
| Molecule definition and independent existence | 2, Easy | 1 | Smallest independently existing unit retaining a substance's chemical properties; consists of one or more atoms. |
| Ion definition; simple versus polyatomic ions | 3, Medium | 2 | Charged atom/group; Na+ as a simple ion; sulfate SO4 2- as a polyatomic ion. |
| Monoatomic, diatomic, and polyatomic examples | 4, Medium | 3 | He has one atom, O2 two, O3/S8 more than two. |

Teacher displayed the matching full response text for each of these four questions. Final correctness and marks were not evaluated by this plan.

## Stable locator candidates

Apply the AGENTS.md priority: `data-id`, then `data-test-id`, then semantic role/name, label, placeholder, and genuinely static text. The table describes candidates, not generated automation. CLI snapshot refs and CLI-generated CSS suggestions must not be copied into tests. No CSS/XPath fallback is approved by this plan.

| Role / target | Candidate and evidence | Limitations or follow-up |
| --- | --- | --- |
| Both / Accept analytics | Button with accessible name `Accept analytics`, scoped to `Optional analytics cookies` dialog | Role/name observed; data-id/data-test-id were not inspected on this control. Inspect those first before implementation. |
| Both / initial username | Unique textbox role on the username screen | Inspected: no data-id, data-test-id, or aria-label. Recheck uniqueness in the current screen. |
| Both / password and login actions | Password field on the password screen; Next and Start buttons by role/name | Role/name observed for actions; password-field attribute priority and stable scoping require further inspection. Do not select the disabled username field. |
| Student / class membership | Heading role, exact name `8 A`, on Student Profile | Inspected heading: no data-id or data-test-id. |
| Teacher / class selector item | Observed data-id `select subject_page94` for the 8 A Science entry | Data-test-id absent. This index-shaped identifier may change with class order; verify the item's class and subject every run. Long-term stability unverified. |
| Teacher / Assess | data-id `assess` | Inspected; data-test-id absent. |
| Teacher / Create Assessment | data-id `assessment-button` | Inspected; data-test-id absent. |
| Teacher / Homework | Exact static text `Homework`, scoped to the type-selection panel | Inspected clickable container had no data-id or data-test-id. Static-label clickability requires confirmation before implementation. |
| Teacher / Geneo App | Exact static text `Geneo App`, scoped to the conduction panel | Observed label; priority attributes on the target were not inspected. |
| Teacher / chapter and topic | Heading roles with exact observed chapter/topic names, scoped to their selection lists | Clickable containers had no data-id/data-test-id. Inspect the heading targets themselves and verify click propagation; do not use CSS parents. |
| Teacher / Easy and Medium counts | Add and + buttons within the corresponding difficulty group | Easy Add had no data-id/data-test-id. A durable semantic or identifier-based group scope remains unverified; do not use unscoped button order as a stable contract. |
| Teacher / CREATE | Button role, exact name `CREATE` | Inspected: no data-id/data-test-id. Distinguish CREATE CUSTOM HOMEWORK. |
| Teacher / Proceed | Button role, exact name `Proceed` on My Assessment | Role/name observed; priority attributes uninspected. |
| Teacher / assessment name | Title textbox associated visually with Assessment Name | Inspected: no data-id/data-test-id/aria-label; native name taskName observed. A permitted stable scope or accessible label is still needed; native-name CSS is not approved. |
| Teacher / start time | Textbox with placeholder `hh:mm aa`, scoped to Start Date; picker listboxes Select hours, Select minutes, Select meridiem | Start textbox has no data-id/data-test-id. Two time fields share the placeholder; stable Start Date scope requires verification. Picker options include `20 minutes`, `PM`; button `OK`. |
| Teacher / ASSIGN | Button role, exact name `ASSIGN` | Inspected: no data-id/data-test-id. Verify enabled state and absence of relevant validation. |
| Student / Assess | Button role, accessible name `assess-new Assess` | Inspected: no data-id/data-test-id. |
| Student / type filter | Button role `Search by Assessment Type`; option role `Homework` | Filter button has no data-id/data-test-id. Option priority attributes uninspected. |
| Student / exact assessment card | Match shared identity and verify ID on the cover route | Card container had no data-id/data-test-id/role. A permitted stable card identifier or semantic scope is a locator gap; do not substitute dynamic getByText or CSS. |
| Student / start | Button role, exact name `LET'S START` | Inspected: no data-id/data-test-id. |
| Student / typed answer | Unique textbox role on the active question screen | Inspected: no data-id/data-test-id/aria-label/placeholder. Verify uniqueness per displayed question. |
| Student / Next | Button role, exact name `Next` on active question | Observed disabled/enabled behavior; priority attributes uninspected. |
| Student / final END TEST | data-id `delete_yes_button`, scoped to the all-questions-answered confirmation dialog | Inspected; data-test-id absent. Generic identifier is reused in the application, so dialog scope and text verification are essential. |
| Student / submission confirmation | Heading role, exact name `Assessment Submitted` | Inspected: no data-id/data-test-id. `Evaluation in Progress` is genuinely static status text. |
| Teacher / target Student | Heading role with runtime Student display name, within the same assessment's Students section | Clicked row container had no data-id/data-test-id. Verify heading attributes and clickability; handle duplicate names with a stable identity rather than positional selection. |
| Teacher / recorded attempts | Numbered question buttons 1–4; heading `Student's Attempt:`; static evaluation message | Observed roles/text. Priority attributes and a stable scope for response text require inspection. |

## Verified observations, assumptions, and blockers

### Verified observations

- Both cookie acceptance and valid login flows succeeded using existing credentials.
- School/class/subject evidence was checked before creation; the new assessment reached the intended Student.
- One assessment was created and assigned, then submitted once. No duplicate or reattempt was initiated.
- Requested question counts were available and preserved in review.
- Scheduling validation was inspected; the invalid start was corrected through the picker. The successful assignment and Teacher overview confirmed the chosen start/deadline.
- Student found the exact title under the Homework filter and saw Pending before starting.
- The final-answer popup confirmed all questions were answered; END TEST led to Assessment Submitted and Evaluation in Progress.
- Teacher's submission count increased to 1/16, and all four matching responses were visible in the target Student's performance record.
- Both task browser sessions were closed successfully.

### Observed issues and unverified behavior

- **Content mismatch:** Agricultural Practices produced questions about molecules and ions. The cause and intended content mapping are unverified; retain this as a test-data/content issue rather than claiming subject-content correctness.
- **Specific-Student selection:** Selecting Select Specific Students showed no selection list and kept ASSIGN disabled. All Students worked. Cause and target-only assignment behavior are unverified.
- **Time precision:** Five-minute picker options were observed. Direct minute entry and second-level scheduling were not tested; 15:20 is established as the earliest enabled picker choice at the time of selection, not a proven limit of every input method.
- **Timezone:** Host IST and matching UI clock were verified. An explicit application timezone setting or label was not observed.
- **Availability waiting:** The assessment was already available when Student opened it. A pre-start disabled/waiting transition was not exercised. Future runs must use bounded UI-state checks without sleeps.
- **Evaluation:** Evaluation remained in progress. Final marks, correctness, and final graded status were intentionally not awaited or asserted.
- **Locators:** Several controls lack tested identifiers or accessible grouping. Gaps are listed above and must be resolved under AGENTS.md before automation generation; no selector-policy exception is implied.
- **Diagnostics:** Console output included resource and webinar-endpoint errors during navigation. The journey still completed; their relationship to the observed issues was not established.

### Blockers and future implementation prerequisites

- No missing test data or application blocker prevented completion of this explored journey. File-location approval was provided by the user before this plan was saved.
- The inspected `GeneoWorld` exposes a single page/browser context and initializes Teacher LoginPage and HomePage only. Two-role orchestration is not established by this plan. Before later automation work, confirm the cross-application feature/step orchestration location and appropriate isolated context lifecycle while keeping role POMs separate.
- `tests/seed.spec.ts` is a placeholder rather than a substantive environment smoke test. Its presence is not evidence of environment validation.
- This is a Markdown plan based on CLI observation. No Cucumber feature, step definition, page object, compiled test, or automated execution result was produced. Browser exploration must not be reported as a passing automated test.

## Not covered (and why)

- Invalid/empty login, username editing, password-eye behavior, Help & Support, rejected analytics, and mobile checks from the general login planner prompt: outside this requested assessment journey.
- Score correctness, manual grading, final evaluation completion, reporting exports, and reattempts: outside submission-recording scope.
- Other classes, chapters, topics, question counts, conduction modes, or assessment types: the user specified this single journey.
- Successful target-only recipient selection, missing-question branches, scheduling boundary failures, and pre-start waiting: considered in the plan but not successfully exercised during this run.
- Deleting the test assessment or ending it for all recipients: not authorized as cleanup. The assessment remains identified above with its configured end time.
