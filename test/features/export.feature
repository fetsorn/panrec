Feature: Export records

  Scenario: Export to csvs dataset
    Given records to export to csvs
    When I export to csvs
    Then the csvs output matches the expected dataset

  Scenario: Export to stdout
    Given a record to export to stdout
    When I export to stdout
    Then the stdout output matches the expected file

  Scenario: Export to biorg
    Given a record to export to biorg
    When I export to biorg
    Then the stdout output matches the expected file

  Scenario: Export to json file
    Given a record to export to json
    When I export to json
    Then the json output matches the expected file
