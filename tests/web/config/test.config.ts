import * as dotenv from 'dotenv';

// Load base environment first
dotenv.config();

// Auto-detect user type based on command line arguments
// Cucumber passes feature files and options via process.argv
const commandArgs = process.argv.join(' ');
const isStudentFeature = commandArgs.includes('student') || commandArgs.includes('Student');
const isTeacherFeature = commandArgs.includes('teacher') || commandArgs.includes('Teacher');
const isAdminFeature = commandArgs.includes('admin') || commandArgs.includes('Admin');

// Determine user type with fallback to USER_TYPE or default to teacher
const userType = isStudentFeature ? 'student' :
  isTeacherFeature ? 'teacher' :
    isAdminFeature ? 'admin' :
      (process.env.USER_TYPE || 'teacher');

const envFile = `./envs/${userType}.env`;

// Load the specific user type env file
dotenv.config({ path: envFile, override: true });

// Allow overriding environment via CLI: --env=prod, --env=test, --env=stage
const envArgMatch = commandArgs.match(/--env[=\s]+(\w+)/);
if (envArgMatch) {
  process.env.RUN_ENVIRONMENT = envArgMatch[1];
}

console.log(`Auto-detected user type: ${userType}`);
console.log(`🎯 RUN_ENVIRONMENT: "${process.env.RUN_ENVIRONMENT}" (source: ${envArgMatch ? 'CLI --env arg' : envFile})`);

export interface TestConfig {
  environments: {
    test: string;
    stage: string;
    prod: string;
  };
  teacherUrls: { [env: string]: string };
  studentUrls: { [env: string]: string };
  adminUrls: { [env: string]: string };
  baseUrl: () => string;
  getTeacherUrl: () => string;
  getStudentUrl: () => string;
  getAdminUrl: () => string;
  browser: 'chromium' | 'firefox' | 'webkit';
  headless: boolean;
  timeout: number;
}

export const config: TestConfig = {
  environments: {
    test: 'test',
    stage: 'stage',
    prod: 'prod',
  },
  teacherUrls: {
    test: 'https://teach-test.geneo.in/',
    stage: 'https://teach-stage.geneo.in/',
    prod: 'https://teach.geneo.in/',
    dev: 'https://dev3-web.geneo.in/',
    offline: 'https://localhost:7000/teacher'
  },
  studentUrls: {
    test: 'https://learn-test.geneo.in/',
    stage: 'https://learn-stage.geneo.in/',
    prod: 'https://learn.geneo.in/',
    offline: 'https://localhost:7000/student'
  },
  adminUrls: {
    test: 'https://admin-test.geneo.in/',
    stage: 'https://admin-stage.geneo.in/',
    prod: 'https://admin.geneo.in/'
  },
  baseUrl(): string {
    const userType = process.env.USER_TYPE || 'teacher';
    if (userType === 'teacher') {
      return this.getTeacherUrl();
    } else if (userType === 'student') {
      return this.getStudentUrl();
    } else if (userType === 'admin') {
      return this.getAdminUrl();
    } else {
      throw new Error(`Unknown USER_TYPE: ${userType}`);
    }
  },
  getTeacherUrl(): string {
    const env = (process.env.RUN_ENVIRONMENT || 'stage') as keyof typeof this.teacherUrls;
    const url = this.teacherUrls[env];
    console.log(`🎯 Resolved environment: "${env}" → ${url}`);
    return url;
  },
  getStudentUrl(): string {
    const env = (process.env.RUN_ENVIRONMENT || 'stage') as keyof typeof this.studentUrls;
    return this.studentUrls[env];
  },
  getAdminUrl(): string {
    const env = (process.env.RUN_ENVIRONMENT || 'stage') as keyof typeof this.adminUrls;
    return this.adminUrls[env];
  },

  browser: (process.env.RUN_BROWSER || 'chromium') as 'chromium' | 'firefox' | 'webkit',

  headless: process.env.RUN_HEADLESS === 'true',

  timeout: 30000,
};
