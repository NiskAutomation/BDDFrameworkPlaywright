# Plan: specs/teacher/teacher-student-assessment.md
Feature: Teacher homework submission across Teacher and Student applications
  # Keep the complete journey in one scenario; contexts and identity are shared only within this run.
  @teacher @student @critical @regression @teacherStudentAssessment
  Scenario: Assign four-question homework and verify the enrolled student's submission
    Given the Teacher signs in for the shared homework journey
    And the Student signs in in a separate browser context
    Then the Student belongs to the configured class with Science
    And the Teacher selects 8A Science
    When the Teacher chooses Homework through Geneo App
    And the Teacher selects the first chapter and its first topic
    And the Teacher adds exactly two Easy and two Medium questions
    Then the Teacher reviews exactly four questions with the required difficulty distribution
    When the Teacher names and assigns the shared homework with valid scheduling
    Then the Teacher sees successful assignment and records its identity
    When the Student filters homework and opens the exact shared assessment
    Then the Student verifies Pending status or resumes the recorded submission
    When the Student answers all four questions and ends the homework
    Then the Student sees the shared assessment submitted
    And the Teacher verifies all four responses in the target student's submission

