const common = {
  require: [
    'tests/web/hooks/**/*.ts',
    'tests/web/step-definitions/**/*.ts',
    'tests/web/config/geneoWorld.ts'
  ],
  requireModule: ['ts-node/register/transpile-only'],
  format: ['json:reports/cucumber-report.json'],
  publishQuiet: true
};

module.exports = {
  default: {
    ...common
  },

  all: {
    ...common,
    paths: ['tests/web/features/**/*.feature']
  },

  teacher: {
    ...common,
    paths: ['tests/web/features/Teacher/**/*.feature']
  },

  student: {
    ...common,
    paths: ['tests/web/features/Student/**/*.feature']
  },

  admin: {
    ...common,
    paths: ['tests/web/features/Admin/**/*.feature']
  },

  regression1: {
    ...common,
    tags: '@regression1'
  }
};
