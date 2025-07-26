---
layout: default
title: Troubleshooting
nav_order: 6
---

# Troubleshooting html2rss

Encountering issues while creating your RSS feeds? Don't worry, it happens! This section provides solutions to common problems and tips for debugging your html2rss configurations.

---

## Before You Start: Essential Tools for Troubleshooting

To effectively troubleshoot `html2rss` feeds, you'll primarily use your web browser's developer tools. These tools help you inspect the structure of web pages to find the right selectors.

- **How to open:** Right-click on any element on a webpage and select "Inspect" or "Inspect Element." Look for tabs like "Elements" or "Inspector."

---

### 1. No Items in the Feed / Empty Feed

**Possible Causes:**

- **Incorrect `url`:** Double-check that the `url` in your configuration file is correct and accessible.
- **Incorrect `items.selector`:** The most common reason. The CSS selector for your items might not be matching any elements on the page.
- **Website Structure Changed:** Websites frequently update their HTML structure. Your selectors might have become outdated.

**Solutions:**

- **Verify URL:** Open the `url` in your browser to ensure it's correct.
- **Inspect Element:** Use your browser's "Inspect Element" (or "Developer Tools") feature to examine the HTML structure of the target website. This allows you to see the underlying code of the webpage. Carefully identify the CSS classes or IDs of the elements you want to scrape.
- **Test Selectors:** In your browser's developer console (usually accessible within the Developer Tools), you can test CSS selectors directly. For example, typing `document.querySelectorAll('.post-item')` and pressing Enter will show you all elements on the current page that match that specific selector. This is a quick way to verify if your selector is correct before putting it into your `html2rss` configuration.

---

### 2. Item Parts (Title, Link, Description) Are Missing or Incorrect

**Possible Causes:**

- **Incorrect `selector` for the part:** Similar to `items.selector`, the selector for `title`, `link`, `description`, etc., might be wrong or outdated. Remember these selectors are relative to the `items.selector` match (i.e., they look for elements _within_ each item found by `items.selector`).
- **Incorrect `extract` attribute:** You might be trying to `extract: text` (to get the visible text) when you need `extract: href` (to get a link URL), or another attribute like `src` for an image.
- **Content is dynamically loaded:** Some websites load content using JavaScript _after_ the initial page load. `html2rss` primarily works with the initial HTML content it receives, not content that appears later through JavaScript.

**Solutions:**

- **Inspect Element:** Again, use browser developer tools to find the exact selectors and attributes you need. Pay close attention to the HTML structure around the missing content.
- **Check `extract` value:** Double-check that you're extracting the correct attribute (e.g., `text`, `href`, `src`).
- **Dynamic Content:** If the content you're trying to scrape only appears after a delay, or after you scroll down, or after clicking something in your browser, `html2rss` might not see it. This is a limitation for purely static scraping.
  - **How to check for dynamic content:** Load the page in your browser, then immediately disable JavaScript (often an option in developer tools or browser settings) and refresh the page. If the content disappears, it's likely dynamically loaded.
  - **Alternatives:** Consider if the website offers an API (Application Programming Interface) or a different URL that provides the content directly in a static format (like JSON or a simpler HTML page).

---

### 3. Date/Time Parsing Issues

**Possible Causes:**

- **Incorrect `time_format`:** The `time_format` in your configuration might not match the actual date string format on the website.
- **Incorrect `time_zone`:** The time zone might be off, leading to incorrect timestamps.

**Solutions:**

- **Match `time_format`:** Refer to [Ruby's `strptime` documentation](https://ruby-doc.org/core-3.0.0/Time.html#method-c-strptime) to ensure your format string (`%Y-%m-%d`, `%H:%M:%S`, etc.) accurately reflects the date string you're scraping.
- **Specify `time_zone`:** If the website's dates are in a specific time zone, explicitly set `time_zone` (e.g., `Europe/Berlin`, `America/New_York`).

---

### 4. html2rss Command Not Found

**Possible Causes:**

- **Not in PATH:** The `html2rss` executable might not be in your system's PATH. This means your operating system doesn't know where to find the `html2rss` command when you type it.
- **Installation Issue:** `html2rss` might not have been installed correctly.

**Solutions:**

- **Re-install:** First, try reinstalling `html2rss` to ensure all components are in place:
  ```bash
  gem install html2rss
  ```
- **Check Your PATH (Advanced):**
  - **What is PATH?** The `PATH` is an environment variable that tells your shell where to look for executable programs.
  - **How to check:**
    - **macOS/Linux:** Open your terminal and type `echo $PATH`. You'll see a list of directories separated by colons.
    - **Windows (Command Prompt):** Open Command Prompt and type `echo %PATH%`. You'll see a list of directories separated by semicolons.
  - **What to look for:** You need to ensure that the directory where Ruby gems install their executables is included in your `PATH`. Common locations include:
    - `~/.rbenv/shims` (if using rbenv)
    - `~/.rvm/bin` (if using RVM)
    - `/usr/local/bin`
    - A directory specific to your Ruby installation (e.g., `/usr/bin/gem`).
  - **How to add to PATH (if missing):** This is an advanced step and varies by operating system and shell. You typically add a line to your shell's configuration file (e.g., `.bashrc`, `.zshrc`, `.profile` on macOS/Linux, or system environment variables on Windows) like:
    ```bash
    export PATH="/path/to/gem/bin:$PATH"
    ```
    After modifying, you'll need to restart your terminal or run `source ~/.bashrc` (or your respective config file). If you're unsure, searching online for "add Ruby gem bin to PATH [your operating system]" can provide detailed instructions.

---

---

### Still Stuck?

If you've tried these solutions and are still facing issues, please don't hesitate to reach out:

- **Open an Issue on GitHub:** Provide your configuration file, the target URL, and a detailed description of the problem.
- **Check the Community:** Look for similar issues or discussions on the project's GitHub page.

Providing as much detail as possible (your config, the exact URL, error messages, what you've tried) will help us assist you more effectively.
