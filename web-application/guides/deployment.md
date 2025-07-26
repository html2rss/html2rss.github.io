---
layout: default
title: Deploying to Production
nav_order: 2
permalink: /web-application/guides/deployment
parent: Guides
grand_parent: Web Application
---

# Deploying to Production

This app is published on Docker Hub and therefore easy to use with Docker.
The `docker-compose.yml` from the [Getting Started guide]({{ '/web-application/getting-started' | relative_url }}) is a good starting point.

If you're going to host a public instance, _please, please, please_:

- Put the application behind a reverse proxy.
- Allow outside connections only via HTTPS.
- Have an auto-update strategy (e.g., watchtower).
- Monitor your `/health_check.txt` endpoint.
- [Let the world know and add your instance to the wiki](https://github.com/html2rss/html2rss-web/wiki/Instances) -- thank you!

## Versioning and Releases

This web application is distributed in a [rolling release](https://en.wikipedia.org/wiki/Rolling_release) fashion from the `master` branch.

For the latest commit passing GitHub CI/CD on the master branch, an updated Docker image will be pushed to [Docker Hub: `gilcreator/html2rss-web`](https://hub.docker.com/r/gilcreator/html2rss-web).
The [SBOM](https://en.wikipedia.org/wiki/Software_supply_chain) is embedded in the Docker image.

GitHub's @dependabot is enabled for dependency updates and they are automatically merged to the `master` branch when the CI gives the green light.

If you use Docker, you should update to the latest image automatically by [setting up _watchtower_ as described]({{ '/web-application/guides/automatic-updates' | relative_url }}).
