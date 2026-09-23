# Tutorial

Let's fill a CSVS dataset with entries and search for them with a query.

To create a new csvs dataset
```shell
panrec -o /path/to/csvs-dataset
```

It's a new dataset, so if we run a search on it, it will return only one empty entry.
```shell
panrec -i /path/to/csvs-dataset
# {"_": "datum", "UUID": "...", "datum": "", "actdate": "2001-01-01"}
```

Let's see the stats
```shell
panrec --stats -i /path/to/csvs-dataset
# number of entries: 1
```

Let's print the dataset as text and add some entries to it.
```shell
panrec -i /path/to/csvs-dataset -t biorg -o /path/to/dataset.biorg
```

We specify an event for a given date.
```org-mode
* .
:PROPERTIES:
:actdate: 2005-07-28
:END:
a walk in the park

* .
:PROPERTIES:
:actdate: 2011-03-17
:END:
won a championship
```

Now let's write the new entry to the dataset. The program will detect that the file is in Biorg format and copy new entries over. 
```shell
panrec -i /path/to/dataset.biorg -o /path/to/csvs-dataset

panrec --stats -i /path/to/csvs-dataset
# number of entries: 3

panrec -i /path/to/csvs-dataset
# {"_": "datum", "UUID": "...", "datum": "", "actdate": "2001-01-01"}
# {"_": "datum", "UUID": "...", "datum": "a walk in the park", "actdate": "2005-07-28"}
# {"_": "datum", "UUID": "...", "datum": "won a championship", "actdate": "2011-03-17"}
```

Let's search only for the entry that happened in 2011. A wildcard `.*` means "any number of arbitrary characters"
```shell
panrec -i /path/to/csvs-dataset -q "?actdate=2011.*"
# {"_": "datum", "UUID": "...", "datum": "won a championship", "actdate": "2011-03-17"}
```

Learn more about panrec in the [User Guides](./user_guides.md). For a complete list of CLI commands and flags, see [Reference](./reference.md). 
