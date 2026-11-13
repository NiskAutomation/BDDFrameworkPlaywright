import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export class StudentHomePage extends BasePage {
  readonly assess: Locator;
  readonly profileIcon: Locator;
  readonly profileMenu: Locator;
  readonly logo: Locator;
  constructor(page: Page) {
    super(page);
    this.assess = page.getByRole('button', { name: 'assess-new Assess', exact: true });
    this.profileIcon = page.getByRole('img', { name: 'userBlue', exact: true });
    this.profileMenu = page.getByRole('menuitem', { name: /Profile/ });
    this.logo = page.getByRole('img', { name: 'geneo-logo', exact: true });
  }
  async openProfile(): Promise<void> { await this.profileIcon.click(); await this.profileMenu.click(); }
  async openAssessments(): Promise<void> { await this.logo.click(); await this.assess.click(); }
}

