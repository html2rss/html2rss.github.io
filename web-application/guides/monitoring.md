---
layout: default
title: Monitoring
nav_order: 4
permalink: /web-application/guides/monitoring
parent: Guides
grand_parent: Web Application
---

# Monitoring

## Runtime monitoring via `GET /health_check.txt`

It is recommended to set up monitoring of the `/health_check.txt` endpoint. With that, you can find out when one of _your own_ configs breaks. The endpoint uses HTTP Basic authentication.

First, set the username and password via these environment variables: `HEALTH_CHECK_USERNAME` and `HEALTH_CHECK_PASSWORD`. If these are not set, html2rss-web will generate a new random username and password on _each_ start.

An authenticated `GET /health_check.txt` request will respond with:

- If the feeds are generatable: `success`.
- Otherwise: the names of the broken configs.

To get notified when one of your configs breaks, set up monitoring of this endpoint.

[UptimeRobot's free plan](https://uptimerobot.com/) is sufficient for basic monitoring (every 5 minutes).
Create a monitor of type _Keyword_ with this information and make it aware of your username and password.

## Application Performance Monitoring using Sentry

When you specify `SENTRY_DSN` in your environment variables, the application will be setup to use Sentry.
