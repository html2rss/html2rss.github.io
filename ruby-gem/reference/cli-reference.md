---
layout: default
title: CLI Reference
nav_order: 7
parent: Reference
grand_parent: Ruby Gem
permalink: /ruby-gem/reference/cli-reference
---

# CLI Reference

This section provides a reference for the `html2rss` command-line interface (CLI).

For detailed documentation on the Ruby API, please refer to the official YARD documentation.

[**📚 View the Ruby API Docs on rubydoc.info**](https://www.rubydoc.info/gems/html2rss)

---

### Command-Line Interface (CLI)

The `html2rss` executable provides the primary way to interact with the tool from your terminal.

#### `html2rss auto <URL>`

Automatically generates an RSS feed from the provided URL.

- `<URL>` (Required): The URL of the website to generate a feed from.

**Example:**

```bash
html2rss auto https://unmatchedstyle.com/
```

#### `html2rss feed <CONFIG_FILE>`

Generates an RSS feed based on the provided YAML configuration file.

- `<CONFIG_FILE>` (Required): Path to your YAML configuration file.

**Examples:**

```bash
# Generate and print to console
html2rss feed my_feed.yml

# Generate and save to an XML file
html2rss feed my_feed.yml > my_feed.xml
```

#### `html2rss help`

Displays the help message with available commands and options.

#### `html2rss --version`

Displays the currently installed version of `html2rss`.
