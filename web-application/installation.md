---
layout: default
title: Installation
nav_order: 2
parent: Web Application
---

# Installation

This guide will walk you through setting up a personal instance of `html2rss-web` using Docker and `docker-compose`. This is the recommended way to run the application for personal use.

## Prerequisites

- Docker and `docker-compose` installed on your machine.

See <https://docs.docker.com/get-started/>.

## Step 1: Create a Project Directory

First, create a directory on your machine where you'll store the configuration files for your `html2rss-web` instance.

```bash
mkdir html2rss-web;
cd html2rss-web
```

## Step 2: Create the `docker-compose.yml` File

Create a file named `docker-compose.yml` in your `html2rss-web` directory and add the following content. This setup includes the web application, a browser service for rendering JavaScript-heavy pages, and a service to automatically update the application.

```yaml
services:
  html2rss-web:
    image: gilcreator/html2rss-web
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
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
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - "~/.docker/config.json:/config.json"
    command: --cleanup --interval 7200

  browserless:
    image: "ghcr.io/browserless/chromium"
    restart: unless-stopped
    ports:
      - "127.0.0.1:3001:3001"
    environment:
      PORT: 3001
      CONCURRENT: 10
      TOKEN: 6R0W53R135510
```

## Step 3: Create the `feeds.yml` File

The application needs a file to store your feed configurations.  
[Download the default `feeds.yml`](https://raw.githubusercontent.com/html2rss/html2rss-web/master/config/feeds.yml)
to get started quickly:

```bash
curl https://raw.githubusercontent.com/html2rss/html2rss-web/master/config/feeds.yml -o feeds.yml
```

## Step 4: Launch the Application

Now, you can start the application using `docker compose`.

```bash
docker compose up -d
```

The `-d` flag runs the containers in the background.

Congratulations! Your personal `html2rss-web` instance is now running. You can access it at `http://localhost:3000`.

## Next Steps

- Now that your instance is running, head over to the **[How-To Guides]({{ '/web-application/how-to/' | relative_url }})** to learn how to create your first feed. We recommend starting with the [Creating Custom Feeds]({{ '/web-application/how-to/creating-custom-feeds' | relative_url }}) guide.
- For a more secure setup, consider putting your instance behind a reverse proxy. You can find more information in the [deployment guide]({{ '/web-application/how-to/deployment' | relative_url }}).
