import { Locator, Page } from '@playwright/test';
import { BasePage } from '../basePage';

export interface AssessmentSchedule {
  startDate: string; startTime: string; endDate: string; endTime: string; timezone: string;
}

export class AssessmentAssignmentPage extends BasePage {
  readonly heading: Locator;
  readonly content: Locator;
  readonly titleInput: Locator;
  readonly startDate: Locator;
  readonly endDate: Locator;
  readonly startTime: Locator;
  readonly endTime: Locator;
  readonly allStudents: Locator;
  readonly section: Locator;
  readonly assignButton: Locator;
  private readonly invalidTime: Locator;
  private readonly startPicker: Locator;
  private readonly hours: Locator;
  private readonly minutes: Locator;
  private readonly meridiem: Locator;
  private readonly confirmTime: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Assign Daily Assessment', exact: true });
    this.content = page.getByRole('document');
    // These three visible fields have no distinct accessible names, labels or IDs.
    // Recorded form order: assessment title, start date, end date. Hidden select
    // inputs are excluded by the role query; time inputs have placeholder names.
    const unnamed = page.getByRole('textbox', { name: '', exact: true });
    this.titleInput = unnamed.nth(0);
    this.startDate = unnamed.nth(1);
    this.endDate = unnamed.nth(2);
    // Both time fields share the same accessible name; recorded order is start/end.
    this.startTime = page.getByRole('textbox', { name: 'hh:mm aa', exact: true }).nth(0);
    this.endTime = page.getByRole('textbox', { name: 'hh:mm aa', exact: true }).nth(1);
    this.startPicker = page.getByRole('button', { name: /^Choose time/ }).nth(0);
    this.allStudents = page.getByRole('radio', { name: 'All Students', exact: true });
    this.section = page.getByRole('button', { name: 'A', exact: true });
    this.assignButton = page.getByRole('button', { name: 'ASSIGN', exact: true });
    this.invalidTime = page.getByText('Invalid Time', { exact: true });
    this.hours = page.getByRole('listbox', { name: 'Select hours', exact: true });
    this.minutes = page.getByRole('listbox', { name: 'Select minutes', exact: true });
    this.meridiem = page.getByRole('listbox', { name: 'Select meridiem', exact: true });
    this.confirmTime = page.getByRole('button', { name: 'OK', exact: true });
  }

  async enterTitle(title: string): Promise<void> { await this.titleInput.fill(title); }

  async resolveInvalidStart(timezone: string): Promise<void> {
    if (await this.assignButton.isEnabled()) return;
    if (!await this.invalidTime.isVisible()) {
      throw new Error('ASSIGN is disabled without Invalid Time; inspect audience and form validation.');
    }
    // Observed picker granularity is five minutes. Choose the earliest future slot.
    const future = new Date((Math.floor(Date.now() / 300000) + 1) * 300000);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(future);
    const value = (type: string) => parts.find(part => part.type === type)!.value;
    const date = value('year') + '-' + value('month') + '-' + value('day');
    if (await this.startDate.inputValue() !== date) {
      await this.startDate.fill(date);
      await this.endDate.fill(date);
    }
    const hour = Number(value('hour'));
    await this.startPicker.click();
    await this.hours.getByRole('option', { name: (hour % 12 || 12) + ' hours', exact: true }).click();
    await this.minutes.getByRole('option', { name: Number(value('minute')) + ' minutes', exact: true }).click();
    await this.meridiem.getByRole('option', { name: hour < 12 ? 'AM' : 'PM', exact: true }).click();
    await this.confirmTime.click();
  }

  async readSchedule(timezone: string): Promise<AssessmentSchedule> {
    return {
      startDate: await this.startDate.inputValue(), startTime: await this.startTime.inputValue(),
      endDate: await this.endDate.inputValue(), endTime: await this.endTime.inputValue(), timezone,
    };
  }
  async assign(): Promise<void> { await this.assignButton.click(); }
}
