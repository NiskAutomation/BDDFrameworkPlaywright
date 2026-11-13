const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  jsonFile: './reports/cucumber-report.json',
  output: './reports/cucumber-html-report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: false,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": "Test",
    "Browser": "Chrome",
    "Platform": "Windows 11",
    "Parallel": "1",
    "Executed": "Local"
  }
};

reporter.generate(options);
