import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class HomeworkCoverPage extends BasePage {
  readonly title: Locator;
  readonly startButton: Locator;
  readonly resumeButton: Locator;
  readonly initialSubmissionCount: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { level: 1 });
    this.startButton = page.getByRole('button', { name: "LET'S START", exact: true });
    // Inspected RESUME button has neither data-id nor data-test-id.
    this.resumeButton = page.getByRole('button', { name: 'RESUME', exact: true });
    this.initialSubmissionCount = page.getByRole('heading', { name: '0/4 Submitted', exact: true });
  }

  async start(): Promise<void> {
    await this.startButton.click();
  }

  async resume(): Promise<void> {
    await this.resumeButton.click();
  }

  async openSubmitted(assessmentId: string): Promise<void> {
    const submittedUrl = new URL('submitted-homework?assessmentId=' + encodeURIComponent(assessmentId), this.page.url());
    await this.page.goto(submittedUrl.href);
  }
}
