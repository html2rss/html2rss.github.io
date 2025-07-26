---
layout: default
title: Selectors
nav_order: 6
parent: Reference
grand_parent: Ruby Gem
has_children: true
permalink: /ruby-gem/reference/selectors
---

# `selectors`

The `selectors` scraper gives you full control over the content extraction process by using CSS selectors.

To build a valid RSS 2.0 item, you need at least a `title` or a `description` in your item.

---

## `items`

The `items` selector is a required selector that defines the collection of HTML elements from which the RSS feed items are built.

```yaml
channel:
  url: "https://example.com"
selectors:
  items:
    selector: ".article"
  title:
    selector: "h1"
```

### Item Enhancement

`html2rss` automatically enhances each item by trying to find the `title`, `url`, and `image`. You can disable this behavior by setting `enhance: false` on the `items` selector.

```yaml
selectors:
  items:
    selector: ".article"
    enhance: false
```

---

## Selectors

The following selectors can be used to extract content for the RSS feed:

| RSS 2.0 tag   | Name in `html2rss` | Remark                                    |
| :------------ | :----------------- | :---------------------------------------- |
| `title`       | `title`            |                                           |
| `description` | `description`      | Will be sanitized when it contains HTML.  |
| `link`        | `url`              | A URL.                                    |
| `author`      | `author`           |                                           |
| `category`    | `categories`       | See notes below.                          |
| `guid`        | `guid`             | Generated automatically. See notes below. |
| `enclosure`   | `enclosure`        | See notes below.                          |
| `pubDate`     | `published_at`     | An instance of `Time`.                    |
| `comments`    | `comments`         | A URL.                                    |

---

## Selector Options

Each selector can have the following attributes:

| Name           | Value                                                                                                          |
| :------------- | :------------------------------------------------------------------------------------------------------------- | ----------------- |
| `selector`     | The CSS selector to select the element with the information.                                                   |
| `extractor`    | The name of the extractor to use. See [Extractors]({{ '/ruby-gem/reference/selectors/extractors'               | relative_url }}). |
| `post_process` | An array of post processors to apply. See [Post Processors]({{ '/ruby-gem/reference/selectors/post-processors' | relative_url }}). |

---

## Categories

The `categories` selector takes an array of selector names. The value of each of those selectors will become a `<category>` on the RSS item.

```yaml
selectors:
  genre:
    selector: ".genre"
  branch:
    selector: ".branch"
  categories:
    - genre
    - branch
```

---

## Custom GUID

By default, `html2rss` generates a stable GUID automatically. If this is not stable, you can choose from which attributes the GUID will be built.

```yaml
selectors:
  title:
    selector: "h1"
  url:
    selector: "a"
    extractor: "href"
  guid:
    - url
```

---

## Enclosure

An enclosure can be any file, e.g., an image, audio, or video file. The `enclosure` selector needs to return a URL of the content to enclose.

```yaml
selectors:
  enclosure:
    selector: "audio"
    extractor: "attribute"
    attribute: "src"
    content_type: "audio/mp3"
```
