import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';

export class LoginPage extends BasePage {
  readonly cookieDialog: Locator;
  readonly rejectAnalyticsButton: Locator;
  readonly acceptAnalyticsButton: Locator;
  readonly usernameInput: Locator;
  readonly nextButton: Locator;
  readonly passwordInput: Locator;
  readonly startButton: Locator;
  readonly editUsernameButton: Locator;
  readonly togglePasswordVisibilityButton: Locator;
  readonly helpAndSupportButton: Locator;
  readonly usernameValidationError: Locator;
  readonly invalidUsernameError: Locator;

  constructor(page: Page) {
    super(page);
    // Locator Priority: data-id > getByRole > getByLabel > getByTestId
    this.cookieDialog = this.page.getByRole('dialog');
    this.rejectAnalyticsButton = this.page.getByRole('button', { name: 'Reject analytics' });
    this.acceptAnalyticsButton = this.page.getByRole('button', { name: 'Accept analytics' });
    this.usernameInput = this.page.getByRole('textbox');
    this.nextButton = this.getLocator('[data-id="Next"]');
    this.passwordInput = this.getLocator('[data-id="password"]');
    this.startButton = this.getLocator('[data-id="Start"]');
    this.editUsernameButton = this.getLocator('[data-id="Edit"]');
    this.togglePasswordVisibilityButton = this.page.getByRole('button', { name: 'toggle password visibility' });
    this.helpAndSupportButton = this.getLocator('[data-id="Help & Support"]');
    this.usernameValidationError = this.page.getByRole('heading', { name: 'Please enter a valid username, phone number, or email.*' });
    this.invalidUsernameError = this.page.getByRole('heading', { name: 'Invalid username*' });
  }

  async clickRejectAnalytics(): Promise<void> {
    await this.rejectAnalyticsButton.click();
  }

  async clickAcceptAnalytics(): Promise<void> {
    await this.acceptAnalyticsButton.click();
  }

  async handleCookiesIfPresent(): Promise<void> {
    try {
      if (await this.acceptAnalyticsButton.isVisible()) {
        await this.acceptAnalyticsButton.click();
      }
    } catch {
      // Ignore if banner is not displayed
    }
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickStart(): Promise<void> {
    await this.startButton.click();
  }

  async clickEditUsername(): Promise<void> {
    await this.editUsernameButton.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.togglePasswordVisibilityButton.click();
  }

  async clickHelpAndSupport(): Promise<void> {
    await this.helpAndSupportButton.click();
  }

  async getAmplitudeAnalyticsConsent(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem('amplitudeAnalyticsConsent'));
  }
}
