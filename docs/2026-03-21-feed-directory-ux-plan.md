# Feed Directory UX Plan

Date: 2026-03-21

## Goal

Improve the `/feed-directory/` page so the first screen communicates immediate value and shows usable feed results instead of leading with explanatory copy and form-heavy UI.

This plan is based on the live page at `http://localhost:4321/feed-directory/` inspected with `chrome-mcp`.

## Current Problems

### Above the fold

- Desktop: the first feed is only barely visible at the bottom of the viewport.
- Mobile: no feed is visible above the fold.
- The viewport is dominated by:
  - page title
  - explanatory intro copy
  - a full "Instance URL" documentation section
  - two stacked controls before the list becomes useful

### Feed row design

- Each row emphasizes internal identifiers (`domain / name`) but hides the more informative `channel.url`.
- The rows feel like utility rows rather than browseable feed entries.
- The `Configure` action is presented as a control, not as context about how the feed is already ready to use.
- Mobile rows are sparse and oversized, with too much empty space around the action buttons.

## Constraints

- Do not introduce categories, tags, keywords, or other invented metadata.
- Do not frame any feed as "not ready" because default parameters already make all feeds usable.
- Work only with the fields that exist today:
  - `domain`
  - `name`
  - `channel.url`
  - `url_parameters`
  - `default_parameters`
  - `valid_channel_url`

## Strategy

### Above-the-fold strategy

The first screen should answer three questions immediately:

1. What is this?
2. Can I use it right now?
3. What should I do first?

That means the page should open with:

- little to no explanatory copy above the main interaction
- search as the primary action
- instance URL as contextual secondary state
- actual feed entries visible immediately below

The long explanation of instance URLs should move below the main browsing experience or into a collapsed/help treatment.

### Instance URL treatment

The instance URL should stop behaving like a peer form field to search.

Recommended treatment:

- show it as contextual state below search, for example:
  - `Using instance: 1.h2r.workers.dev (Change)`
- only reveal the editable input when the user chooses to change it
- reveal the editable input inline rather than using a modal or popover
- visually style it as a small pill, status row, or compact inline setting

Why:

- most users will keep the default instance
- two prominent text inputs create unnecessary mental load
- search should own the page, while instance selection should feel like supporting context
- edited instance URLs should be validated inline and gently so a broken value does not silently degrade the experience

Recommended validation behavior:

- validate only when the user interacts with the field or attempts to apply the change
- use short inline messaging such as `Enter a valid URL`
- do not block the rest of the page with heavy alerts or modal error states

### Search treatment

Search should read like the main job of the page.

Recommended treatment:

- larger input
- stronger visual prominence than any other control
- search icon
- generous border radius and spacing so it feels like a global finder, not a small filter field
- placeholder examples grounded in real searches, for example:
  - `Search sites or feeds like fia, apple, news, or blog`

### Feed row strategy

Each row should explain the feed before asking the user to act.

Recommended content hierarchy:

1. `domain / name`
2. source URL from `channel.url`
3. ready-to-use status with defaults inline when present, for example `Ready with defaults: section=news`
4. actions with clear hierarchy:
   - `RSS` primary
   - `Copy` adjacent to `RSS`
   - `Customize` secondary when defaults can be changed
   - `Edit` tertiary

This keeps all feeds framed as ready to use while still exposing how defaults work.

Recommended action labeling:

- use `Customize` for feeds whose defaults can be changed
- avoid more technical labels such as `Options` or `Change defaults`
- keep the wording plain and short

Recommended action styling:

- `RSS` uses the strongest visual treatment
- `Copy` is visible text on desktop and may collapse to a compact icon treatment on mobile if needed
- `Edit` should be de-emphasized to a ghost or low-contrast tertiary action on desktop and mobile

### High-value UI refinements

These additions stay within scope and improve scanability, consistency, and perceived quality:

- make each feed row feel like a single coherent surface instead of a label with detached controls
- clamp long source URLs to a clean single line where possible instead of allowing messy wrapping
- normalize row height as much as practical so scanning remains fast
- add subtle row hover and focus treatment, not just button hover states
- keep the primary action cluster visually tight so `RSS` and `Copy` read as the main pair
- keep the action anchor consistent across rows so the user learns one reliable target area
- improve typography hierarchy inside `domain / name`, with the feed name carrying slightly more emphasis than the domain

## Proposed Information Architecture

### New top section

- `Feed Directory`
- search-first layout with little to no intro copy above the interaction
- search input
- compact instance URL summary with change affordance
- first feed rows immediately visible

### Lower-priority content moved down

- long instance URL explanation
- hosting guidance
- community wiki link
- contribution section

## Wireframes

### Desktop

```text
+---------------------------------------------------------------+
| Feed Directory                                                |
| [ Search sites, domains, or feed names.................... ]  |
|                                                               |
| Using instance: 1.h2r.workers.dev                 [Change]    |
+---------------------------------------------------------------+

+---------------------------------------------------------------+
| adfc.de / pressemitteilungen                   [RSS] [Copy]   |
| https://www.adfc.de/presse/pressemitteilungen/       (Edit)   |
+---------------------------------------------------------------+
| apnews.com / hub                              [RSS] [Copy]    |
| https://apnews.com/%<section>s                 [Customize]    |
| Ready with defaults: section=news                     (Edit)  |
+---------------------------------------------------------------+
| avherald.com / index                          [RSS] [Copy]    |
| https://avherald.com/                                (Edit)   |
+---------------------------------------------------------------+
```

### Mobile

```text
+--------------------------------------+
| Feed Directory                       |
| [ Search........................... ]|
| Using: 1.h2r.workers.dev [Change]    |
+--------------------------------------+

+--------------------------------------+
| adfc.de / pressemitteilungen         |
| https://www.adfc.de/presse/...       |
| [RSS] [Copy]                  (Edit) |
+--------------------------------------+

+--------------------------------------+
| apnews.com / hub                     |
| https://apnews.com/%<section>s       |
| Ready with defaults: section=news    |
| [RSS] [Copy] [Customize]      (Edit) |
+--------------------------------------+
```

## Implementation Plan

### 1. Restructure page content

Update `src/content/docs/feed-directory/index.mdx`:

- replace the current intro paragraph plus full "Instance URL" section with a near action-first layout
- move longer explanatory content below the directory component
- keep contribution content lower on the page
- update `Contribute on GitHub` to link directly to:
  - `https://github.com/html2rss/html2rss-configs/tree/master/lib/html2rss/configs`

### 2. Redesign top controls

Update `src/components/FeedDirectory.astro`:

- make search the primary visible control
- demote instance URL into a compact secondary control
- hide the editable instance input behind a change affordance or disclosure
- reduce vertical space before the list begins
- style search as the visual hero of the page
- keep the top section simple and avoid introducing extra explanatory UI

### 3. Redesign feed rows

Update `src/components/FeedDirectory.astro`:

- show `channel.url` as visible secondary context
- show inline ready-to-use default context for configurable feeds
- keep `RSS` as the strongest action
- add a `Copy` action beside `RSS`
- reduce the prominence of `Edit`, ideally to a ghost or tertiary action
- rename or reposition `Configure` so it reads as optional customization, not a gate
- use `Customize` as the action label for changing defaults
- make the full row read as one card-like unit
- tighten the visual grouping of primary actions
- improve title typography so rows are easier to scan
- clamp or truncate long source URLs cleanly

### 4. Refine mobile layout

- reduce excessive vertical gaps
- reduce top chrome pressure as much as possible because the Starlight shell already consumes significant vertical space
- keep row content denser without hurting tap targets
- ensure at least one full feed row is visible above the fold on common mobile viewports
- avoid rows becoming disproportionately tall because of long text or wrapping actions
- prefer horizontal action grouping that stays on one line
- keep at least one full card plus part of the next card visible above the fold where possible so continuation is obvious

### 5. Improve empty states

Update `src/components/FeedDirectory.astro` and `src/components/feed-directory.js`:

- when search returns no matches, show a visible empty state instead of a blank list
- include the active query in the message
- point users toward the community wiki or contributing a new configuration
- include a clear next step, not just a passive “no results” message

### 6. Add interaction polish

Update `src/components/FeedDirectory.astro` and `src/components/feed-directory.js`:

- show immediate feedback on copy actions, for example `Copied` for 1-2 seconds
- ensure keyboard focus styles are crisp and obvious, especially around search and row actions
- keep any transitions very light so the page feels fast and utilitarian rather than decorative
- validate edited instance URLs inline with gentle feedback rather than failing silently
- prefer inline disclosure patterns over popovers or modal flows

### 5. Preserve existing behavior

Update `src/components/feed-directory.js` only as needed:

- keep search behavior
- keep instance URL updates
- keep parameter editing behavior
- make sure default-parameter feeds still generate working RSS links immediately

## Acceptance Criteria

- Desktop shows search and at least the first feed row clearly above the fold.
- Mobile shows search and at least one complete feed row above the fold.
- The page communicates value before documentation.
- Feed rows expose useful context, not just identifiers and buttons.
- Feeds with defaults are presented as immediately usable.
- Search is visually dominant over instance configuration.
- Empty searches produce a helpful message instead of an empty list.
- Feed rows feel visually cohesive and easy to scan.
- Long URLs do not degrade the row layout.
- Edited instance URLs provide clear inline feedback when invalid.
- Mobile actions remain on a single line in normal cases.
- Empty states provide a next step.
- Copy actions acknowledge success immediately.
- Keyboard focus is visually obvious.
- Motion remains subtle and fast.
- `Contribute on GitHub` points directly to the configs directory in the repository.
- No invented metadata is introduced.

## Notes From Live Review

Observed on the live local page with `chrome-mcp`:

- Desktop viewport was consumed by heading, intro copy, the full "Instance URL" explanation, and form controls before feed content became visible.
- Mobile viewport showed no actual feed row above the fold.
- Feed rows lower on the page showed that the current design underuses the available data, especially `channel.url`.
