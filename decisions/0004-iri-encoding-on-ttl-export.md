# IRI encoding as a TTL export flag

Status: proposed
Date: 2026-04-24
Relates: ADR-0003 (TTL export)

## Context

TTL output requires subject IRIs to be valid per RFC 3987. Values arriving from upstream (jq, csvs) may contain characters unsafe in IRIs — spaces, `%`, `"`, `<>`, brackets, control characters, surrogates, PUA, noncharacters (see alhidad ADR-0001 §IRI encoding for the full list).

IRI encoding could live in jq (as a custom function) or in panrec (as a flag on TTL export). jq can do it but it's awkward — percent-encoding byte-by-byte in jq requires manual UTF-8 arithmetic. panrec already handles the serialization boundary where values become IRIs, so it's the natural place.

## Decision

The TTL export accepts a flag that enables IRI encoding of subject values. When enabled, panrec percent-encodes IRI-unsafe characters byte-by-byte in subject IRIs before serialization. The encoding preserves UTF-8 (Cyrillic, CJK, etc.) and `/` as a hierarchical separator.

Characters percent-encoded:

- control characters (`U+0000`–`U+001F`)
- space, `%`, `"`, `<`, `>`, `[`, `]`, `^`, `` ` ``, `{`, `|`, `}`
- DEL (`U+007F`)
- surrogates (`U+D800`–`U+DFFF`)
- private use area (`U+E000`–`U+F8FF`)
- noncharacters (`U+FFFE`, `U+FFFF`)

This is the same character list as alhidad ADR-0001 §IRI encoding and `dir_iri()` in estate's `csvs-to-oxi.py`.

## Consequences

- jq scripts don't need to reimplement percent-encoding — they pass raw values, panrec encodes on output
- The encoding is defined once in panrec, not duplicated per pipeline
- The flag is TTL-specific — other export targets (csvs, json) don't need IRI encoding
