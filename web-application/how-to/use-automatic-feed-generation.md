---
layout: default
title: Use automatic feed generation
nav_order: 2
parent: How-To Guides
grand_parent: Web Application
---

# How to use automatic feed generation

> This feature is disabled by default.

To enable the `auto_source` feature, comment in the env variables in the `docker-compose.yml` file from above and change the values accordingly:

```yaml
environment:
  ## … snip ✁
  AUTO_SOURCE_ENABLED: "true"
  AUTO_SOURCE_USERNAME: foobar
  AUTO_SOURCE_PASSWORD: A-Unique-And-Long-Password-For-Your-Own-Instance
  ## to allow just requests originating from the local host
  AUTO_SOURCE_ALLOWED_ORIGINS: 127.0.0.1:3000
  ## to allow multiple origins, seperate those via comma:
  # AUTO_SOURCE_ALLOWED_ORIGINS: example.com,h2r.host.tld
  ## … snap ✃
```

Restart the container and open <http://127.0.0.1:3000/auto_source/>.
When asked, enter your username and password.

Then enter the URL of a website and click on the _Generate_ button.
