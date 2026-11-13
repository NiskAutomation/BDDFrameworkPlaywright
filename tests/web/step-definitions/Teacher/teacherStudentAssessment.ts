import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { GeneoWorld } from '../../config/geneoWorld';
import { config } from '../../config/test.config';
import credentials from '../../../../testdata/credentials.json';
import data from '../../../../testdata/assessmentCreation.json';

Given('the Teacher signs in for the shared homework journey', async function (this: GeneoWorld) {
  if (!credentials.teacherUserName || !credentials.teacherPassword) throw new Error('Missing Teacher credentials in testdata.');
  await this.driver.goto(config.getTeacherUrl());
  try {
    await this.loginPage.handleCookiesIfPresent();
    await this.loginPage.enterUsername(credentials.teacherUserName);
    await this.loginPage.clickNext();
    await this.loginPage.enterPassword(credentials.teacherPassword);
    await this.loginPage.clickStart();
  } catch {
    throw new Error('Teacher sign-in failed. Credential details suppressed.');
  }
  await expect(this.homePage.chooseClassSubjectButton).toBeVisible();
});

Then('the Teacher selects 8A Science', async function (this: GeneoWorld) {
  await this.homePage.clickChooseClassAndSubject();
  await expect(this.teacherAssessmentPage.classEntry).toHaveCount(1);
  await this.teacherAssessmentPage.selectClass();
  await expect(this.teacherAssessmentPage.selectedClass).toBeVisible();
});

When('the Teacher chooses Homework through Geneo App', async function (this: GeneoWorld) {
  if (this.assessmentRun.id) return; // Resume the same assigned run, never create a second assessment.
  await this.homePage.clickAssess();
  await this.teacherAssessmentPage.chooseHomework();
  await expect(this.teacherChapterSelectionPage.heading).toBeVisible();
});

When('the Teacher selects the first chapter and its first topic', async function (this: GeneoWorld) {
  if (this.assessmentRun.id) return;
  this.assessmentRun.chapter = (await this.teacherChapterSelectionPage.firstChapter.innerText()).trim();
  await this.teacherChapterSelectionPage.selectFirstChapter();
  await expect(this.teacherTopicSelectionPage.heading).toBeVisible();
  this.assessmentRun.topic = (await this.teacherTopicSelectionPage.firstTopic.innerText()).trim();
  this.saveAssessmentRun();
  await this.teacherTopicSelectionPage.selectFirstTopic();
});

When('the Teacher adds exactly two Easy and two Medium questions', async function (this: GeneoWorld) {
  if (this.assessmentRun.id) return;
  await this.teacherQuestionSelectionPage.addTwoOfEach();
  await expect(this.teacherQuestionSelectionPage.easyCount).toHaveText('2');
  await expect(this.teacherQuestionSelectionPage.mediumCount).toHaveText('2');
  await expect(this.teacherQuestionSelectionPage.hardGroup.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
  await this.teacherQuestionSelectionPage.create();
});

Then('the Teacher reviews exactly four questions with the required difficulty distribution', async function (this: GeneoWorld) {
  if (this.assessmentRun.id) return;
  await expect(this.teacherAssessmentReviewPage.heading).toBeVisible();
  await expect(this.teacherAssessmentReviewPage.questions).toHaveCount(data.easyQuestions + data.mediumQuestions);
  await this.teacherAssessmentReviewPage.proceedToAssignment();
});

When('the Teacher names and assigns the shared homework with valid scheduling', async function (this: GeneoWorld) {
  if (this.assessmentRun.resumed) {
    await this.page!.goto(new URL('homework-manage', config.getTeacherUrl()).href);
    await expect(this.teacherResultsPage.assessmentCard(this.assessmentRun.title)).toBeVisible();
    return;
  }
  const form = this.teacherAssignmentPage;
  await expect(form.heading).toBeVisible();
  await form.enterTitle(this.assessmentRun.title);
  await expect(form.titleInput).toHaveValue(this.assessmentRun.title);
  await expect(form.allStudents).toBeChecked();
  await expect(form.content).toContainText('Class 8A | Science');
  await form.resolveInvalidStart(data.timezone);
  await expect(form.assignButton).toBeEnabled();
  this.assessmentRun.schedule = await form.readSchedule(data.timezone);
  // Write before the irreversible click. An ambiguous response blocks recreation.
  this.assessmentRun.assignmentAttempted = true;
  this.saveAssessmentRun();
  await form.assign();
  await this.page!.waitForURL(/\/assessment-congratulations\/\d+/);
  this.assessmentRun.id = new URL(this.page!.url()).pathname.split('/').pop()!;
  this.saveAssessmentRun();
});

Then('the Teacher sees successful assignment and records its identity', async function (this: GeneoWorld) {
  if (!this.assessmentRun.resumed) {
    await expect(this.teacherAssessmentConfirmationPage.confirmation).toBeVisible();
    await expect(this.teacherAssessmentConfirmationPage.confirmation).toContainText('Assessment Successfully Assigned');
    await expect(this.page!).toHaveURL(/\/assessment-congratulations\/\d+/);
    await this.teacherAssessmentConfirmationPage.openAssessment();
  } else {
    await this.teacherResultsPage.assessmentCard(this.assessmentRun.title).click();
  }
  await expect(this.teacherResultsPage.title(this.assessmentRun.title)).toBeVisible();
  await expect(this.teacherResultsPage.content).toContainText(this.assessmentRun.topic!);
});

Then('the Teacher verifies all four responses in the target student\'s submission', async function (this: GeneoWorld) {
  await this.teacherResultsPage.refresh();
  await expect(this.teacherResultsPage.title(this.assessmentRun.title)).toBeVisible();
  try {
    await expect(this.teacherResultsPage.student(credentials.studentUserName)).toBeVisible();
    await this.teacherResultsPage.openStudent(credentials.studentUserName);
  } catch {
    throw new Error('Target Student was not available in the shared assessment roster. Identity suppressed.');
  }
  // Poll rendered responses: this tolerates submission propagation and question shuffling.
  await expect.poll(
    () => this.assessmentRun.answers.length
      ? this.teacherStudentPerformancePage.recordedResponseCount(
        this.assessmentRun.responseValues ?? this.assessmentRun.answers.map(answer => [answer]))
      : this.teacherStudentPerformancePage.nonEmptyResponseCount(),
    { timeout: 30000, message: 'Teacher must record four nonempty Student responses' },
  ).toBe(4);
  this.assessmentRun.verified = true;
  this.saveAssessmentRun();
});

