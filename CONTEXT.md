# Feed Directory glossary

Terms used across the `src/components/feed-directory/` module tree.

## Feed Directory

The browse UI embedded on `/feed-directory/`. It is a thin client: it loads catalog JSON from an active `html2rss-web` instance, renders rows client-side, and builds RSS links from each entry's `path`.

## FeedDirectoryEntry

Normalized domain type for one catalog row after wire parsing. Required fields only — no OpenAPI nullability leaks into filters or render code. Produced exclusively by `adapters/catalog-api.ts`.

| Field                                  | Meaning                                              |
| -------------------------------------- | ---------------------------------------------------- |
| `id`                                   | Config identifier (e.g. `bbc.com/mundo`)             |
| `path`                                 | RSS path on the instance (e.g. `/bbc.com/mundo.rss`) |
| `siteKey`                              | Host key derived from `id` for display and site sort |
| `title`, `summary`, `topics`           | Directory metadata from YAML                         |
| `channelUrl`, `language`               | Channel metadata                                     |
| `parameterSchema`, `parameterDefaults` | Dynamic feed parameters                              |

## Catalog seam

The boundary between the instance API and domain logic:

- **Wire:** `GET /api/v1/configs` envelope (`success`, `data.configs`, `meta.catalog_version`)
- **Adapter:** `adapters/catalog-api.ts` — fetch, envelope validation, row validation, version gate (supported: `[1]`)
- **Domain:** `FeedDirectoryEntry[]` consumed by filters, OPML build, and render

Wire parsing must stay in `adapters/catalog-api.ts` only.

## Instance persistence contract

| Mechanism        | Key / format                                            | Behavior                                                         |
| ---------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Default instance | `DEFAULT_INSTANCE_URL` in `adapters/browser-storage.ts` | `https://1.h2r.workers.dev/`                                     |
| Deep link        | `#!url={encodedInstanceUrl}`                            | Read on load, normalized to https/http, persisted, hash stripped |
| localStorage     | `html2rss.feedDirectory.instanceUrl`                    | Stores custom instance when different from default               |
| Filter state     | URL query params `q`, `topic`, `lang`, `sort`, `page`   | Managed by `adapters/browser-location.ts`                        |

Deep link from `html2rss-web`: `https://html2rss.github.io/feed-directory/#!url={encodedInstanceUrl}` must keep working.

## Module layout

| Layer    | Path        | Role                                               |
| -------- | ----------- | -------------------------------------------------- |
| adapters | `adapters/` | Browser I/O and catalog API wire translation       |
| domain   | `domain/`   | Pure behavior — no `window` / `document`           |
| app      | `app/`      | Orchestration — state transitions and event wiring |
| ui       | `ui/`       | HTML string rendering from view model              |
| lib      | `lib/`      | Shared utilities (escape, debounce)                |
