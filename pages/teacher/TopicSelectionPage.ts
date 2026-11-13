import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class TopicSelectionPage extends BasePage {
  readonly heading: Locator;
  readonly firstTopic: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Choose a Topic', exact: true });
    // First topic is an explicit requirement; do not substitute another topic on failure.
    this.firstTopic = page.getByRole('heading', { level: 3 }).filter({ hasText: /^\d+\.\d+/ }).first();
  }

  async selectFirstTopic(): Promise<void> {
    await this.firstTopic.click();
  }
}
