import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class ChapterSelectionPage extends BasePage {
  readonly heading: Locator;
  readonly firstChapter: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Choose Chapter to Create Homework', exact: true });
    // The scenario explicitly requires the first displayed chapter, not a fixed chapter ID.
    this.firstChapter = page.getByRole('heading', { level: 4 }).filter({ hasText: /^\d+\.\s/ }).first();
  }

  async selectFirstChapter(): Promise<void> {
    await this.firstChapter.click();
  }
}
