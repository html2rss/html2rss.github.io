---
layout: default
parent: Components
nav_order: 3
title: html2rss-configs
description: html2rss-configs is a a growing repository of html2rss feed configs.
summary: a repository of feed configs
---

{{ page.description }}
{: .fs-8 }

---

The [html2rss-config](https://github.com/gildesmarais/html2rss-configs) repository contains feed configs. Each feed config contains the instructions for the html2rss gem on how to build the RSS feed. Thus, to create a config, you need write CSS selectors and express them in YAML.

The feed config must reside in a folder named after the fully qualified domain name of the website.

The repository has its own test suite. It automatically tests each config and requires them to adhere to the conventions.

A generator scaffolds a feed config and a test for that config. It gets you started in a breeze and let's you focus on writing the selectors.

[See the project on Github](https://github.com/gildesmarais/html2rss-configs){: .btn .btn-purple }
