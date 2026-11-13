import { PlaywrightProvider } from '../../../fixtures/playwrightProvider';
import { Driver } from '../../../fixtures/fixtures';
import { GeneoWorld } from '../config/geneoWorld';
import { chromium, firefox, webkit, selectors } from 'playwright';
import { Before, After, AfterStep, setDefaultTimeout } from '@cucumber/cucumber';
import assessmentData from '../../../testdata/assessmentCreation.json';
import credentials from '../../../testdata/credentials.json';
import { config } from '../config/test.config';
import * as path from 'path';
import * as fs from 'fs';

setDefaultTimeout(60000);

Before(async function (this: GeneoWorld, scenario) {
  selectors.setTestIdAttribute('data-test-id');
  const crossApplication = scenario.pickle.tags.some(tag => tag.name === '@teacherStudentAssessment');
  if (crossApplication) this.loadAssessmentRun();
  const browserType =
    config.browser === 'chromium'
      ? chromium
      : config.browser === 'firefox'
        ? firefox
        : webkit;

  const slowMo = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO, 10) : 0;

  const browser = await browserType.launch({
    headless: config.headless,
    ...(slowMo > 0 ? { slowMo } : {}),
    args: ['--start-maximized'],
  });

  const page = await browser.newPage({
    viewport: null,
    ignoreHTTPSErrors: true,
    ...(crossApplication ? { timezoneId: assessmentData.timezone } : {}),
  });
  page.setDefaultTimeout(config.timeout);

  const driver: Driver = new PlaywrightProvider(page);
  this.page = page;
  this.browser = browser;

  this.initializeUtilities(driver, this.page);
  this.initializePageObjects(this.page);
  if (crossApplication) {
    // browser.newPage creates an independent context, isolating each role's auth.
    this.studentPage = await browser.newPage({
      viewport: null, ignoreHTTPSErrors: true, timezoneId: assessmentData.timezone,
    });
    this.studentPage.setDefaultTimeout(config.timeout);
    this.initializeStudentPageObjects(this.studentPage);
  }
});

AfterStep(function ({ result }) {
  // Assertion call logs can include the target display name, which is also a login.
  if (result.exception) {
    const redact = (text: string) => Object.values(credentials).reduce(
      (safe, secret) => typeof secret === 'string' && secret ? safe.split(secret).join('[REDACTED]') : safe, text);
    if (result.exception.message) result.exception.message = redact(result.exception.message);
    if (result.exception.stackTrace) result.exception.stackTrace = redact(result.exception.stackTrace);
  }
});

After(async function (this: GeneoWorld, scenario) {
  if (scenario.pickle.tags.some(tag => tag.name === '@teacherStudentAssessment')) {
    // This app displays the login name in its header. Use a sanitized run record
    // instead of screenshots that would disclose credentials in the report.
    try {
      if (this.assessmentRun) await this.attach(JSON.stringify(this.assessmentRun, null, 2), 'application/json');
    } finally {
      await this.browser?.close(); // closes both independent role contexts, including on failure
    }
    this.softAssert?.assertAll();
    return;
  }
  // Ensure screenshots directory exists
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Capture final step screenshot for ALL scenarios (Passed, Failed, etc.)
  if (this.page && !this.page.isClosed()) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      const status = scenario.result?.status?.toLowerCase() || 'unknown';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${status}_${timestamp}.png`;
      const filePath = path.join(screenshotsDir, fileName);

      // Save screenshot file to disk
      fs.writeFileSync(filePath, screenshot);

      // Attach to Cucumber JSON & HTML report
      this.attach(screenshot, 'image/png');
    } catch (error) {
      console.warn(`Failed to capture post-scenario screenshot: ${error}`);
    }
  }

  // 2. Handle soft assertion screenshots if any
  if (this.softAssert && this.softAssert.hasErrors()) {
    const screenshots = this.softAssert.getScreenshots();
    screenshots.forEach((screenshot, index) => {
      const fileName = `${scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_')}_softassert_${index}.png`;
      const filePath = path.join(screenshotsDir, fileName);
      fs.writeFileSync(filePath, screenshot);
      this.attach(screenshot, 'image/png');
    });
  }

  // 3. Cleanup browser
  if (this.browser) {
    await this.browser.close();
  }

  // 4. Assert all soft assertions
  if (this.softAssert) {
    this.softAssert.assertAll();
  }
});
