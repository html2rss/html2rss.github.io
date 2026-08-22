# Repository Guidelines

## Scope and Ownership

This repository (`html2rss.github.io/`) is the public docs and feed-directory site built with Astro/Starlight.
Classify most work here as `docs`.

What this repo owns:

- docs content and navigation under `src/content/docs/`
- docs-specific components and styling under `src/components/`
- feed-directory presentation and client behavior (`src/components/feed-directory/`)

What this repo does not own:

- runtime extractor behavior and CLI semantics (`html2rss/`)
- catalog metadata, YAML configs, or catalog serialization (`html2rss-configs/` → `Html2rss::Configs::Catalog`)
- catalog HTTP API (`html2rss-web/` → `GET /api/v1/configs`)

When docs describe behavior from other repos, treat those repos as source-of-truth and update docs to match them.

## Cross-Repo Contracts

Before substantial edits, state cross-repo context in your notes:

- Source-of-truth repo
- Downstream consumer repo(s)
- Whether this change needs coordinated follow-up outside `html2rss.github.io/`

Common contracts:

- Feed Directory browse data comes from `{instance}/api/v1/configs` on a running `html2rss-web` instance (see OpenAPI in `html2rss-web`).
- Instance URL persistence: default public instance, `#!url=` hash deep link from the web app, browser localStorage, and filter state in URL query params (`q`, `topic`, `lang`, `sort`, `page`).
- Deep link from `html2rss-web`: `https://html2rss.github.io/feed-directory/#!url={encodedInstanceUrl}` must keep working.
- Catalog metadata in YAML (`directory.title`, `directory.summary`, `directory.topics`) is authored in `html2rss-configs` only.
- Ruby gem docs should match `html2rss` behavior and CLI output.
- Web application docs should match `html2rss-web` behavior and published OpenAPI.

If a cross-repo behavior changed but upstream is not updated yet, document the gap clearly instead of inventing new behavior.

## Feed Directory (agent maintenance)

- The browse UI is a **thin client**: fetch catalog JSON from the active instance, render rows client-side, build RSS links from each entry's `path`.
- Do not reintroduce `bin/data-update`, `src/data/configs.json`, or a `html2rss-configs` gem dependency in this repo.
- Wire shape v1 is defined in `html2rss-web` request specs and OpenAPI (`catalog_version`, `parameters.schema`, `parameters.defaults`).
- When the instance is unreachable or returns `404` with `catalog_disabled`, show an error state — no static fallback list.
- **Wire parsing only in** `src/components/feed-directory/adapters/catalog-api.ts`. Domain modules must not parse API envelopes or wire rows.
- See `CONTEXT.md` for glossary (`FeedDirectoryEntry`, catalog seam, instance persistence contract).

### Module layout (`src/components/feed-directory/`)

| Layer    | Path        | Role                                                                                       |
| -------- | ----------- | ------------------------------------------------------------------------------------------ |
| adapters | `adapters/` | Catalog API fetch/parse, browser storage, URL filters, OPML download                       |
| domain   | `domain/`   | Pure behavior — filters, language, feed URLs, OPML build; no `window` / `document`         |
| app      | `app/`      | State transitions (`directory-state.ts`), view model, event wiring (`FeedDirectoryApp.ts`) |
| ui       | `ui/`       | HTML rendering from `FeedDirectoryViewModel`                                               |
| lib      | `lib/`      | Shared utilities (escape, debounce)                                                        |

Entry point: `feed-directory/FeedDirectory.astro` mounts `FeedDirectoryApp` directly.

## Generated Artifacts

This repo has no generated catalog data. Do not add a packaged-config snapshot back into the docs build.

## Build, Test, and Dev Commands

Run commands from `html2rss.github.io/`:

- `make setup` installs npm dependencies
- `make dev` runs Astro locally
- `make build` builds production output
- `make lint` checks formatting
- `make lintfix` applies formatting fixes
- `make test` runs Vitest on feed-directory pure modules
- `make check` runs `lint` and `test`

Preferred verification flow for docs/content changes:

1. Run targeted check(s) first (`make lint`, `make test`, or `make build`).
2. Run the broader check set before PR (`make lint`, `make test`, and `make build`).
3. For feed-directory UI changes, spot-check against a running instance with catalog enabled (`GET /api/v1/configs` returns entries).

## Docs Authoring Rules

### User Journey Funnel

Maintain a directed "funnel" for documentation to maximize user success and conversion:

1.  **Phase 1: Quickstart (Local Demo)** — The primary entry point. Run `html2rss-web` with Docker and generate a feed from a page URL in minutes.
2.  **Phase 2: Production (Deployment)** — The goal for invested users. Move to a stable, production-ready instance.
3.  **Phase 3: Refinement (Custom Configs)** — Secondary optimization. Author custom YAML configs only when automatic generation needs precise control.

**Rules for Funnel Maintenance:**

- Avoid branching paths in introductory pages; always point toward the next phase in the funnel.
- Define "html2rss-web" as the primary interface and "page-to-RSS" as the primary workflow.
- Use "Feed Directory" consistently to refer to the pre-built feed catalog; avoid terms like "catalog", "included feeds", or "packaged configs" in user-facing docs.
- Do not introduce new terminology (e.g., "toolkit") or unrelated infrastructure concepts (e.g., "custom domains") unless they are essential to a specific guide.

### Code Snippets

In docs content (`src/content/docs/**`) and docs-supporting components:

- Do not use triple-backtick fenced code blocks.
- Always render snippets with the `<Code>` component.
- Use this import:
  `import { Code } from '@astrojs/starlight/components';`
- Do not use:
  `import Code from "astro/components/Code.astro";`
- Prefer multiline template literals: `code={\`...\`}`.
- Give every content line the same 2-space base indent (Starlight strips the common indent on render).
- Do not put blank lines inside the template — Prettier MDX strips indentation after blank lines and corrupts nested YAML/Ruby. Separate sections with `#` comment lines instead.
- Do not use `"...\n" +` string concat for snippets unless a concrete Prettier conflict remains after following the no-blank-line rule (should be rare).

### Accuracy Rules

- Prefer concrete, verifiable statements over aspirational wording.
- Keep repo and path references explicit when guidance is cross-repo.
- When referencing commands that belong to another repo, include that repo directory in the command example.

## Commit and PR Expectations

- Keep each commit scoped to one logical docs change.
- Do not mix unrelated changes or unrelated generated diffs.
- In PRs, call out:
  - cross-repo assumptions
  - generated files updated
  - verification commands run
