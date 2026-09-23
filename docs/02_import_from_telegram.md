# Import from Telegram

To export data, download the [Desktop Client](https://desktop.telegram.org), then click Settings > Export Telegram data and choose JSON format. 

Point the cli to one of the chat folders with a `result.json` file and you will see a printed set of message entries in JSON format.
```shell
panrec -i "/path/to/Telegram backup/username"
```

Specify an output path to write the entries to csvs.
```shell
panrec -i "/path/to/Telegram backup/username" -o /path/to/target-dataset
```

Learn more about panrec in other [User Guides](./user_guides.md) and the [Requirements](./requirements.md). For a complete list of CLI commands and flags, see [Reference](./reference.md). 
