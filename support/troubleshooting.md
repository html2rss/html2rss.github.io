---
layout: default
title: Troubleshooting
nav_order: 6
---

# Troubleshooting

This guide provides solutions to common issues encountered when using `html2rss`.

## Essential Tools

Your browser's developer tools are essential for troubleshooting. Use them to inspect the HTML structure of a webpage and find the correct CSS selectors.

- **To open:** Right-click an element on a webpage and select "Inspect" or "Inspect Element."

## Common Issues

### Empty Feeds

If your feed is empty, check the following:

- **URL:** Ensure the `url` in your configuration is correct and accessible.
- **`items.selector`:** Verify that the `items.selector` matches the elements on the page.
- **Website Changes:** Websites change their HTML structure frequently. Your selectors may be outdated.

### Missing Item Parts

If parts of your items (e.g., title, link) are missing, check the following:

- **Selector:** Ensure the selector for the missing part is correct and relative to the `items.selector`.
- **Extractor:** Verify that you are using the correct `extractor` (e.g., `text`, `href`, `attribute`).
- **Dynamic Content:** `html2rss` does not execute JavaScript. If the content is loaded dynamically, `html2rss` may not be able to see it.

### Date/Time Parsing Errors

If you are having issues with date/time parsing, check the following:

- **`time_format`:** Ensure the `time_format` in your configuration matches the date string on the website.
- **`time_zone`:** Specify the correct `time_zone` if the website uses a specific time zone.

### `html2rss` Command Not Found

If you are getting a "command not found" error, try the following:

- **Re-install:** Re-install `html2rss` to ensure it is installed correctly: `gem install html2rss`.
- **Check `PATH`:** Ensure that the directory where Ruby gems are installed is in your system's `PATH`.

## Tips & Tricks

- **Mobile Redirects:** Check that the channel URL does not redirect to a mobile page with a different markup structure.
- **`curl` and `pup`:** For static sites, use `curl` and `pup` to quickly find selectors: `curl URL | pup`.
- **CSS Selectors:** For a comprehensive overview of CSS selectors, see the [W3C documentation](https://www.w3.org/TR/selectors-4/#overview).

## Still Stuck?

If you are still having issues, please [open an issue on GitHub](https://github.com/html2rss/html2rss/issues).
