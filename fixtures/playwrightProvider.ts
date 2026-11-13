import { Driver } from './fixtures';
import { BasePage } from '../pages/basePage';
import { Locator } from 'playwright';

export class PlaywrightProvider extends BasePage implements Driver {

  async select(locator: Locator, value: string) {
    await locator.selectOption(value);
  }

  async selectCustomDropdown(dropdown: Locator, optionValue: Locator): Promise<void> {
    await dropdown.click();
    await optionValue.click();
  }

  async type(locator: Locator, value: any) {
    await locator.fill(value);
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async hover(locator: Locator) {
    await locator.hover();
  }

  async doubleClick(locator: Locator) {
    await locator.dblclick();
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async dialogAccept(): Promise<void> {
    this.page.on('dialog', async dialog => {
      await dialog.accept();
    });
  }

  async getSelectOptions(locator: Locator): Promise<string[]> {
    const texts = await locator.allTextContents();
    return texts.map(t => t.trim()).filter(t => t.length > 0);
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async isVisible(locator: Locator, timeout: number = 30000): Promise<boolean> {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  }

  async notVisible(locator: Locator, timeout: number = 30000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'detached', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async isEnabled(locator: Locator, timeout: number = 30000): Promise<boolean> {
    return await locator.isEnabled({ timeout });
  }

   async isDisabled(locator: Locator, timeout: number = 30000): Promise<boolean> {
    return await locator.isDisabled({ timeout });
  }

  async getText(locator: Locator, timeout: number = 30000): Promise<string> {
    const text = await locator.innerText({ timeout });
    return text || '';
  }

  async isChecked(locator: Locator, timeout: number = 30000): Promise<boolean> {
    return await locator.isChecked({ timeout });
  }

  async isUnchecked(locator: Locator, timeout: number = 30000): Promise<boolean> {
    return !(await locator.isChecked({ timeout }));
  }

  async getElementCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  async refreshPage(): Promise<void> {
    await this.page.reload();
  }

  async verifyTableHeaders(
    locator: Locator,
    expectedHeaders: string[]
  ): Promise<boolean> {
    try {
      await locator.first().waitFor({ state: 'visible', timeout: 30000 });
    } catch {
      console.log('ERROR: Table headers not found or not visible');
      return false;
    }

    const headers = await locator.allTextContents();

    for (let i = 0; i < expectedHeaders.length; i++) {
      const actualHeader = headers[i]?.replace(/\s+/g, ' ').trim();
      const expectedHeader = expectedHeaders[i].replace(/\s+/g, ' ').trim();

      console.log(`Actual Header: "${actualHeader}", Expected Header: "${expectedHeader}"`);

      if (actualHeader !== expectedHeader) {
        return false;
      }
    }
    return true;
  }

  async handleDownload(downloadLocator: Locator, filePath: string): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      downloadLocator.click(),
    ]);
    await download.saveAs(filePath + download.suggestedFilename());
  }

  async handleUpload(fileInputLocator: Locator, filePath: string): Promise<void> {
    await fileInputLocator.setInputFiles(filePath);
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
