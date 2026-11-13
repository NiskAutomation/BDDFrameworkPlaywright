import { Locator, Page } from 'playwright';
import { expect } from '@playwright/test';
import { Driver } from '../fixtures/fixtures';
import { count } from 'console';

export class SoftAssertions {
  private errors: string[] = [];
  private screenshots: Buffer[] = [];

  constructor(private driver: Driver, private page?: Page) {}

  async assert(condition: boolean, message: string): Promise<void> {
    if (!condition) {
      this.errors.push(message);
      console.error(`Soft Assertion Failed: ${message}`);

      if (this.page) {
        try {
          const screenshot = await this.page.screenshot({ fullPage: true });
          this.screenshots.push(screenshot);
        } catch (error: any) {
          console.error(`Failed to capture screenshot: ${error.message}`);
        }
      }
    }
  }

//   async assertTableHeaders(locator: Locator, expectedHeaders: any): Promise<void> {
//     try {
//       const result = await this.driver.verifyTableheaders(locator, expectedHeaders);
//       await this.assert(result, 'Table headers should match expected headers');
//     } catch (error: any) {
//       await this.assert(false, `Table headers verification failed: ${error.message}`);
//     }
//   }

  async assertElementVisible(locator: Locator, message?: string): Promise<void> {
    try {
      const isVisible = await this.driver.isVisible(locator);
      await this.assert(isVisible, message || `Element "${locator}" should be visible`);
    } catch (error: any) {
      await this.assert(false, message || `Element "${locator}" should be visible - ${error.message}`);
    }
  }

  async assertElementNotVisible(locator: Locator, message?: string): Promise<void> {
    const isVisible = await this.driver.notVisible(locator);
    await this.assert(isVisible, message || `Element "${locator}" should not be visible`);
  }

  async assertElementEnabled(locator: Locator, message?: string): Promise<void> {
    const isEnabled = await this.driver.isEnabled(locator);
    await this.assert(isEnabled, message || `Element "${locator}" should be enabled`);
  }

  async assertElementDisabled(locator: Locator, message?: string): Promise<void> {
    const isEnabled = await this.driver.isEnabled(locator);
    await this.assert(!isEnabled, message || `Element "${locator}" should be disabled`);
  }

  async assertElementText(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    const actualText = await this.driver.getText(locator);
    await this.assert(
      actualText === expectedText,
      message || `Element "${locator}" text should be "${expectedText}"`
    );
  }

  async assertElementContainsText(
    locator: Locator,
    expectedText: string,
    message?: string
  ): Promise<void> {
    const actualText = await this.driver.getText(locator);
    await this.assert(
      actualText.includes(expectedText),
      message || `Element "${locator}" should contain "${expectedText}"`
    );
  }

  async assertElementChecked(locator: Locator, message?: string): Promise<void> {
    const isChecked = await this.driver.isChecked(locator);
    await this.assert(isChecked, message || `Element "${locator}" should be checked`);
  }

  async assertElementNotChecked(locator: Locator, message?: string): Promise<void> {
    const isChecked = await this.driver.isChecked(locator);
    await this.assert(!isChecked, message || `Element "${locator}" should not be checked`);
  }

  async assertElementCount(
    locator: Locator,
    expectedCount: number,
    message?: string
  ): Promise<void> {
    const actualCount = await this.driver.getElementCount(locator);
    await this.assert(
      actualCount === expectedCount,
      message || `Expected ${expectedCount}, found ${actualCount}`
    );
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getScreenshots(): Buffer[] {
    return this.screenshots;
  }

    assertAll(customMessage?: string): void {
  if (this.hasErrors()) {
    const errorMessage =
      customMessage || `${this.errors.length} soft assertion(s) failed:`;

    const fullMessage =
      `${errorMessage}\n` +
      this.errors
        .map((e, i) => `${i + 1}. ${e}`)
        .join('\n');

    this.errors = [];
    throw new Error(fullMessage);
  } else {
    console.log('All soft assertions passed!');
  }}

  async assertCountGreaterThanZero(
    locator: Locator,
    timeout: number = 10000) {
    try {
    await locator.first().waitFor({ state: 'visible', timeout });
    const count = await locator.count();
    expect.soft(count, `Expected element count to be > 0, but found ${count}`).toBeGreaterThan(0);
    } catch (error) {
    expect.soft(false, `Element was not found or not visible within ${timeout}ms`).toBe(true);
    }}

  async assertNumberEquality(actual: number,expected: number,message: string): Promise<void> {
    try {console.log(`=> Asserting: ${message}`);
    expect.soft(actual).toBe(expected);}
    catch (error) {
    console.error(`=> Assertion Failed: ${message} | Actual: ${actual}, Expected: ${expected}`,error);
    throw error;
    }}

  async assertGreaterThan(actual: number, expected: number, message?: string): Promise<void> {
    try {
      console.log(`=> Asserting: ${message || `Expected ${actual} > ${expected}`}`);
      expect.soft(actual).toBeGreaterThan(expected);
    } catch (error) {
      const errorMsg = message || `Expected ${actual} to be greater than ${expected}`;
      console.error(`=> Assertion Failed: ${errorMsg} | Actual: ${actual}, Expected: ${expected}`, error);
      throw new Error(errorMsg);
    }
  }

  async assertLessThan(actual: number, expected: number, message?: string): Promise<void> {
    try {
      console.log(`=> Asserting: ${message || `Expected ${actual} < ${expected}`}`);
      expect.soft(actual).toBeLessThan(expected);
    } catch (error) {
      const errorMsg = message || `Expected ${actual} to be less than ${expected}`;
      console.error(`=> Assertion Failed: ${errorMsg} | Actual: ${actual}, Expected: ${expected}`, error);
      throw new Error(errorMsg);
    }
  }

  async assertGreaterThanOrEqual(actual: number, expected: number, message?: string): Promise<void> {
    try {
      console.log(`=> Asserting: ${message || `Expected ${actual} >= ${expected}`}`);
      expect.soft(actual).toBeGreaterThanOrEqual(expected);
    } catch (error) {
      const errorMsg = message || `Expected ${actual} to be greater than or equal to ${expected}`;
      console.error(`=> Assertion Failed: ${errorMsg} | Actual: ${actual}, Expected: ${expected}`, error);
      throw new Error(errorMsg);
    }
  }

  async assertLessThanOrEqual(actual: number, expected: number, message?: string): Promise<void> {
    try {
      console.log(`=> Asserting: ${message || `Expected ${actual} <= ${expected}`}`);
      expect.soft(actual).toBeLessThanOrEqual(expected);
    } catch (error) {
      const errorMsg = message || `Expected ${actual} to be less than or equal to ${expected}`;
      console.error(`=> Assertion Failed: ${errorMsg} | Actual: ${actual}, Expected: ${expected}`, error);
      throw new Error(errorMsg);
    }
  }

 async assertTextEquals(actualText: string, expectedText: string) {
    if (!actualText) {
        throw new Error(`Actual text is null or undefined`);
    }

    const formattedActual = actualText.trim();
    const formattedExpected = expectedText.trim();

    if (formattedActual !== formattedExpected) {
        throw new Error(
            `Text mismatch.\nExpected: "${formattedExpected}"\nActual: "${formattedActual}"`
        );
    }
}

async getElementText(elementLocator: Locator): Promise<string> {
    try {
        await elementLocator.waitFor({ timeout: 10000 });

        const text = await elementLocator.innerText();

        return text.replace(/\s+/g, ' ').trim();

    } catch (error: any) {
        throw new Error(`Unable to fetch text from element: ${error.message}`);
    }
}




}