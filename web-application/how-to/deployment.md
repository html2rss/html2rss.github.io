---
layout: default
title: Deploying to Production
nav_order: 2
parent: How-To Guides
grand_parent: Web Application
---

# Deploying to Production

If you're looking to host a personal instance of `html2rss-web`, the [Installation Guide]({{ '/web-application/installation' | relative_url }}) provides a detailed, step-by-step walkthrough.

For those who wish to host a public-facing instance, this page serves as a high-level checklist of best practices to ensure a secure and stable deployment.

## Production Deployment Checklist

- **Reverse Proxy**: Always put the application behind a reverse proxy. This is crucial for security and for managing incoming traffic.
- **HTTPS**: Enforce HTTPS for all outside connections to encrypt traffic and protect user data.
- **Auto-Updates**: Implement an auto-update strategy (e.g., using [Watchtower](https://containrrr.dev/watchtower/)) to ensure you're always running the latest, most secure version of the application.
- **Monitoring**: Regularly monitor the `/health_check.txt` endpoint to ensure your instance is running correctly.
- **Share Your Instance**: If you've set up a public instance, please consider [adding it to our wiki](https://github.com/html2rss/html2rss-web/wiki/Instances). This helps others discover and use the service. Thank you!

## Versioning and Releases

For information on the web application's versioning and release strategy, please refer to the [main Web Application overview]({{ '/web-application' | relative_url }}).
