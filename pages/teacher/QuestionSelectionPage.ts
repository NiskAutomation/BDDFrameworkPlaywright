import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class QuestionSelectionPage extends BasePage {
  readonly easyGroup: Locator;
  readonly mediumGroup: Locator;
  readonly hardGroup: Locator;
  readonly easyCount: Locator;
  readonly mediumCount: Locator;
  readonly createButton: Locator;
  constructor(page: Page) {
    super(page);
    // User approved the parent scope: these difficulty containers have neither
    // identifiers nor semantic group roles. Keep button selection role-based.
    this.easyGroup = page.getByRole('heading', { name: 'Easy', exact: true }).locator('..');
    this.mediumGroup = page.getByRole('heading', { name: 'Medium', exact: true }).locator('..');
    this.hardGroup = page.getByRole('heading', { name: 'Hard', exact: true }).locator('..');
    // The selected count is rendered as plain text within each difficulty group.
    this.easyCount = this.easyGroup.getByText('2', { exact: true });
    this.mediumCount = this.mediumGroup.getByText('2', { exact: true });
    this.createButton = page.getByRole('button', { name: 'CREATE', exact: true });
  }
  async addTwoOfEach(): Promise<void> {
    for (const group of [this.easyGroup, this.mediumGroup]) {
      const add = group.getByRole('button', { name: 'Add', exact: true });
      await add.waitFor({ state: 'visible' });
      await add.click();
      const plus = group.getByRole('button', { name: '+', exact: true });
      await plus.click();
    }
  }
  async create(): Promise<void> { await this.createButton.click(); }
}

