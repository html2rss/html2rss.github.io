---
layout: default
title: Handling Dynamic Content
nav_order: 4
parent: Examples
grand_parent: Ruby Gem
permalink: /ruby-gem/examples/handling-dynamic-content
---

# Handling Dynamic Content and JavaScript

Some websites load their content dynamically using JavaScript. The default `html2rss` strategy might not see this content.

## Solution

Use the [`browserless` strategy]({{ '/ruby-gem/configuration/strategy' | relative_url }}) to render JavaScript-heavy websites with a headless browser.
