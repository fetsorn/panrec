# Config file for source and target options

Status: proposed
Date: 2026-04-24

## Context

panrec has accumulated flags that are specific to particular source or target types:

- `--hashsum` (fs source: whether to compute sha256)
- `--header <file>` (TTL export: prefix declarations)
- IRI encoding flag (TTL export, ADR-0004)
- query parameters (csvs source: which records to select)
- source path semantics vary by type (directory for fs, file for shasum/listing, directory for csvs)

As panrec gains more source and target types, the flag surface grows. Flags that only apply to one source/target type clutter the CLI for all others. The combinations are hard to document and validate — `--hashsum` with `-t ttl` is meaningless, `--header` with `-s fs` is meaningless.

## Decision

Introduce a config file passed via `-c` / `--config` that holds per-source and per-target options.

```json
{
  "source": {
    "type": "fs",
    "hashsum": true
  },
  "target": {
    "type": "ttl",
    "header": "prefixes.ttl",
    "iri_encode": true
  }
}
```

### Behavior

- `-c <file>` loads the config. Source and target types come from the config instead of `-s` and `-t` flags.
- Without `-c`, panrec works as before — `-s` and `-t` flags with type-specific flags on the command line. No breaking change.
- With `-c`, command-line flags for source/target type (`-s`, `-t`) and type-specific flags are ignored (or error). The config is the single source of options.
- The config file is JSON. Each source/target type defines its own set of valid keys.

### What moves to config

| Current flag          | Source/target | Config key             |
|-----------------------|---------------|------------------------|
| `--hashsum`           | fs source     | `source.hashsum`       |
| `--header <file>`     | ttl target    | `target.header`        |
| IRI encoding flag     | ttl target    | `target.iri_encode`    |
| `-q` query            | csvs source   | `source.query`         |

### What stays as flags

- `-c` / `--config` itself
- Positional argument for source path (stdin if absent)
- `--help`, `--version`

## Consequences

- Type-specific options are scoped to their type — no meaningless flag combinations
- Config files can be checked into repos alongside the data they describe — `estate.panrec.json` next to the dataset
- Pipelines become shorter: `panrec -c estate-ingest.json <path>` instead of `panrec -s fs --hashsum -t csvs`
- Adding new source/target types doesn't pollute the global flag namespace
- The config file is diffable and versionable — pipeline changes show up in git
