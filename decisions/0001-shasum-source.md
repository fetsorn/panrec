# Add sha256sum listing as an import source

Status: proposed
Date: 2026-04-24

## Context

Archive hard drives have sha256sum listings generated at backup time — one file per snapshot, in standard sha256sum output format (`<64-char hex>  <path>\n`). These listings are the only index of what physically exists on unmounted drives.

Currently panrec has an `fs` source that walks a mounted directory and a `listing` source that reads a plain file listing and stats each file. Neither can consume a sha256sum listing without the files being mounted. The sha256sum format already contains the hash — no need to read file content.

## Decision

Add a `shasum` import source that parses sha256sum listings and emits records:

```json
{ "_": "filepath", "filepath": "<path>", "filehash": "<hex>" }
```

### Format

Standard sha256sum output: 64 hex characters, two spaces (or space+asterisk for binary mode), then the file path, terminated by newline.

```
e3b0c44298fc1c149afbf4c8996fb924...  2024/photos/img001.jpg
a1b2c3d4e5f6...  2024/documents/note.txt
```

### Behavior

- Parse each line into hash and path
- Emit one record per line with `filehash` and `filepath`
- No filesystem access — files may not be mounted
- Skip malformed lines (log to stderr)
- Stream-oriented like `listing`: process lines as they arrive via a TransformStream

### Relation to existing sources

- `fs` walks a directory, hashes files, collects metadata → use when the drive is mounted
- `listing` reads a file listing, stats+hashes files → use when files are accessible but you only have a path list
- `shasum` reads a sha256sum listing → use when the drive is unmounted and you already have hashes

## Consequences

- Unmounted archive snapshots can be ingested into csvs without mounting the drive
- The hash-path pairs from sha256sum listings flow through the same panrec pipeline as live filesystem data
- Metadata (filesize, moddate, filetype) is not available from sha256sum listings — collect it separately via `fs` when the drive is mounted
