---
title: 'Versioning and releases'
---

# Versioning and releases

This web application is distributed in a [rolling release](https://en.wikipedia.org/wiki/Rolling_release) fashion from the `master` branch.

For the latest commit passing GitHub CI/CD on the master branch, an updated Docker image will be pushed to [Docker Hub: `gilcreator/html2rss-web`](https://hub.docker.com/r/gilcreator/html2rss-web).
The [SBOM](https://en.wikipedia.org/wiki/Software_supply_chain) is embedded in the Docker image.

GitHub's @dependabot is enabled for dependency updates and they are automatically merged to the `master` branch when the CI gives the green light.

If you use Docker, you should update to the latest image automatically by [setting up _watchtower_ as described]({{ '/web-application/how-to/automatic-updates' | relative_url }}).
