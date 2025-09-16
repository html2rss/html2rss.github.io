---
title: 'Automatic Updates'
---

# Automatic Updates with Watchtower

The [watchtower](https://containrrr.dev/watchtower/) service automatically pulls running Docker images and checks for updates. If an update is available, it will automatically start the updated image with the same configuration as the running one. Please read its manual.

The `docker-compose.yml` in the [Installation Guide]({{ '/web-application/installation' | relative_url }}) contains a service description for watchtower.
