---
title: 'Use in production'
---

# Use in production

This app is published on Docker Hub and therefore easy to use with Docker.
The above `docker-compose.yml` is a good starting point.

If you're going to host a public instance, _please, please, please_:

- Put the application behind a reverse proxy.
- Allow outside connections only via HTTPS.
- Have an auto-update strategy (e.g., watchtower).
- Monitor your `/health_check.txt` endpoint.
- [Let the world know and add your instance to the wiki](https://github.com/html2rss/html2rss-web/wiki/Instances) -- thank you!
