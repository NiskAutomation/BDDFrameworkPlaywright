import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class StudentLoginPage extends BasePage {
  readonly acceptAnalyticsButton: Locator;
  readonly usernameInput: Locator;
  readonly nextButton: Locator;
  readonly passwordInput: Locator;
  readonly startButton: Locator;

  constructor(page: Page) {
    super(page);
    this.acceptAnalyticsButton = page.getByRole('dialog', { name: 'Optional analytics cookies' })
      .getByRole('button', { name: 'Accept analytics', exact: true });
    this.usernameInput = page.getByRole('textbox', { disabled: false });
    this.nextButton = page.getByRole('button', { name: 'Next', exact: true });
    // CLI verified: no data-id/data-test-id. The installed Playwright exposes
    // the password as a textbox; disabled:false excludes the username display.
    // This resolves uniquely, so the approved CSS fallback is unnecessary.
    this.passwordInput = page.getByRole('textbox', { disabled: false });
    this.startButton = page.getByRole('button', { name: 'Start', exact: true });
  }

  async acceptCookiesIfShown(): Promise<void> {
    if (await this.acceptAnalyticsButton.isVisible()) {
      await this.acceptAnalyticsButton.click();
    }
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.acceptCookiesIfShown();
    await this.usernameInput.fill(username);
    await this.nextButton.click();
    await this.startButton.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    await this.startButton.click();
  }
}
