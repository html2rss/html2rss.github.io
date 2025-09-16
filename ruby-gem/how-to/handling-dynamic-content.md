---
title: 'Handling Dynamic Content'
---


Some websites load their content dynamically using JavaScript. The default `html2rss` strategy might not see this content.

## Solution

Use the [`browserless` strategy]({{ '/ruby-gem/reference/strategy' | relative_url }}) to render JavaScript-heavy websites with a headless browser.
