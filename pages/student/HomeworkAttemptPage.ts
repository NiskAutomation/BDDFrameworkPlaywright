import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';
export class HomeworkAttemptPage extends BasePage {
  readonly content: Locator;
  readonly answer: Locator;
  readonly selectableAnswer: Locator;
  private readonly options: Locator;
  private readonly radios: Locator;
  private readonly checkboxes: Locator;
  private readonly questionType: Locator;
  readonly next: Locator;
  readonly endDialog: Locator;
  readonly endTest: Locator;
  readonly completed: Locator;
  private readonly openEndDialog: Locator;
  readonly questionButton: (number: number) => Locator;
  private readonly activeQuestion: (number: number) => Locator;
  constructor(page: Page) {
    super(page);
    this.content = page.getByRole('document');
    this.answer = page.getByRole('textbox', { disabled: false });
    this.selectableAnswer = page.getByRole('radio', { disabled: false })
      .or(page.getByRole('checkbox', { disabled: false }));
    this.options = page.locator('[data-id^="option_"]');
    this.radios = page.getByRole('radio', { disabled: false });
    this.checkboxes = page.getByRole('checkbox', { disabled: false });
    this.questionType = page.getByRole('heading', { level: 4 });
    this.next = page.getByRole('button', { name: 'Next', exact: true });
    this.endDialog = page.getByRole('dialog').filter({ hasText: 'You have answered all the questions.' });
    this.endTest = this.endDialog.locator('[data-id="delete_yes_button"]');
    this.completed = page.getByRole('heading', { name: '100%', exact: true });
    this.openEndDialog = page.getByRole('button', { name: 'End Test', exact: true });
    this.questionButton = number => page.getByRole('button', { name: String(number), exact: true });
    // Inspected numbered buttons have no data-id/data-test-id. The active
    // question is disabled, including after Next advances automatically.
    this.activeQuestion = number => page.getByRole('button', {
      name: String(number), exact: true, disabled: true,
    });
  }
  async selectQuestion(number: number): Promise<void> { await this.questionButton(number).click(); }
  async answerQuestion(text: string): Promise<void> { await this.answer.fill(text); await this.next.click(); }
  async finish(): Promise<void> { await this.endTest.click(); }
  async answerAll(
    title: string,
    answers: string[],
    bank: { questionIncludes: string; text: string }[],
    defaultAnswer: string,
    save: () => void,
    responseValues: string[][],
    questionCount: number,
  ): Promise<void> {
    for (let number = 1; number <= questionCount; number++) {
      // Start/Resume opens question 1; each answer advances to the next question.
      // Wait for the active state: clicking during initial rendering can race
      // with the app disabling the current question button.
      await this.activeQuestion(number).waitFor({ state: 'visible' });
      await this.answer.or(this.selectableAnswer).or(this.options).first().waitFor({ state: 'visible' });
      const type = (await this.questionType.innerText()).trim();
      const questionText = await this.content.innerText();
      const matching = bank.find(item => questionText.toLowerCase().includes(item.questionIncludes.toLowerCase()));
      const response = responseValues[number - 1]?.[0] ||
        (matching?.text || defaultAnswer) + ' Response ' + number + ' for ' + title + '.';
      const record = (values: string[]) => {
        if (values.some(value => !value.trim())) throw new Error(`Question ${number} has an empty answer label.`);
        responseValues[number - 1] = values;
        answers[number - 1] = values.join('\n');
        save(); // Save the actual response before a selection can auto-advance.
      };
      if (await this.options.count()) {
        const multiple = /multi|multiple/i.test(type);
        const candidates: Locator[] = [];
        for (let index = 0; index < await this.options.count(); index++) {
          const option = this.options.nth(index);
          if (await option.isEnabled()) candidates.push(option);
        }
        const chosen = candidates.slice(0, multiple ? 2 : 1);
        if (!chosen.length) throw new Error(`Question ${number} (${type}) has no enabled choices.`);
        record(await Promise.all(chosen.map(option => option.innerText())));
        for (const option of chosen) await option.click();
      } else if (await this.checkboxes.count() || await this.radios.count()) {
        const multiple = await this.checkboxes.count() > 0;
        const controls = multiple ? this.checkboxes : this.radios;
        const count = Math.min(await controls.count(), multiple ? 2 : 1);
        const values: string[] = [];
        for (let index = 0; index < count; index++) {
          const control = controls.nth(index);
          const snapshot = await control.ariaSnapshot();
          const label = snapshot.match(/(?:radio|checkbox) "(.*?)"/)?.[1];
          if (!label) throw new Error(`Question ${number} has an unnamed choice control.`);
          values.push(label);
        }
        record(values);
        for (let index = 0; index < await controls.count(); index++) {
          if (multiple) await controls.nth(index).setChecked(index < count);
          else { await controls.first().check(); break; }
        }
      } else {
        // All blanks are filled; very short, short and long answers use the same
        // textbox contract (including accessible rich-text editors).
        const fields = this.answer;
        const fieldCount = await fields.count();
        if (!fieldCount) throw new Error(`Unsupported question ${number} (${type}): no answer controls.`);
        const values = Array.from({ length: fieldCount }, (_, index) =>
          /fill|blank/i.test(type) ? `answer${index + 1}` : response);
        record(values);
        for (let field = 0; field < fieldCount; field++) await fields.nth(field).fill(values[field]);
      }
      // MCQ Single and True/False auto-advance on selection in stage. Text and
      // multi-choice questions expose Next. Wait for either transition.
      const destination = number < questionCount ? this.activeQuestion(number + 1) : this.completed.or(this.endDialog);
      await this.next.or(destination).first().waitFor({ state: 'visible' });
      if (await this.next.isVisible()) await this.next.click();
      await destination.waitFor({ state: 'visible' });
    }
    // Re-answering a saved final question may leave the attempt open instead of
    // reopening the confirmation automatically. Never submit a partial attempt.
    if (!(await this.endDialog.isVisible())) {
      await this.completed.waitFor({ state: 'visible' });
      await this.openEndDialog.click();
    }
  }
}

