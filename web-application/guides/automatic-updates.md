---
layout: default
title: Automatic Updates
nav_order: 3
permalink: /web-application/guides/automatic-updates
parent: Guides
grand_parent: Web Application
---

# Automatic Updates with Watchtower

The [watchtower](https://containrrr.dev/watchtower/) service automatically pulls running Docker images and checks for updates. If an update is available, it will automatically start the updated image with the same configuration as the running one. Please read its manual.

The `docker-compose.yml` in the [Getting Started guide]({{ '/web-application/getting-started' | relative_url }}) contains a service description for watchtower.
