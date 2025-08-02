---
layout: default
title: Post Processors
parent: Selectors
nav_order: 2
---

# Post Processors

Post processors can be used to manipulate the extracted information. You can specify one or more post processors, and they will be applied in the order they are listed.

```yaml
selectors:
  title:
    selector: "h1"
    post_process:
      - name: "gsub"
        pattern: "foo"
        replacement: "bar"
      - name: "substring"
        start: 0
        length: 10
```

---

## Available Post Processors

- **`gsub`**: Performs a global substitution on a string.
- **`html_to_markdown`**: Converts HTML to Markdown.
- **`markdown_to_html`**: Converts Markdown to HTML.
- **`parse_time`**: Parses a string containing a time.
- **`parse_uri`**: Parses a string as a URL.
- **`sanitize_html`**: Strips unsafe and unneeded HTML.
- **`substring`**: Extracts a part of a string.
- **`template`**: Creates a new string from a template.

⚠️ Always use the `sanitize_html` post processor for HTML content. Never trust the internet! ⚠️

---

## Post Processor Examples

### `gsub`

```yaml
post_process:
  - name: "gsub"
    pattern: "foo"
    replacement: "bar"
```

### `template`

The `template` post processor allows you to create a new string from a template, using values from other selectors.

```yaml
selectors:
  price:
    selector: ".price"
  description:
    selector: ".section"
    post_process:
      - name: template
        string: |
          # %{self}

          Price: %{price}
      - name: markdown_to_html
```

For a full list of post processors and their options, please refer to the [official YARD documentation](https://www.rubydoc.info/gems/html2rss/).
