---
layout: default
title: Auto Source
nav_order: 4
parent: Configuration
---

# `auto_source`

The `auto_source` scraper is the easiest way to create a feed. It intelligently finds items on a page without requiring you to specify CSS selectors.

You can enable it in your YAML config like this:

```yaml
channel:
  url: https://example.com
auto_source: {}
```

---

## How it Works

The `auto_source` scraper uses a series of strategies to find content:

1.  **`schema`:** It looks for structured data in the form of `<script type="json/ld">` tags. Many websites use this to provide machine-readable information about their content, often following the [Schema.org](https://schema.org/) standard.
2.  **`semantic_html`:** It searches for semantic HTML5 tags like `<article>`, `<main>`, and `<section>`. These tags are often used to define the main content of a page.
3.  **`html`:** As a last resort, it analyzes the entire HTML structure to find frequently occurring selectors that are likely to contain the main content.

---

## Fine-Tuning `auto_source`

You can customize the behavior of the `auto_source` scraper to improve its accuracy.

### Scraper Options

You can enable or disable specific scrapers and adjust their settings.

```yaml
auto_source:
  scraper:
    schema:
      enabled: false # default: true
    semantic_html:
      enabled: false # default: true
    html:
      enabled: true
      minimum_selector_frequency: 3 # default: 2
      use_top_selectors: 3 # default: 5
```

- `minimum_selector_frequency`: The minimum number of times a selector must appear to be considered a candidate for the main content.
- `use_top_selectors`: The number of top candidate selectors to consider.

### Cleanup Options

You can also clean up the results to remove unwanted items.

```yaml
auto_source:
  cleanup:
    keep_different_domain: false # default: true
    min_words_title: 4 # default: 3
```

- `keep_different_domain`: Whether to keep items that link to a different domain.
- `min_words_title`: The minimum number of words a title must have to be included.
