---
layout: default
title: html2rss-configs
has_children: false
nav_order: 5
---

# Creating Feed Configurations

Welcome to the guide for `html2rss-configs`. This document explains how to create your own configuration files to convert any website into an RSS feed.

You can find a list of all community-contributed configurations in the [Feed Directory]({{ '/feed-directory/' | relative_url }}).

---

## Core Concepts

An `html2rss` config is a YAML file that defines how to extract data from a web page. It consists of two main building blocks: `channel` and `selectors`.

### The `channel` Block

The `channel` block contains metadata about the RSS feed itself, such as its title and the source URL.

**Example:**

```yaml
channel:
  url: https://example.com/blog
  title: My Awesome Blog
```

For a complete list of all available channel options, please see the [Channel Reference]({{ '/ruby-gem/reference/channel/' | relative_url }}).

### The `selectors` Block

The `selectors` block is the core of the configuration, defining the rules for extracting content. It always contains an `items` selector to identify the list of articles and individual selectors for the data points within each item (e.g., `title`, `link`).

**Example:**

```yaml
selectors:
  items:
    selector: "article.post"
  title:
    selector: "h2 a"
  link:
    selector: "h2 a"
```

For a comprehensive guide on all available selectors, extractors, and post-processors, please see the [Selectors Reference]({{ '/ruby-gem/reference/selectors/' | relative_url }}).

---

## Tutorial: Your First Config

This tutorial walks you through creating a basic configuration file from scratch.

### Step 1: Identify the Target Content

First, identify the HTML structure of the website you want to create a feed for. For this example, we'll use a simple blog structure:

```html
<div class="posts">
  <article class="post">
    <h2><a href="/post/1">First Post</a></h2>
    <p>This is the summary of the first post.</p>
  </article>
  <article class="post">
    <h2><a href="/post/2">Second Post</a></h2>
    <p>This is the summary of the second post.</p>
  </article>
</div>
```

### Step 2: Create the Config File and Define the Channel

Create a new YAML file (e.g., `my-blog.yml`) and define the `channel`:

```yaml
# my-blog.yml
channel:
  url: https://example.com/blog
  title: My Awesome Blog
  description: The latest news from my awesome blog.
```

### Step 3: Define the Selectors

Next, add the `selectors` block to extract the content for each post.

```yaml
# my-blog.yml
selectors:
  items:
    selector: "article.post"
  title:
    selector: "h2 a"
  link:
    selector: "h2 a"
  description:
    selector: "p"
```

- `items`: This CSS selector identifies the container for each article.
- `title`, `link`, `description`: These selectors target the specific data points within each item. For a `link` selector, `html2rss` defaults to extracting the `href` attribute from the matched `<a>` tag.

---

## Advanced Techniques

### Dynamic Feeds with Parameters

Use the `parameters` block to create flexible configs. This is useful for feeds based on search terms, categories, or regions.

```yaml
# news-search.yml
parameters:
  query:
    type: string
    default: "technology"

channel:
  url: "https://news.example.com/search?q={query}"
  title: "News results for '{query}'"

selectors:
  items:
    selector: ".article"
  title:
    selector: "h2 a"
  url:
    selector: "h2 a"
    extractor: "href"
```

---

## Contributing Your Config

Have you created a config that others might find useful? We strongly encourage you to contribute it to the project! By sharing your config, you make it available to all users of the public `html2rss-web` service and the Feed Directory.

To contribute, please [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) to the `html2rss-configs` repository.

---

## Usage and Integration

### With `html2rss-web`

Once your pull request is reviewed and merged, your config will become available on the public [`html2rss-web`]({{ '/web-application/' | relative_url }}) instance. You can then access it at the path `/<domainname.tld/path>.rss`.

### Programmatic Usage in Ruby

You can also use `html2rss-configs` programmatically in your Ruby applications.

Add this to your Gemfile:

```ruby
gem 'html2rss-configs', git: 'https://github.com/html2rss/html2rss-configs.git'
```

And use it in your code:

```ruby
require 'html2rss/configs'

config = Html2rss::Configs.find_by_name('domainname.tld/whatever')
rss = Html2rss.feed(config)
```
