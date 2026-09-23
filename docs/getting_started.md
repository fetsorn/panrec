# Getting Started

To create a new [CSVS](https://csvs-format.docs.norcivilianlabs.org/) dataset
```shell
panrec -o /path/to/csvs-dataset
```

To print all entries in a dataset
```shell
panrec -i /path/to/csvs-dataset
```

To print stats for a dataset
```shell
panrec --stats -i /path/to/csvs-dataset
```

To search for entries with a date that starts in 2005
```shell
panrec -i /path/to/csvs-dataset -q "?date=2005.*"
```

Learn more about panrec in the [Tutorial](./tutorial.md) and [User Guides](./user_guides.md). For a complete list of CLI commands and flags, see [Reference](./reference.md). 
