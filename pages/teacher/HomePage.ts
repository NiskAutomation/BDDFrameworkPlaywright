import { Page, Locator } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomePage extends BasePage {
  readonly userProfile: Locator;
  readonly chooseClassSubjectButton: Locator;
  readonly teachButton: Locator;
  readonly assessButton: Locator;
  readonly analysisButton: Locator;
  readonly laboratoryButton: Locator;

  constructor(page: Page) {
    super(page);
    // Locator Priority: data-id > getByRole > getByLabel > getByTestId
    this.userProfile = this.page.getByText('Teacher Admin');
    this.chooseClassSubjectButton = this.page.getByRole('button', { name: /Choose Class & Subject/i });
    this.teachButton = this.page.getByRole('button', { name: /Teach/i });
    this.assessButton = this.page.locator('[data-id="assess"]');
    this.analysisButton = this.page.getByRole('button', { name: /Analysis/i });
    this.laboratoryButton = this.page.getByRole('button', { name: /Laboratory/i });
  }

  async clickChooseClassAndSubject(): Promise<void> {
    await this.chooseClassSubjectButton.click();
  }

  async clickTeach(): Promise<void> {
    await this.teachButton.click();
  }

  async clickAssess(): Promise<void> {
    await this.assessButton.click();
  }
}
