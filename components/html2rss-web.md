---
layout: default
parent: Components
nav_order: 2
title: html2rss-web
description: html2rss-web app is a minimal Sinatra-based application which serves feeds via HTTP.
summary: serves feeds via HTTP
---

{{ page.description }}
{: .fs-8 }

---

html2rss-web builds and serves RSS feeds via HTTP. It's a small Sinatra-based application which serves feeds via HTTP. It uses the _feed configs_ from [html2rss-configs](./html2rss-configs) and expose the _html2rss_ generated feeds via HTTP.

**Generate your own feeds, or start instantly with the included configs.**

- It's deployable without much hassle (also via Docker).
- It has a file-based application cache to prevent _hammering_ websites
- It handles with client-side HTTP cache headers.

<p>
  Everyone can host their own <em>html2rss-web</em> instance.
  There are public instances for those who can't or won't.
</p>

[See the project on Github](https://github.com/gildesmarais/html2rss-web){: .btn .btn-purple }
