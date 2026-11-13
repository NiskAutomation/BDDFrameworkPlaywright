import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class StudentProfilePage extends BasePage {
  readonly content: Locator;
  readonly classHeading: (name: string) => Locator;
  constructor(page: Page) {
    super(page);
    this.content = page.getByRole('document');
    this.classHeading = name => page.getByRole('heading', { name, exact: true });
  }
}

