<div align="center">

part of the [ontonomy](https://norcivilianlabs.org) software suite

</div>

# panrec

A universal record converter. 

This is the Rust implementation. Currently it provides csvs
CRUD operations only. The full importer/exporter suite is in
the [JavaScript implementation](../js/).

Source: [codeberg.org/norcivilianlabs/panrec](https://codeberg.org/norcivilianlabs/panrec).

## Install

```sh
cargo install --git https://codeberg.org/norcivilianlabs/panrec
```

## Use

```sh
# query a csvs dataset
panrec select -q '{"_": "name"}'

# from a specific path
panrec -p /path/to/dataset select -q '{"_": "name", "name": "john"}'

# write a record
panrec update -q '{"_": "name", "name": "jane", "age": "36"}'

# delete a record
panrec delete -q '{"_": "name", "name": "jane"}'

# create a new dataset
panrec create -n my-dataset
```

AGPL-3.0. Anton Davydov.
