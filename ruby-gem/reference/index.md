---
layout: default
title: Reference
nav_order: 4
parent: Ruby Gem
has_children: true
---

# Reference

While the `html2rss auto` command is a great starting point, you'll often need to create a YAML configuration file to get the perfect RSS feed. A configuration file gives you fine-grained control over every aspect of the feed generation process.

This section provides a comprehensive guide to all the configuration options available in `html2rss`.

## Configuration Topics

- [**Auto Source**]({{ '/ruby-gem/reference/auto-source' | relative_url }}): The easiest way to create a feed, with minimal configuration.
- [**Channel**]({{ '/ruby-gem/reference/channel' | relative_url }}): Customize the metadata of your RSS feed.
- [**Selectors**]({{ '/ruby-gem/reference/selectors' | relative_url }}): Use CSS selectors to extract content with precision.
- [**Extractors**]({{ '/ruby-gem/reference/selectors/extractors' | relative_url }}): Specify how to extract information from HTML elements.
- [**Post Processors**]({{ '/ruby-gem/reference/selectors/post-processors' | relative_url }}): Manipulate the extracted data to get it just right.
- [**Strategy**]({{ '/ruby-gem/reference/strategy' | relative_url }}): Define how html2rss fetches website content, including JavaScript rendering options.
- [**Headers**]({{ '/ruby-gem/reference/headers' | relative_url }}): Set custom HTTP headers for requests, useful for APIs and authorization.
- [**Stylesheets**]({{ '/ruby-gem/reference/stylesheets' | relative_url }}): Add CSS or XSLT stylesheets to style your RSS feed in browsers.
