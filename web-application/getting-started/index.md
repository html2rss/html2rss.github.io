---
layout: default
title: Getting Started
nav_order: 1
permalink: /web-application/getting-started
parent: Web Application
---

# Getting Started with html2rss-web

In this guide, you'll launch the `html2rss-web` application on your local machine. By the end, you'll have a running instance and your first live RSS feed.

## Get Started in 5 Minutes

The easiest way to get started is with Docker.

### 1. Create Your `docker-compose.yml`

Create a file named `docker-compose.yml` and paste in the following:

```yaml
services:
  html2rss-web:
    image: gilcreator/html2rss-web
    ports:
      - "3000:3000"
    volumes:
      - type: bind
        source: ./feeds.yml
        target: /app/config/feeds.yml
        read_only: true
    environment:
      RACK_ENV: production
      HEALTH_CHECK_USERNAME: health
      HEALTH_CHECK_PASSWORD: please-set-YOUR-OWN-veeeeeery-l0ng-aNd-h4rd-to-gue55-Passw0rd!
      BROWSERLESS_IO_WEBSOCKET_URL: ws://browserless:3001
      BROWSERLESS_IO_API_TOKEN: 6R0W53R135510

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - "~/.docker/config.json:/config.json"
    command: --cleanup --interval 7200

  browserless:
    image: "ghcr.io/browserless/chromium"
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      CONCURRENT: 10
      TOKEN: 6R0W53R135510
```

### 2. Create an Empty `feeds.yml`

The application needs a place to store your custom feed configurations.

```bash
touch feeds.yml
```

### 3. Launch the Application

```bash
docker-compose up
```

Congratulations! The `html2rss-web` application is now running. Open your browser to `http://localhost:3000` to see it in action.

### Next Up

Now that you have the application running, let's [create your first custom feed]({{ '/web-application/guides/creating-custom-feeds' | relative_url }}).
