import { Given, When, Then } from '@cucumber/cucumber';
import { GeneoWorld } from '../../config/geneoWorld';
import { config } from '../../config/test.config';
import * as testdata from '../../../../testdata/credentials.json';
import { expect } from '@playwright/test';

Given('Teacher navigates to the teacher login page', async function (this: GeneoWorld) {
  await this.driver.goto(config.getTeacherUrl());
});

Given('Teacher accepts analytics cookies if prompted', async function (this: GeneoWorld) {
  await this.loginPage.handleCookiesIfPresent();
});

Then('The optional analytics cookies dialog should be visible', async function (this: GeneoWorld) {
  await expect(this.loginPage.cookieDialog).toBeVisible();
});

When('Teacher clicks on reject analytics button', async function (this: GeneoWorld) {
  await this.loginPage.clickRejectAnalytics();
});

When('Teacher clicks on accept analytics button', async function (this: GeneoWorld) {
  await this.loginPage.clickAcceptAnalytics();
});

Then('The optional analytics cookies dialog should no longer be visible', async function (this: GeneoWorld) {
  await expect(this.loginPage.cookieDialog).not.toBeVisible();
});

Then('Local storage item {string} should be set to {string}', async function (this: GeneoWorld, key: string, expectedValue: string) {
  const actualValue = await this.loginPage.getAmplitudeAnalyticsConsent();
  expect(actualValue).toBe(expectedValue);
});

Then('The username input field should be enabled', async function (this: GeneoWorld) {
  await expect(this.loginPage.usernameInput).toBeEnabled();
});

Then('The Next button should be visible', async function (this: GeneoWorld) {
  await expect(this.loginPage.nextButton).toBeVisible();
});

Then('The Next button should be disabled', async function (this: GeneoWorld) {
  await expect(this.loginPage.nextButton).toBeDisabled();
});

When('Teacher enters whitespace into the username field', async function (this: GeneoWorld) {
  await this.loginPage.enterUsername('   ');
});

When('Teacher enters username {string}', async function (this: GeneoWorld, username: string) {
  await this.loginPage.enterUsername(username);
});

When('Teacher clicks on next button', async function (this: GeneoWorld) {
  await this.loginPage.clickNext();
});

Then('Validation error {string} should be displayed', async function (this: GeneoWorld, errorMessage: string) {
  await expect(this.loginPage.usernameValidationError).toBeVisible();
  await expect(this.loginPage.usernameValidationError).toHaveText(errorMessage);
});

Then('Error message {string} should be displayed', async function (this: GeneoWorld, errorMessage: string) {
  await expect(this.loginPage.invalidUsernameError).toBeVisible();
  await expect(this.loginPage.invalidUsernameError).toHaveText(errorMessage);
});

Then('Teacher should remain on the login UID screen', async function (this: GeneoWorld) {
  expect(this.page!.url()).toContain('/enter-uid');
  await expect(this.loginPage.usernameInput).toBeVisible();
});
