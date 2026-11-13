@teacher @smoke @critical
Feature: Teacher Login Flow

  Scenario: 1.1 Reject Analytics Cookie Consent Banner
    Given Teacher navigates to the teacher login page
    Then The optional analytics cookies dialog should be visible
    When Teacher clicks on reject analytics button
    Then The optional analytics cookies dialog should no longer be visible
    And Local storage item "amplitudeAnalyticsConsent" should be set to "false"

  Scenario: 1.2 Accept Analytics Cookie Consent Banner (Pass and Persist)
    Given Teacher navigates to the teacher login page
    Then The optional analytics cookies dialog should be visible
    When Teacher clicks on accept analytics button
    Then The optional analytics cookies dialog should no longer be visible
    And Local storage item "amplitudeAnalyticsConsent" should be set to "true"
    And The username input field should be enabled
    And The Next button should be visible

  Scenario: 2.1 Empty Username Submission Validation
    Given Teacher navigates to the teacher login page
    And Teacher accepts analytics cookies if prompted
    Then The Next button should be disabled
    When Teacher enters whitespace into the username field
    And Teacher clicks on next button
    Then Validation error "Please enter a valid username, phone number, or email.*" should be displayed

  Scenario: 2.2 Invalid Username Submission
    Given Teacher navigates to the teacher login page
    And Teacher accepts analytics cookies if prompted
    When Teacher enters username "invalid_user_9999"
    And Teacher clicks on next button
    Then Error message "Invalid username*" should be displayed
    And Teacher should remain on the login UID screen
