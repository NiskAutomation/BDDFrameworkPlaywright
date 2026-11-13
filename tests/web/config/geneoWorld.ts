import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { createHash, randomUUID } from 'crypto';
import { config } from './test.config';
import assessmentData from '../../../testdata/assessmentCreation.json';
import { AssessmentSchedule } from '../../../pages/teacher/AssessmentAssignmentPage';
import { TeacherProfilePage } from '../../../pages/teacher/ProfilePage';
import { AssessmentPage } from '../../../pages/teacher/AssessmentPage';
import { QuestionSelectionPage } from '../../../pages/teacher/QuestionSelectionPage';
import { AssessmentReviewPage } from '../../../pages/teacher/AssessmentReviewPage';
import { AssessmentAssignmentPage } from '../../../pages/teacher/AssessmentAssignmentPage';
import { AssessmentResultsPage } from '../../../pages/teacher/AssessmentResultsPage';
import { StudentPerformancePage } from '../../../pages/teacher/StudentPerformancePage';
import { StudentHomePage } from '../../../pages/student/HomePage';
import { StudentProfilePage } from '../../../pages/student/ProfilePage';
import { StudentAssessmentPage } from '../../../pages/student/AssessmentPage';
import { HomeworkAttemptPage } from '../../../pages/student/HomeworkAttemptPage';
import { Driver } from '../../../fixtures/fixtures';
import { SoftAssertions } from '../../../utils/Assertion';
import { CommonMethods } from '../../../utils/commonMethod';
import { PlaywrightProvider } from '../../../fixtures/playwrightProvider';
import { LoginPage } from '../../../pages/teacher/LoginPage';
import { HomePage } from '../../../pages/teacher/HomePage';
import { ChapterSelectionPage } from '../../../pages/teacher/ChapterSelectionPage';
import { TopicSelectionPage } from '../../../pages/teacher/TopicSelectionPage';
import { AssessmentConfirmationPage } from '../../../pages/teacher/AssessmentConfirmationPage';
import { HomeworkCoverPage } from '../../../pages/student/HomeworkCoverPage';
import { SubmittedHomeworkPage } from '../../../pages/student/SubmittedHomeworkPage';
import { StudentLoginPage } from '../../../pages/student/LoginPage';

/**
 * GeneoWorld / CustomWorld
 * Cucumber World context providing access to Playwright Page, Browser, Driver,
 * Soft Assertions, Common Methods, and registered Page Objects.
 */
export class GeneoWorld extends World {
  studentPage?: Page;
  assessmentRun!: {
    title: string; id?: string; assignmentAttempted?: boolean;
    pendingVerified?: boolean; started?: boolean; submitted?: boolean; verified?: boolean;
    resumed?: boolean;
    responseValues?: string[][];
    environment?: { teacherUrl: string; studentUrl: string };
    chapter?: string; topic?: string; schedule?: AssessmentSchedule; answers: string[];
  };
  private assessmentRunPath?: string;

  loadAssessmentRun(): void {
    const key = process.env.ASSESSMENT_RUN_KEY || 'teacher-student-assessment';
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) throw new Error('Invalid ASSESSMENT_RUN_KEY.');
    const environment = this.assessmentEnvironment();
    // Scope checkpoints by both application URLs so switching deployments never
    // resumes an assessment from another environment. Legacy unscoped files stay untouched.
    const scope = createHash('sha256').update(JSON.stringify(environment)).digest('hex').slice(0, 16);
    this.assessmentRunPath = path.resolve('reports', key + '-' + scope + '.run.json');
    fs.mkdirSync(path.dirname(this.assessmentRunPath), { recursive: true });
    if (fs.existsSync(this.assessmentRunPath)) {
      this.assessmentRun = JSON.parse(fs.readFileSync(this.assessmentRunPath, 'utf8'));
      if (JSON.stringify(this.assessmentRun.environment) !== JSON.stringify(environment)) {
        throw new Error('Saved assessment environment does not match the configured application URLs.');
      }
      // A new invocation starts a fresh assessment only after the prior
      // assessment was fully submitted and verified. Incomplete runs resume.
      if (this.assessmentRun.verified) {
        this.assessmentRun = this.createAssessmentRun();
        this.saveAssessmentRun();
      } else {
        // A checkpoint can exist before assignment. Only an assigned assessment
        // can be looked up in Homework Manage on retry.
        this.assessmentRun.resumed = Boolean(this.assessmentRun.id);
        this.saveAssessmentRun();
      }
      if (this.assessmentRun.assignmentAttempted && !this.assessmentRun.id) {
        throw new Error('An assignment was attempted without a captured ID. Recover its ID before retrying; creation is blocked to prevent duplicates.');
      }
    } else {
      this.assessmentRun = this.createAssessmentRun();
      this.saveAssessmentRun();
    }
  }

  private createAssessmentRun(): GeneoWorld['assessmentRun'] {
    return {
      title: assessmentData.titlePrefix + '-' + new Date().toISOString().replace(/[^0-9]/g, '') + '-' + randomUUID().slice(0, 6),
      answers: [], resumed: false, environment: this.assessmentEnvironment(),
    };
  }

  private assessmentEnvironment(): { teacherUrl: string; studentUrl: string } {
    return {
      teacherUrl: new URL(config.getTeacherUrl()).href,
      studentUrl: new URL(config.getStudentUrl()).href,
    };
  }

  saveAssessmentRun(): void {
    if (!this.assessmentRunPath) throw new Error('Assessment run not initialized.');
    // Only shared assessment data; never credentials, student identity or auth state.
    fs.writeFileSync(this.assessmentRunPath, JSON.stringify(this.assessmentRun, null, 2));
  }
  page?: Page;
  browser?: Browser;

  driver!: Driver;
  softAssert!: SoftAssertions;
  commonMethods!: CommonMethods;
  playwrightProvider!: PlaywrightProvider;
  testData: any = {};

  /**
   * Helper method to resolve upload file paths from testdata/uploads/
   */
  getUploadFilePath(fileName: string): string {
    return path.resolve(
      process.cwd(),
      'testdata',
      'uploads',
      fileName
    );
  }

  // =========================================================================
  // Register Page Objects here as you create them
  loginPage!: LoginPage;
  homePage!: HomePage;
  teacherChapterSelectionPage!: ChapterSelectionPage;
  teacherTopicSelectionPage!: TopicSelectionPage;
  teacherAssessmentConfirmationPage!: AssessmentConfirmationPage;
  studentHomeworkCoverPage!: HomeworkCoverPage;
  studentSubmittedHomeworkPage!: SubmittedHomeworkPage;
  studentLoginPage!: StudentLoginPage;
  teacherProfilePage!: TeacherProfilePage;
  teacherAssessmentPage!: AssessmentPage;
  teacherQuestionSelectionPage!: QuestionSelectionPage;
  teacherAssessmentReviewPage!: AssessmentReviewPage;
  teacherAssignmentPage!: AssessmentAssignmentPage;
  teacherResultsPage!: AssessmentResultsPage;
  teacherStudentPerformancePage!: StudentPerformancePage;
  studentHomePage!: StudentHomePage;
  studentProfilePage!: StudentProfilePage;
  studentAssessmentPage!: StudentAssessmentPage;
  studentHomeworkAttemptPage!: HomeworkAttemptPage;
  // =========================================================================

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Instantiates all Page Objects using the active Playwright page.
   * Call this in tests/web/hooks/hooks.ts Before hook.
   */
  initializePageObjects(page: Page) {
    this.teacherProfilePage = new TeacherProfilePage(page);
    this.teacherAssessmentPage = new AssessmentPage(page);
    this.teacherQuestionSelectionPage = new QuestionSelectionPage(page);
    this.teacherAssessmentReviewPage = new AssessmentReviewPage(page);
    this.teacherAssignmentPage = new AssessmentAssignmentPage(page);
    this.teacherResultsPage = new AssessmentResultsPage(page);
    this.teacherStudentPerformancePage = new StudentPerformancePage(page);
    this.loginPage = new LoginPage(page);
    this.homePage = new HomePage(page);
    this.teacherChapterSelectionPage = new ChapterSelectionPage(page);
    this.teacherTopicSelectionPage = new TopicSelectionPage(page);
    this.teacherAssessmentConfirmationPage = new AssessmentConfirmationPage(page);
  }

  initializeStudentPageObjects(page: Page): void {
    this.studentHomePage = new StudentHomePage(page);
    this.studentProfilePage = new StudentProfilePage(page);
    this.studentAssessmentPage = new StudentAssessmentPage(page);
    this.studentHomeworkAttemptPage = new HomeworkAttemptPage(page);
    this.studentLoginPage = new StudentLoginPage(page);
    this.studentHomeworkCoverPage = new HomeworkCoverPage(page);
    this.studentSubmittedHomeworkPage = new SubmittedHomeworkPage(page);
  }

  /**
   * Instantiates framework drivers and utility classes.
   */
  initializeUtilities(driver: Driver, page: Page) {
    this.driver = driver;
    this.softAssert = new SoftAssertions(driver, page);
    this.commonMethods = new CommonMethods();
    this.playwrightProvider = new PlaywrightProvider(page);
  }
}

setWorldConstructor(GeneoWorld);
