import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class AssessmentReviewPage extends BasePage {
  readonly heading: Locator;
  readonly questions: Locator;
  readonly easyQuestions: Locator;
  readonly mediumQuestions: Locator;
  readonly hardQuestions: Locator;
  private readonly proceed: Locator;
  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'My Assessment', exact: true });
    this.questions = page.getByRole('button').filter({ hasText: /Q\.\s*\d+/ });
    this.easyQuestions = this.questions.filter({ hasText: /\bEasy\b/ });
    this.mediumQuestions = this.questions.filter({ hasText: /\bMedium\b/ });
    this.hardQuestions = this.questions.filter({ hasText: /\bHard\b/ });
    this.proceed = page.getByRole('button', { name: 'Proceed', exact: true });
  }
  async proceedToAssignment(): Promise<void> { await this.proceed.click(); }
}

