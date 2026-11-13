import { Page, Locator } from '@playwright/test';
import path from 'path';


export class CommonMethods {

 generateRandomAssessmentName(prefix = 'Automation') {
  const now = new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `${prefix}_${date}_${randomNumber}`;
  }

  generateRandomEmail(domain: string): string {
    const timestamp = Date.now();
    return `user${timestamp}@${domain}`;
  }

  generateRandomString(length: number): string {
    let result = '';
    while (result.length < length) {
      result += Math.random().toString(36).substring(2);
    }
    return result.substring(0, length);
  }

  generateRandomNumber(length: number): string {
    let result = '';
    while (result.length < length) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  async waitForPageLoad(
    page: Page,
    timeout: number = 1000): Promise<void> {
    await page.waitForLoadState('domcontentloaded', { timeout });
  }

  async waitForTimeOut(
    page: Page,
    timeout: number = 500): Promise<void> {
    await page.waitForTimeout(timeout);
  } 

   getUploadFilePath(fileName: string): string {
    return path.resolve(
      process.cwd(),
      'tests',
      'data',
      'uploads',
      fileName
    );
  }

  // 🔥 ADD THIS: generic file upload
  async uploadFile(
    fileInput: Locator,
    fileName: string
  ): Promise<void> {
    const filePath = this.getUploadFilePath(fileName);
    await fileInput.setInputFiles(filePath);
  }
}
