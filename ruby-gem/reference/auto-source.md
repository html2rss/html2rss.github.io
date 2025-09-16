---
title: 'Auto Source'
---

# Auto Source

The `auto_source` scraper automatically finds items on a page, so you don't have to specify CSS selectors.

To enable it, add `auto_source: {}` to your configuration:

```yaml
channel:
  url: https://example.com
auto_source: {}
```

## Default Configuration

When you use `auto_source: {}`, html2rss uses these default settings:

- **All scrapers enabled:** `schema`, `semantic_html`, `html`, and `rss_feed_detector`
- **HTML scraper settings:** `minimum_selector_frequency: 2`, `use_top_selectors: 5`
- **Cleanup settings:** `keep_different_domain: true`, `min_words_title: 3`

## How It Works

`auto_source` uses the following strategies to find content:

1.  **`schema`:** Parses `<script type="json/ld">` tags containing structured data (e.g., [Schema.org](https://schema.org/)).
2.  **`semantic_html`:** Searches for semantic HTML5 tags like `<article>`, `<main>`, and `<section>`.
3.  **`html`:** Analyzes the HTML structure to find frequently occurring selectors that are likely to contain the main content.
4.  **`rss_feed_detector`:** Automatically detects and uses existing RSS feeds on the target website. This is particularly useful when a site already has an RSS feed that can be consumed directly.

## Fine-Tuning

You can customize `auto_source` to improve its accuracy.

### Scraper Options

Enable or disable specific scrapers and adjust their settings:

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
    rss_feed_detector:
      enabled: false # default: true
```

### Cleanup Options

Remove unwanted items from the results:

```yaml
auto_source:
  cleanup:
    keep_different_domain: false # default: true
    min_words_title: 4 # default: 3
```
