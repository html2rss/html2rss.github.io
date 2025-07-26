---
layout: default
title: Included Configs
nav_order: 2
permalink: /web-application/reference/included-configs
parent: Reference
grand_parent: Web Application
---

# Included Configs

html2rss-web comes with many feed configs out of the box. [See the file list of all configs.](https://github.com/html2rss/html2rss-configs/tree/master/lib/html2rss/configs)

To use a config from there, build the URL like this:

| | |
| --- | --- |
| `lib/html2rss/configs/` | `domainname.tld/whatever.yml` |
| Would become this URL: | |
| `http://localhost:3000/` | `domainname.tld/whatever.rss` |
| | `^^^^^^^^^^^^^^^^^^^^^^^^^^^` |
