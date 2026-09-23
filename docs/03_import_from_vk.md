# Import from VKontakte

To export data, open the [VK documentation](https://vk.com/data_protection?section=rules&scroll_to_archive=1) and press "Request archive". Extract the archive into a folder.

Point the cli to one of the backup folder you will see a printed set of message entries in JSON format.
```shell
panrec -i "/path/to/VK_backup"
```

Specify an output path to write the entries to csvs.
```shell
panrec -i "/path/to/Telegram backup/username" -o /path/to/target-dataset
```

Learn more about panrec in other [User Guides](./user_guides.md) and the [Requirements](./requirements.md). For a complete list of CLI commands and flags, see [Reference](./reference.md). 
