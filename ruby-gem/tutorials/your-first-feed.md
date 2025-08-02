---
layout: default
title: Your First Feed
nav_order: 2
parent: Tutorials
grand_parent: Ruby Gem
---

# Your First Feed: A Step-by-Step Guide

Welcome to `html2rss`! This guide will walk you through creating your first RSS feed. We'll start with the easiest method and gradually introduce more powerful options.

---

## Step 1: The "No-Config" Method (`auto`)

The easiest way to create a feed is with the `auto` command. It requires no configuration file and intelligently scrapes the page to find content.

Open your terminal and run this command:

```bash
html2rss auto https://unmatchedstyle.com/
```

`html2rss` will analyze the website and generate an RSS feed for you, printing it directly to the console. This is a great way to see if `html2rss` can automatically handle your target website.

**Is the result not quite right?** Let's move to the next step.

---

## Step 2: The "Full Control" Method (`selectors`)

When you need to extract content with precision, the `selectors` scraper is the tool for the job. This method gives you complete control over what content is included in your feed by using CSS selectors.

Let's create a feed for Stack Overflow's "Hot Network Questions".

1.  **Create a file** named `stackoverflow.yml`.
2.  **Add the following content:**

    ```yaml
    channel:
      url: https://stackoverflow.com/questions
    selectors:
      items:
        selector: "#hot-network-questions > ul > li"
      title:
        selector: "a"
      url:
        selector: "a"
        extractor: "href"
    ```

3.  **Run the `feed` command:**

    ```bash
    html2rss feed stackoverflow.yml
    ```

This configuration tells `html2rss`:

- The main container for all items is `<ul id="hot-network-questions">`.
- Each item is inside a `<li>` tag.
- The `title` of each item is the text of the `<a>` tag.
- The `url` of each item is the `href` attribute of the `<a>` tag.

This is just the beginning! From here, you can dive deep into the full range of [configuration options]({{ '/ruby-gem/configuration' | relative_url }}) to create the perfect feed.
