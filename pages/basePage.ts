import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  getLocator(locator: string): Locator {
    if (
      locator.trim().startsWith('//') ||
      locator.trim().startsWith('/')
    ) {
      return this.page.locator(locator);
    } else if (
      locator.trim().startsWith('#') ||
      locator.trim().startsWith('.') ||
      locator.includes('[') ||
      locator.includes('>') ||
      locator.includes(':') ||
      locator.includes('.')
    ) {
      return this.page.locator(locator);
    } else {
      return this.page.getByText(locator.trim(), { exact: true });
    }
  }
}
