---
layout: default
title: Dynamic Parameters
nav_order: 5
parent: How-To Guides
grand_parent: Ruby Gem
---

# Dynamic Parameters in URLs and Headers

For websites with similar structures but varying content based on a parameter in the URL or headers, you can use dynamic parameters.

## Solution

You can add dynamic parameters to the `channel` and `headers` values. This is useful for creating feeds from structurally similar pages with different URLs.

```yaml
channel:
  url: "http://domainname.tld/whatever/%<id>s.html"
headers:
  X-Something: "%<foo>s"
```

You can then pass the values for these parameters when you run `html2rss`:

```bash
html2rss feed the_feed_config.yml --params id:42 foo:bar
```

---

## Explanation

- The `%<param>s` syntax in the URL and headers is a placeholder for dynamic parameters.
- You provide the actual values for these parameters at runtime using the `--params` option.
- This allows you to reuse the same feed configuration for multiple similar pages or APIs.
