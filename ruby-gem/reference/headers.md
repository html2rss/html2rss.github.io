---
layout: default
title: Headers
nav_order: 6
parent: Reference
grand_parent: Ruby Gem
---

# Headers

The `headers` key allows you to set custom HTTP headers for your requests. This is useful for accessing APIs or other protected content.

## Configuration

You can add any number of headers to your configuration:

```yaml
headers:
  User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  Authorization: "Bearer YOUR_TOKEN"
  Accept: "application/json"
```

## Dynamic Parameters

You can also use dynamic parameters in your headers to pass values at runtime. See [Dynamic Parameters]({{ '/ruby-gem/how-to/dynamic-parameters' | relative_url }}) for more information.
