# Repository Guidelines

## Scope and Ownership

This repository (`html2rss.github.io/`) is the public docs and feed-directory site built with Astro/Starlight.
Classify most work here as `docs`.

What this repo owns:

- docs content and navigation under `src/content/docs/`
- docs-specific components and styling under `src/components/`
- feed-directory presentation and client behavior
- generated docs data consumed by the site (`src/data/configs.json`)

What this repo does not own:

- runtime extractor behavior and CLI semantics (`html2rss/`)
- web API behavior and OpenAPI generation (`html2rss-web/`)
- feed YAML catalog definitions (`html2rss-configs/`)

When docs describe behavior from other repos, treat those repos as source-of-truth and update docs to match them.

## Cross-Repo Contracts

Before substantial edits, state cross-repo context in your notes:

- Source-of-truth repo
- Downstream consumer repo(s)
- Whether this change needs coordinated follow-up outside `html2rss.github.io/`

Common contracts:

- Feed directory data comes from `html2rss-configs` via `bin/data-update`.
- Ruby gem docs should match `html2rss` behavior and CLI output.
- Web application docs should match `html2rss-web` behavior and published OpenAPI.

If a cross-repo behavior changed but upstream is not updated yet, document the gap clearly instead of inventing new behavior.

## Generated Artifacts

Treat `src/data/configs.json` as generated.

- Do not hand-edit it.
- Regenerate with repo-native commands:
  - `make update`
  - or `bin/data-update` (after dependencies are installed)
- `bin/data-update` reads packaged configs (from `html2rss-configs`) and writes `src/data/configs.json`.

If a change only affects generated data, include the source change rationale in the PR description.

## Build, Test, and Dev Commands

Run commands from `html2rss.github.io/`:

- `make setup` installs dependencies and refreshes generated data
- `make dev` runs Astro locally
- `make build` builds production output
- `make lint` checks formatting
- `make lintfix` applies formatting fixes
- `make update` refreshes feed-directory data from packaged configs

Preferred verification flow for docs/content changes:

1. Run targeted check(s) first (`make lint` or `make build`).
2. Run the broader check set before PR (`make lint` and `make build`).
3. If feed directory or config references changed, run `make update` and verify resulting diffs.

## Docs Authoring Rules

### Code Snippets

In docs content (`src/content/docs/**`) and docs-supporting components:

- Do not use triple-backtick fenced code blocks.
- Always render snippets with the `<Code>` component.
- Use this import:
  `import { Code } from '@astrojs/starlight/components';`
- Do not use:
  `import Code from "astro/components/Code.astro";`

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
