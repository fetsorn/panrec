Feature: Import records

  Scenario: Import from csvs dataset
    Given the default csvs dataset
    When I import from csvs with query "?_=event&actname=name1"
    Then the output matches the expected records

  Scenario: Import from json file
    Given the default json file
    When I import from json
    Then the output matches the expected records

  Scenario: Import from json stdin stream
    Given the default json stdout file
    When I import from json stream
    Then the output matches the expected records

  Scenario: Import from vk archive
    Given the default vk archive
    When I import from vk
    Then the output matches the expected records

  Scenario: Import from biorg file
    Given the default biorg file
    When I import from biorg
    Then the output matches the expected records

  Scenario: Import from listing with stdin
    Given the default listing directory
    When I import from listing with query "?"
    Then the sorted output matches the expected records

  Scenario: Import from gedcom file
    Given the default gedcom file
    When I import from gedcom
    Then the sorted output matches the expected records
