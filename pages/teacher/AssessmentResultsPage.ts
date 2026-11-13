import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class AssessmentResultsPage extends BasePage {
  readonly title: (assessmentName: string) => Locator;
  readonly content: Locator;
  readonly student: (name: string) => Locator;
  readonly assessmentCard: (assessmentName: string) => Locator;
  constructor(page: Page) {
    super(page);
    // The verified route currently renders an h1 literally named "title";
    // the assigned assessment identity is rendered as exact page text instead.
    this.title = assessmentName => page.getByText(assessmentName, { exact: true });
    this.content = page.getByRole('document');
    this.student = name => page.getByRole('heading', { name, exact: true });
    // Teacher's management list renders its dynamic assessment title in an
    // identifier-free span; this exact-text fallback is needed to resume safely.
    this.assessmentCard = assessmentName => page.getByText(assessmentName, { exact: true });
  }
  async refresh(): Promise<void> { await this.page.reload(); }
  async openStudent(name: string): Promise<void> { await this.student(name).click(); }
}

