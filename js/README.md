<div align="center">

part of the [ontonomy](https://norcivilianlabs.org) software suite

</div>

# panrec

A universal record converter. 

panrec reads structured data from one format, represents it as
[SON](https://norcivilianlabs.org) records, and writes it out
in another.

```
  GEDCOM, VCF, Telegram, VK, CSV, biorg, JSON
                    │
                   SON
                    │
          csvs, JSON lines, biorg, stdout
```

This is the JavaScript implementation (Node.js CLI).

Source and Rust implementation:
[codeberg.org/norcivilianlabs/panrec](https://codeberg.org/norcivilianlabs/panrec).

## Install

```sh
npm i -g panrec
```

## Use

```sh
$ panrec -i ./family.ged
```
```json
{"_":"event","event":"1","actname":"Victoria_Hanover","actdate":"1819-05-24","category":"birth","datum":"Kensington Palace, London"}
{"_":"person","person":"Edward_VII","parent":["Albert_Augustus","Victoria_Hanover"]}
```

Each line is a self-contained SON record.

```sh
# query a csvs dataset
panrec -i ./store -q "_=name"

# import a GEDCOM file into a csvs dataset
panrec -i ./family.ged -o ./store -t csvs

# import from stdin, pipe through
cat records.jsonl | panrec - -o ./archive -t csvs
```

## Supported formats

| Format   | Import | Export |
|----------|--------|--------|
| csvs     | yes    | yes    |
| JSON     | yes    | yes    |
| biorg    | yes    | yes    |
| GEDCOM   | yes    |        |
| VCF      | yes    |        |
| Telegram | yes    |        |
| VK       | yes    |        |
| listing  | yes    |        |
| stdout   |        | yes    |

AGPL-3.0. Anton Davydov.
