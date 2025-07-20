---
layout: default
title: Handling Dynamic Content and JavaScript
nav_order: 7
parent: Examples
---

# Handling Dynamic Content and JavaScript

Some websites load their content dynamically using JavaScript. The default `html2rss` strategy might not see this content.

## Solution

Use the [`browserless` strategy](/configuration/strategy) to render JavaScript-heavy websites with a headless browser.
