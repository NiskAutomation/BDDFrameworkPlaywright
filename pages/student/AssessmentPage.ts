import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class StudentAssessmentPage extends BasePage {
  readonly heading: Locator;
  readonly card: (title: string) => Locator;
  private readonly typeFilter: Locator;
  private readonly homeworkOption: Locator;
  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Your Assessments', exact: true });
    // CLI inspection: stage renders an unnamed combobox with this static prompt
    // and no data-id/data-test-id; other deployments render a named button.
    this.typeFilter = page.getByRole('combobox').filter({ hasText: 'Search by Assessment Type' })
      .or(page.getByRole('button', { name: 'Search by Assessment Type', exact: true }));
    this.homeworkOption = page.getByRole('option', { name: 'Homework', exact: true });
    this.card = title => {
      const exactTitle = new RegExp('^' + title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
      // Explicitly approved CSS scopes: title and card have no identifier/role.
      // Inspected markup; avoid generated classes and positional card selection.
      const titleElement = page.locator('span').filter({ hasText: exactTitle });
      return page.locator('div:has(> div > img[alt=chapter1])').filter({ has: titleElement });
    };
  }
  async filterHomework(): Promise<void> { await this.typeFilter.click(); await this.homeworkOption.click(); }
  async open(title: string): Promise<void> { await this.card(title).click(); }
}

