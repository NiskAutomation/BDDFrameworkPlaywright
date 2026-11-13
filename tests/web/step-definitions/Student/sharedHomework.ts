import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { GeneoWorld } from '../../config/geneoWorld';
import { config } from '../../config/test.config';
import credentials from '../../../../testdata/credentials.json';
import data from '../../../../testdata/assessmentCreation.json';

Given('the Student signs in in a separate browser context', async function (this: GeneoWorld) {
  if (!credentials.studentUserName || !credentials.studentPassword) throw new Error('Missing Student credentials in testdata.');
  await this.studentPage!.goto(config.getStudentUrl());
  try { await this.studentLoginPage.signIn(credentials.studentUserName, credentials.studentPassword); }
  catch { throw new Error('Student sign-in failed. Credential details suppressed.'); }
  await expect(this.studentHomePage.assess).toBeVisible();
});

Then('the Student belongs to the configured class with Science', async function (this: GeneoWorld) {
  await this.studentHomePage.openProfile();
  await expect(this.studentProfilePage.classHeading(data.classSection)).toBeVisible();
  await expect(this.studentProfilePage.content).toContainText(data.subject);
});

When('the Student filters homework and opens the exact shared assessment', async function (this: GeneoWorld) {
  await this.studentHomePage.openAssessments();
  await expect(this.studentAssessmentPage.heading).toBeVisible();
  await this.studentAssessmentPage.filterHomework();
  await expect(this.studentAssessmentPage.card(this.assessmentRun.title)).toHaveCount(1);
});

Then('the Student verifies Pending status or resumes the recorded submission', async function (this: GeneoWorld) {
  const card = this.studentAssessmentPage.card(this.assessmentRun.title);
  if (this.assessmentRun.submitted || await card.getByText('Evaluation in Progress', { exact: true }).isVisible()) {
    if (!this.assessmentRun.pendingVerified) throw new Error('The assessment is already submitted, but no saved Pending observation exists for this run.');
    await expect(card).toContainText('Evaluation in Progress');
    this.assessmentRun.submitted = true;
    this.saveAssessmentRun();
    await this.studentAssessmentPage.open(this.assessmentRun.title);
    return;
  }
  if (await card.getByText('In Progress', { exact: true }).isVisible()) {
    this.assessmentRun.started = true;
    this.saveAssessmentRun();
    await this.studentAssessmentPage.open(this.assessmentRun.title);
    return;
  }
  await expect(card).toContainText('Pending');
  this.assessmentRun.pendingVerified = true;
  this.saveAssessmentRun();
  await this.studentAssessmentPage.open(this.assessmentRun.title);
  await expect(this.studentPage!).toHaveURL(new RegExp('assessmentId=' + this.assessmentRun.id + '(?:&|$)'));
  await expect(this.studentHomeworkCoverPage.title).toHaveText(this.assessmentRun.title);
});

When('the Student answers all four questions and ends the homework',
  // Earliest future picker slot can be five minutes away; bounded web-first checks wait for availability.
  { timeout: 420000 }, async function (this: GeneoWorld) {
  if (this.assessmentRun.submitted) return;
  if (!this.assessmentRun.started) {
    await expect(this.studentHomeworkCoverPage.startButton).toBeEnabled({ timeout: 360000 });
    await this.studentHomeworkCoverPage.start();
  } else {
    await expect(this.studentHomeworkCoverPage.resumeButton).toBeEnabled();
    await this.studentHomeworkCoverPage.resume();
  }
  this.assessmentRun.started = true;
  this.saveAssessmentRun();
  await this.studentHomeworkAttemptPage.answerAll(
    this.assessmentRun.title, this.assessmentRun.answers, data.answers, data.defaultTextAnswer,
    () => this.saveAssessmentRun(),
    this.assessmentRun.responseValues ??= [],
    data.easyQuestions + data.mediumQuestions,
  );
  await expect(this.studentHomeworkAttemptPage.endDialog).toBeVisible();
  await this.studentHomeworkAttemptPage.finish();
});

Then('the Student sees the shared assessment submitted', async function (this: GeneoWorld) {
  if (this.assessmentRun.submitted) {
    await this.studentHomeworkCoverPage.openSubmitted(this.assessmentRun.id!);
    await expect(this.studentSubmittedHomeworkPage.confirmation).toBeVisible();
  } else await expect(this.studentSubmittedHomeworkPage.confirmation).toBeVisible();
  await expect(this.studentPage!).toHaveURL(new RegExp('/submitted-homework\\?assessmentId=' + this.assessmentRun.id + '(?:&|$)'));
  this.assessmentRun.submitted = true;
  this.saveAssessmentRun();
});

