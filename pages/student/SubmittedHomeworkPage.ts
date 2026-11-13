import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class SubmittedHomeworkPage extends BasePage {
  readonly confirmation: Locator;
  readonly evaluationInProgress: Locator;

  constructor(page: Page) {
    super(page);
    this.confirmation = page.getByRole('heading', { name: 'Assessment Submitted', exact: true });
    this.evaluationInProgress = page.getByText('Evaluation in Progress', { exact: true });
  }
}
