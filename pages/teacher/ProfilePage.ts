import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class TeacherProfilePage extends BasePage {
  readonly content: Locator;
  private readonly profileIcon: Locator;
  private readonly profileMenu: Locator;
  private readonly logo: Locator;
  constructor(page: Page) {
    super(page);
    this.content = page.getByRole('document');
    this.profileIcon = page.getByRole('img', { name: 'userBlue', exact: true });
    this.profileMenu = page.getByRole('menuitem', { name: /Profile/ });
    this.logo = page.getByRole('img', { name: 'geneo-logo', exact: true });
  }
  async open(): Promise<void> { await this.profileIcon.click(); await this.profileMenu.click(); }
  async returnHome(): Promise<void> { await this.logo.click(); }
}

