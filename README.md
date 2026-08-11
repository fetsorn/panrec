<div align="center">

part of the [ontonomy](https://norcivilianlabs.org) software suite

AGPL-3.0. Anton Davydov.

</div>

# panrec

A universal record converter. 

panrec reads structured data from one format, represents it as
[SON](https://norcivilianlabs.org) records, and writes it out in
another. Backups, contact books, genealogy files, plain CSVs,
whatever has a schema can become SON and whatever SON holds can
become something else.

```
  input                          output

  GEDCOM  ─┐                ┌─  csvs dataset
  VCF     ─┤                ├─  JSON lines
  Telegram ┼──►  SON  ──►──┼─  biorg
  VK      ─┤                ├─  stdout
  CSV     ─┤                └─  ...
  biorg   ─┤
  JSON    ─┘
```

A GEDCOM file becomes SON records:

```sh
$ panrec -i ./family.ged
```
```json
{"_":"event","event":"1","actname":"Victoria_Hanover","actdate":"1819-05-24","category":"birth","datum":"Kensington Palace, London"}
{"_":"event","event":"9","actname":["Albert_Augustus","Victoria_Hanover"],"actdate":"1840-02-10","category":"marriage","datum":"Chapel Royal, St James"}
{"_":"person","person":"Edward_VII","parent":["Albert_Augustus","Victoria_Hanover"]}
```

Each line is a self-contained SON record. Pipe it into a csvs
dataset, filter it, or process it further.

## Install

```sh
npm i -g panrec
```

## Use

```sh
# query a csvs dataset
panrec -i ./store -q "_=name"

# import a GEDCOM file into a csvs dataset
panrec -i ./family.ged -o ./store -t csvs

# import from stdin
cat records.jsonl | panrec - -o ./store -t csvs

# pipe through: read from one source, transform, write elsewhere
panrec -i ./telegram-export -q "_=message" | panrec - -o ./archive -t csvs
```

## Implementations

- [js/](js/) JavaScript (Node.js), all importers and exporters
- [rs/](rs/) Rust, csvs CRUD only

## Source

- Codeberg: [norcivilianlabs/panrec](https://codeberg.org/norcivilianlabs/panrec)
- GitHub: [fetsorn/panrec](https://github.com/fetsorn/panrec)
