---
layout: default
title: Automatic Updates
nav_order: 3
parent: How-To Guides
grand_parent: Web Application
---

# Automatic Updates with Watchtower

The [watchtower](https://containrrr.dev/watchtower/) service automatically pulls running Docker images and checks for updates. If an update is available, it will automatically start the updated image with the same configuration as the running one. Please read its manual.

The `docker-compose.yml` in the [Installation Guide]({{ '/web-application/installation' | relative_url }}) contains a service description for watchtower.
