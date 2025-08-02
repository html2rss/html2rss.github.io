---
layout: default
title: Selectors
parent: Reference
grand_parent: Ruby Gem
nav_order: 3
---

# Selectors

The `selectors` scraper gives you fine-grained control over content extraction using CSS selectors.

> A valid RSS item requires at least a `title` or a `description`.

## Basic Configuration

At a minimum, you need an `items` selector to define the list of articles and a `title` selector for the article titles.

```yml
channel:
  url: "https://example.com"
selectors:
  items:
    selector: ".article"
  title:
    selector: "h1"
```

## Automatic Item Enhancement

To simplify configuration, `html2rss` can automatically extract the `title`, `url`, and `image` from each item. This feature is enabled by default.

```yml
selectors:
  items:
    selector: ".article"
    enhance: true # default: true
```

## RSS 2.0 Selectors

While you can define any named selector, only the following are used in the final RSS feed:

| RSS 2.0 Tag   | `html2rss` Name |
| ------------- | --------------- |
| `title`       | `title`         |
| `description` | `description`   |
| `link`        | `url`           |
| `author`      | `author`        |
| `category`    | `categories`    |
| `guid`        | `guid`          |
| `enclosure`   | `enclosure`     |
| `pubDate`     | `published_at`  |
| `comments`    | `comments`      |

## Selector Options

Each selector can be configured with the following options:

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| `selector`     | The CSS selector for the target element.         |
| `extractor`    | The extractor to use for this selector.          |
| `post_process` | A list of post-processors to apply to the value. |

### Extractors

Extractors define how to get the value from a selected element.

- `text`: The inner text of the element (default).
- `html`: The outer HTML of the element.
- `href`: The value of the `href` attribute.
- `attribute`: The value of a specified attribute.
- `static`: A static value.

### Post-Processors

Post-processors manipulate the extracted value.

- `gsub`: Performs a global substitution on a string.
- `html_to_markdown`: Converts HTML to Markdown.
- `markdown_to_html`: Converts Markdown to HTML.
- `parse_time`: Parses a string into a `Time` object.
- `parse_uri`: Parses a string into a `URI` object.
- `sanitize_html`: Sanitizes HTML to prevent security vulnerabilities.
- `substring`: Extracts a substring from a string.
- `template`: Creates a new string from a template and other selector values.

> Always use the `sanitize_html` post-processor for any HTML content to prevent security risks.

## Advanced Usage

### Categories

To add categories to an item, provide a list of selector names to the `categories` selector.

```yml
selectors:
  genre:
    selector: ".genre"
  branch:
    selector: ".branch"
  categories:
    - genre
    - branch
```

### Custom GUID

To create a custom GUID for an item, provide a list of selector names to the `guid` selector.

```yml
selectors:
  title:
    selector: "h1"
  url:
    selector: "a"
    extractor: "href"
  guid:
    - url
```

### Enclosures

To add an enclosure (e.g., an image, audio, or video file) to an item, use the `enclosure` selector to specify the URL of the file.

```yml
selectors:
  enclosure:
    selector: "audio"
    extractor: "attribute"
    attribute: "src"
    content_type: "audio/mp3"
```
