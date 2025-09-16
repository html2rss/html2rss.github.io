---
title: 'Advanced Features'
---

# Advanced Features

This guide covers advanced features and performance optimizations for html2rss.

## Parallel Processing

html2rss uses parallel processing to improve performance when scraping multiple items. This happens automatically and doesn't require any configuration.

### How It Works

- **Auto-source scraping:** Multiple scrapers run in parallel to analyze the page
- **Item processing:** Each scraped item is processed in parallel
- **Performance benefit:** Significantly faster when dealing with many items

### Performance Tips

1. **Use appropriate selectors:** More specific selectors reduce processing time
2. **Limit items when possible:** Use CSS selectors that target only the content you need
3. **Cache responses:** The web application caches responses automatically
4. **Choose the right strategy:** Use `faraday` for static content, `browserless` only when JavaScript is required

## Memory Optimization

html2rss is designed to be memory-efficient:

- **Frozen objects:** Parsed content is frozen to prevent accidental modifications
- **Efficient data structures:** Uses `Set` instead of `Array` for lookups
- **Minimal allocations:** Prefers bang methods to avoid unnecessary memory allocations

## Large Feed Handling

For websites with many items:

```yaml
# Use specific selectors to limit items
selectors:
  items:
    selector: ".article:not(.advertisement)" # Exclude ads
  title:
    selector: "h2" # More specific than generic selectors
```

## Error Recovery

html2rss includes built-in error handling:

- **Graceful degradation:** If one scraper fails, others continue
- **Detailed logging:** Set `LOG_LEVEL=debug` for detailed information
- **Validation:** Configuration is validated before processing

## Custom Headers for Performance

Optimize requests with appropriate headers:

```yaml
headers:
  Accept: "text/html,application/xhtml+xml" # Avoid JSON if not needed
  Accept-Encoding: "gzip, deflate" # Enable compression
  User-Agent: "html2rss/1.0" # Identify your requests
```

## Monitoring and Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=debug html2rss feed config.yml
```

### Web Application Health Checks

Use the health check endpoint to monitor feed generation:

```bash
curl -u username:password http://localhost:3000/health_check.txt
```

## Article Validation

html2rss includes built-in validation for articles to ensure feed quality:

### Validation Rules

Articles are considered valid if they have:
- A non-empty URL
- Either a title OR description (or both)
- A unique ID

### Invalid Articles

Invalid articles are automatically filtered out to prevent empty or broken feed items.

### Custom Validation

You can add custom validation by using post-processors:

```yaml
selectors:
  title:
    selector: "h2"
    post_process:
      - name: "gsub"
        pattern: "^\\s*$"
        replacement: "Untitled"
```

## Best Practices

1. **Test configurations:** Always test your configurations before deploying
2. **Monitor performance:** Use health checks to detect issues early
3. **Keep selectors simple:** Complex selectors are harder to maintain
4. **Use auto-source when possible:** It's often more reliable than manual selectors
5. **Handle errors gracefully:** Implement proper error handling in your applications
6. **Validate your data:** Ensure your selectors return valid content
