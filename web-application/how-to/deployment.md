---
layout: default
title: Deploying to Production
nav_order: 2
permalink: /web-application/how-to/deployment
parent: How-To Guides
grand_parent: Web Application
---

# Deploying to Production

This app is published on Docker Hub and therefore easy to use with Docker.
The `docker-compose.yml` from the [Getting Started guide]({{ '/web-application/tutorials' | relative_url }}) is a good starting point.

If you're going to host a public instance, _please, please, please_:

- Put the application behind a reverse proxy.
- Allow outside connections only via HTTPS.
- Have an auto-update strategy (e.g., watchtower).
- Monitor your `/health_check.txt` endpoint.
- [Let the world know and add your instance to the wiki](https://github.com/html2rss/html2rss-web/wiki/Instances) -- thank you!

For information on the web application's versioning and release strategy, please refer to the [main Web Application overview]({{ '/web-application' | relative_url }}).
