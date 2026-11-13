import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class AssessmentConfirmationPage extends BasePage {
  readonly confirmation: Locator;
  readonly goToAssessmentButton: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmation = page.getByRole('heading', { name: 'Assessment Successfully Assigned', exact: true });
    this.goToAssessmentButton = page.getByRole('button', { name: 'Go To Assessment', exact: true });
  }

  async openAssessment(): Promise<void> {
    await this.goToAssessmentButton.click();
  }
}
