---
layout: default
title: Headers
nav_order: 6
parent: Reference
grand_parent: Ruby Gem
---

# `headers`

The `headers` key allows you to set custom HTTP headers for your requests. This is useful for accessing protected content or interacting with APIs.

```yaml
headers:
  User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  Authorization: "Bearer YOUR_TOKEN"
```

You can also set headers for APIs that require authorization or custom headers.

Dynamic parameters can be used in headers to pass values at runtime. See [Dynamic Parameters]({{ '/ruby-gem/how-to/dynamic-parameters' | relative_url }}) for more details.

## Example Configuration

This example demonstrates how to add custom HTTP headers to your feed request:

```yaml
channel:
  url: https://example.com/protected-content
  headers:
    User-Agent: "Mozilla/5.0 (compatible; html2rss/1.0)"
    Authorization: "Bearer your_api_token_here"
selectors:
  items:
    selector: ".article"
  title:
    selector: "h2.title"
  url:
    selector: "h2.title a"
    extractor: "href"
  description:
    selector: ".summary"
```

### Explanation

- **`channel.headers`**: Defines custom HTTP headers to include in the request.
- **`User-Agent`**: Some websites require a specific user agent string.
- **`Authorization`**: Example of an API token for protected content.
- The rest of the configuration extracts articles as usual.

Use this configuration to access content that requires authentication or specific headers.
