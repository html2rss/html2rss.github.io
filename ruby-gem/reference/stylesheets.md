---
layout: default
title: Stylesheets
nav_order: 5
parent: Reference
grand_parent: Ruby Gem
permalink: /ruby-gem/reference/stylesheets
---

# Stylesheets

The `stylesheets` key allows you to add CSS or XSLT stylesheets to your RSS feed, improving its appearance in web browsers.

## Configuration

You can add multiple stylesheets to your configuration:

```yaml
stylesheets:
  - href: "/path/to/style.xls"
    media: "all"
    type: "text/xsl"
  - href: "https://example.com/rss.css"
    media: "all"
    type: "text/css"
```

## Further Reading

- [How to Format RSS with CSS](https://www.lifewire.com/how-to-format-rss-3469302)
- [XSLT: Extensible Stylesheet Language Transformations](https://developer.mozilla.org/en-US/docs/Web/XSLT)
