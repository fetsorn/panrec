# Emit directory records from fs and shasum sources

Status: proposed
Date: 2026-04-24

## Context

File paths contain implicit directory structure. The path `2024/photos/vacation/img.jpg` implies three directories: `2024`, `2024/photos`, `2024/photos/vacation`, each with a parent relationship. Downstream consumers (csvs datasets, RDF graphs) need this hierarchy explicit — as `skos:broader` links, as `dir-parent.csv` tablets, etc.

Currently the `fs` source emits only file records. Directory decomposition is left to downstream tools. This means every consumer reimplements the same path-splitting logic.

## Decision

Add directory record emission to the `fs` and `shasum` sources. For each file path, decompose it into directory segments and emit a record for each directory:

```json
{ "_": "dir", "dir": "2024/photos/vacation", "parent": "2024/photos" }
{ "_": "dir", "dir": "2024/photos", "parent": "2024" }
{ "_": "dir", "dir": "2024", "parent": "" }
```

### Behavior

- For each file path, split on `/` and emit one `dir` record per ancestor directory
- `dir` is the full directory path from the root
- `parent` is the parent directory path, empty string for top-level directories
- Deduplicate: each unique directory path is emitted once, even if thousands of files share it
- Directory records are interleaved with file records in the output stream
- The `fs` source emits directory records as it walks (it already encounters directories during traversal)
- The `shasum` source derives directories from the file paths in the listing

### File records unchanged

File records keep their existing shape. The `_` field distinguishes record types:

```json
{ "_": "filepath", "filepath": "2024/photos/vacation/img.jpg", "filehash": "a1b2..." }
{ "_": "dir", "dir": "2024/photos/vacation", "parent": "2024/photos" }
```

Downstream tools (jq, panrec export) can filter by `._` to process files and directories separately.

## Consequences

- Directory hierarchy is computed once at the source, not reimplemented by each consumer
- csvs datasets can write `dir-parent.csv` directly from panrec output via jq: `select(._=="dir") | [.dir, .parent]`
- RDF materializers can emit `skos:broader` triples from the same records
- The deduplication happens in-stream, keeping memory proportional to the number of unique directories (not files)
- The `listing` source could also gain this feature, but it is not in scope for this decision
