---
layout: default
title: html2rss-configs
has_children: false
nav_order: 5
---

# Creating Custom RSS Feeds

Want to create RSS feeds for websites that don't offer them? This guide shows you how to write simple configuration files that tell the html2rss engine exactly what content to extract.

**Don't worry if you're not technical** - we'll explain everything step by step!

You can see examples of what others have created in the [Feed Directory]({{ '/feed-directory/' | relative_url }}).

---

## How It Works

Think of the html2rss engine as a smart assistant that needs instructions. You give it a simple "recipe" (called a config file) that tells it:

1. **Which website** to look at
2. **What content** to find (articles, posts, etc.)
3. **How to organize** that content into an RSS feed

The recipe is written in YAML - a simple format that's easy to read and write. Both html2rss-web and the html2rss Ruby gem use these same configuration files.

### The `channel` Block

This tells the html2rss engine basic information about your feed - like giving it a name and telling it which website to look at.

**Example:**

```yaml
channel:
  url: https://example.com/blog
  title: My Awesome Blog
```

This says: "Look at this website and call the feed 'My Awesome Blog'"

### The `selectors` Block

This is where you tell the html2rss engine exactly what to find on the page. You use CSS selectors (like you might use in web design) to point to specific parts of the webpage.

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

This says: "Find each article, get the title from the h2 link, and get the link from the same h2 link"

**Need more details?** Check our [complete guide to selectors]({{ '/ruby-gem/reference/selectors/' | relative_url }}) for all the options.

---

## Tutorial: Your First Feed

Let's create a simple RSS feed step by step. We'll use a basic blog as our example.

### Step 1: Look at the Website

First, visit the website you want to create a feed for. Right-click and "View Page Source" to see the HTML structure. Look for patterns like this:

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

**What we see:** Each article is wrapped in `<article class="post">`, titles are in `<h2><a>` tags, and descriptions are in `<p>` tags.

### Step 2: Create Your Config File

Create a new text file and save it as `my-blog.yml` (or any name you like). Add this basic information:

```yaml
# my-blog.yml
channel:
  url: https://example.com/blog
  title: My Awesome Blog
  description: The latest news from my awesome blog.
```

This tells html2rss: "Look at this website and call the feed 'My Awesome Blog'"

### Step 3: Tell html2rss What to Find

Now add the selectors that tell html2rss exactly what content to extract:

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

**What this means:**

- `items: "article.post"` = "Find each article with class 'post'"
- `title: "h2 a"` = "Get the title from the h2 link"
- `link: "h2 a"` = "Get the link from the same h2 link"
- `description: "p"` = "Get the description from the paragraph"

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
