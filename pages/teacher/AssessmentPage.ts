import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class AssessmentPage extends BasePage {
  readonly classEntry: Locator;
  readonly selectedClass: Locator;
  readonly createButton: Locator;
  readonly typeHeading: Locator;
  private readonly homework: Locator;
  private readonly appMode: Locator;
  private readonly proceed: Locator;
  constructor(page: Page) {
    super(page);
    // Identifier prefix avoids depending on the observed order-dependent suffix 94.
    this.classEntry = page.locator('[data-id^="select subject_page"]')
      .filter({ has: page.getByRole('heading', { name: '8 A', exact: true }) })
      .filter({ hasText: /Science/ });
    this.selectedClass = page.getByRole('heading', { name: '8 A - Science', exact: true });
    // The app reuses this identifier on Create and Choose From Library.
    this.createButton = page.locator('[data-id="assessment-button"]')
      .filter({ has: page.getByRole('heading', { name: 'Create', exact: true }) });
    this.typeHeading = page.getByRole('heading', { name: 'Choose Type of Assessment', exact: true });
    this.homework = page.getByText('Quick Practice for all Topics.', { exact: true });
    this.appMode = page.getByText('Geneo App', { exact: true });
    this.proceed = page.getByRole('button', { name: 'PROCEED', exact: true });
  }
  async selectClass(): Promise<void> { await this.classEntry.click(); }
  async chooseHomework(): Promise<void> {
    await this.createButton.click();
    await this.typeHeading.waitFor({ state: 'visible' });
    await this.homework.click();
    if (await this.appMode.isVisible()) await this.appMode.click();
    await this.proceed.click();
  }
}

