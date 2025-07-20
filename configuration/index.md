---
layout: default
title: Configuration
nav_order: 4
has_children: true
---

# Configuration

While the `html2rss auto` command is a great starting point, you'll often need to create a YAML configuration file to get the perfect RSS feed. A configuration file gives you fine-grained control over every aspect of the feed generation process.

This section provides a comprehensive guide to all the configuration options available in `html2rss`.

## Configuration Topics

- [**Auto Source**]({{ '/configuration/auto_source/' | relative_url }}): The easiest way to create a feed, with minimal configuration.
- [**Channel**]({{ '/configuration/channel/' | relative_url }}): Customize the metadata of your RSS feed.
- [**Selectors**]({{ '/configuration/selectors/' | relative_url }}): Use CSS selectors to extract content with precision.
- [**Extractors**]({{ '/configuration/selectors/extractors/' | relative_url }}): Specify how to extract information from HTML elements.
- [**Post Processors**]({{ '/configuration/selectors/post-processors/' | relative_url }}): Manipulate the extracted data to get it just right.
- [**Strategy**]({{ '/configuration/strategy/' | relative_url }}): Define how html2rss fetches website content, including JavaScript rendering options.
- [**Headers**]({{ '/configuration/headers/' | relative_url }}): Set custom HTTP headers for requests, useful for APIs and authorization.
- [**Stylesheets**]({{ '/configuration/stylesheets/' | relative_url }}): Add CSS or XSLT stylesheets to style your RSS feed in browsers.
- [**Advanced Topics**]({{ '/configuration/advanced-topics/' | relative_url }}): Learn about advanced features like strategies, custom headers, and dynamic parameters.
