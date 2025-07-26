---
layout: default
title: Extractors
parent: Selectors
grand_parent: Configuration
nav_order: 1
permalink: /ruby-gem/configuration/selectors/extractors
---

# Extractors

Extractors help with extracting information from the selected HTML element. You specify the extractor to use on a selector.

```yaml
selectors:
  url:
    selector: "a"
    extractor: "href"
```

---

## Available Extractors

- **`text`** (default): Returns the element's inner text.
- **`html`**: Returns the element's outer HTML.
- **`href`**: Returns a URL from the element's `href` attribute and corrects relative URLs to absolute ones.
- **`attribute`**: Returns the value of an element's attribute. You must specify the `attribute` name.
- **`static`**: Returns a configured static value. You must specify the `value`.

---

## Extractor Examples

### `attribute`

```yaml
selectors:
  image:
    selector: "img"
    extractor: "attribute"
    attribute: "src"
```

### `static`

```yaml
selectors:
  author:
    extractor: "static"
    value: "John Doe"
```

For a full list of extractors and their options, please refer to the [official YARD documentation](https://www.rubydoc.info/gems/html2rss/Html2rss/Selectors/Extractors).
