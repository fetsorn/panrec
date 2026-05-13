# Add TTL as an export target

Status: proposed
Date: 2026-04-24

## Context

Panrec converts between plain-text dataset formats. Some downstream consumers need RDF triples in Turtle (TTL) format — for loading into triplestores, SPARQL querying, or SHACL validation. Currently panrec can export to csvs, json, and stdout, but not TTL.

The SON record model already has the structure needed: `_` names the base branch (the record type), the value of that branch is the identity, and other branches are attributes. This maps directly to RDF subject-predicate-object triples.

## Decision

Add a `ttl` export target that serializes SON records as Turtle.

### Mapping

A SON record maps to TTL as follows:

- `_` value names the base branch (e.g. `"filepath"`)
- The base branch value becomes the **subject** IRI
- `_` key becomes the `rdf:type` via `a` — the subject is typed by the base branch name
- Every other branch becomes a **predicate-object** pair

Example record:

```json
{ "_": "filepath", "filepath": "2024/photos/img.jpg", "filehash": "a1b2c3..." }
```

Serializes as:

```turtle
:2024/photos/img.jpg a :filepath ; :filehash "a1b2c3..." .
```

Example record:

```json
{ "_": "dir", "dir": "2024/photos", "parent": "2024" }
```

Serializes as:

```turtle
:2024/photos a :dir ; :parent "2024" .
```

### What panrec does

- Serialize subject from the base branch value
- Emit `a :<base branch name>` for typing
- Emit each non-base branch as `:<key> "<value>"`
- Handle Turtle escaping for string literals (quotes, newlines, backslashes)
- Accept an optional prefix/header file (`--header <file>`) whose content is prepended to the output — for `@prefix` declarations, ontology imports, etc.

### What panrec does not do

- iri encoding is done by panrec with an --iri flag see ADR 0004
- Distinguishing IRI objects from literal objects — all non-base branch values are emitted as string literals by default. If an object needs to be an IRI (e.g. `skos:broader`), the upstream tool should produce the record with the full IRI and panrec wraps it accordingly, or the schema file handles it via post-processing
- Namespace resolution — prefixes come from the header file, not from panrec
- SHACL validation, SPARQL — external tools operating on the emitted TTL

### Open question

How to distinguish literal objects from IRI objects in the record stream. Options:

1. Convention: values wrapped in `<...>` are emitted as IRIs, bare values as literals
2. A flag or schema that declares which branches are IRI-valued
3. All values are literals; a post-processing step (rapper, sed, or a schema-aware tool) promotes marked predicates to IRI references

This decision does not resolve the question. Start with all-literals and iterate based on real pipeline needs.

## Consequences

- SON records from any panrec source (fs, shasum, csvs, json) can be serialized as TTL
- The jq step between source and TTL export shapes records to match the desired ontology — panrec is format-agnostic
- Prefix declarations and ontology structure live in a separate header file, not in panrec's code
- The TTL output is loadable into any triplestore or processable by any RDF tool (rapper, rudof, arq)
- Combined with the csvs import, this enables `panrec -s csvs | jq '...' | panrec -t ttl` as the materialize pipeline
