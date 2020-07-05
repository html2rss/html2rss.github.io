---
layout: default
parent: Components
nav_order: 1
title: html2rss gem
description: html2rss build RSS 2.0 feeds from websites (and JSON APIs) with a few CSS selectors.
summary: a Ruby gem to build RSS 2.0 feeds
---

{{ page.description }}
{: .fs-8 }

---

The [html2rss gem](https://rubygems.org/gems/html2rss) generates a Ruby RSS object from a _feed config_. It does so by scraping and extracting the website.

Scraping involves a tad more than just selecting an HTML element's text contents.

- You want to sanitize HTML.
- You might find useful information in a `data` attribute in the page's source.
- You need to convert relative URLs to absolute ones.
- You want to parse dates & times in the publishers' time zone.
- Maybe the website is a JSON API and you want that response converted to a RSS feed?
- You might need to send requests with Authorization or Cookie HTTP headers.
- You want to scrape several syntactically equal pages on one website without duplicating the configs.
- You want to create a custom item description from other attributes.

The documentation covers everything the gem is capable of. If you want to dive deeper, read the [gem's README](https://github.com/gildesmarais/html2rss/blob/master/README.md) or check [the YARD Docs](https://www.rubydoc.info/gems/html2rss).

The gem's code is automatically tested. There's also code documentation for the API, usually with examples. However, looking inside the test suite to find to find more complex examples is recommended.

[See the project on Github](https://github.com/gildesmarais/html2rss){: .btn .btn-purple }
