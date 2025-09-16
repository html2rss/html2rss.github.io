---
title: 'Scraping a Simple Blog List'
---

# Tutorial: Scraping a Simple Blog List

This example demonstrates how to create a feed from a typical blog that has a list of articles on its homepage.

---

## The Goal

We want to create an RSS feed that contains the title, link, and summary of each article on the blog.

---

## The HTML

Here's a simplified view of the HTML structure we're targeting. The key is to find a container element that wraps each blog post (in this case, `.post-item`) and then find the selectors for the title, link, and summary within that container.

```html
<div class="posts">
  <div class="post-item">
    <h2 class="post-title"><a href="/blog/post-1">First Post Title</a></h2>
    <p class="post-summary">Summary of the first post...</p>
  </div>
  <div class="post-item">
    <h2 class="post-title"><a href="/blog/post-2">Second Post Title</a></h2>
    <p class="post-summary">Summary of the second post...</p>
  </div>
</div>
```

---

## The Configuration

This configuration uses the `selectors` scraper to precisely extract the content we want.

```yaml
channel:
  url: https://example.com/blog
selectors:
  items:
    selector: ".post-item"
  title:
    selector: ".post-title a"
  url:
    selector: ".post-title a"
    extractor: "href"
  description:
    selector: ".post-summary"
```

### Configuration Breakdown

- **`items.selector: ".post-item"`**: This is the most important selector. It tells `html2rss` that every element with the class `post-item` is a single item in the RSS feed.
- **`title.selector: ".post-title a"`**: Within each `.post-item`, this finds the `<a>` tag inside the element with the class `post-title`.
- **`url.selector: ".post-title a"`**: This finds the same `<a>` tag.
- **`url.extractor: "href"`**: This extracts the URL from the `href` attribute of the `<a>` tag.
- **`description.selector: ".post-summary"`**: This finds the element with the class `post-summary`.
