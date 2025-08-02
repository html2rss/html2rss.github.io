---
layout: default
title: Use the included configs
parent: How-To Guides
grand_parent: Web Application
nav_order: 3
---

# How to use the included configs

html2rss-web comes with many feed configs out of the box. [See the file list of all configs.](https://github.com/html2rss/html2rss-configs/tree/master/lib/html2rss/configs)

To use a config from there, build the URL like this:

|                          |                               |
| ------------------------ | ----------------------------- |
| `lib/html2rss/configs/`  | `domainname.tld/whatever.yml` |
| Would become this URL:   |                               |
| `http://localhost:3000/` | `domainname.tld/whatever.rss` |
|                          | `^^^^^^^^^^^^^^^^^^^^^^^^^^^` |
