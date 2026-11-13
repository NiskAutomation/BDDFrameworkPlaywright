import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class StudentPerformancePage extends BasePage {
  readonly content: Locator;
  readonly attemptHeading: Locator;
  readonly questionButton: (number: number) => Locator;
  constructor(page: Page) {
    super(page);
    this.content = page.getByRole('document');
    this.attemptHeading = page.getByRole('heading', { name: "Student's Attempt:", exact: true });
    this.questionButton = number => page.getByRole('button', { name: String(number), exact: true });
  }
  async selectQuestion(number: number): Promise<void> { await this.questionButton(number).click(); }
  async recordedResponseCount(answers: string[][]): Promise<number> {
    const seen = new Set<number>();
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim().toLowerCase();
    for (let number = 1; number <= answers.length; number++) {
      await this.selectQuestion(number);
      await this.attemptHeading.waitFor({ state: 'visible' });
      const rendered = await this.content.innerText();
      const marker = rendered.lastIndexOf("Student's Attempt:");
      if (marker < 0) continue;
      // Restrict matching to the submitted attempt, excluding question options
      // and model answers that may otherwise produce false positives.
      const attempt = normalize(rendered.slice(marker + "Student's Attempt:".length));
      const match = answers.findIndex((values, index) => !seen.has(index) && values.length > 0 &&
        values.every(value => value.trim().length > 0 && attempt.includes(normalize(value))));
      if (match >= 0) seen.add(match);
    }
    return seen.size;
  }
  async nonEmptyResponseCount(): Promise<number> {
    let recorded = 0;
    for (let number = 1; number <= 4; number++) {
      await this.selectQuestion(number);
      await this.attemptHeading.waitFor({ state: 'visible' });
      const rendered = await this.content.innerText();
      const marker = rendered.lastIndexOf("Student's Attempt:");
      if (marker >= 0 && rendered.slice(marker + "Student's Attempt:".length).trim().length > 0) recorded++;
    }
    return recorded;
  }
}

