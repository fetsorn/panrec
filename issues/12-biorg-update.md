# Document Title
 biorg update doesn't delete omitted fields
 
 I had a record { _: event, event: event1, field1: value1, field2: value2 } and gave a biorg

```org-mode
* .
:PROPERTIES:
:_: event
:__: field1
:END:
value3
```

and called `csvs -i import.bi.org -o .`

the value of field1 updated but field2 wasn't removed from the dataset.

an omitted field should not be deleted, this a feature, not a bug. should say so in specification

if you want to delete fields, first delete the record and then update it
