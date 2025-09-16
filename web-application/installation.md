---
title: 'Installation'
---


This guide will help you set up your own copy of html2rss-web on your computer. Don't worry - we'll walk you through every step!

## What You'll Need

- **Docker** - A tool that makes installation simple (like an app store for server software)
- **About 10 minutes** - The whole process is quick and automated

**Don't have Docker?** [Install it first](https://docs.docker.com/get-started/) - it's free and works on Windows, Mac, and Linux.

## Step 1: Create a Folder

Create a new folder on your computer to store html2rss-web files:

**On Windows:** Right-click → New Folder → Name it "html2rss-web"
**On Mac/Linux:** Open Terminal and run:

```bash
mkdir html2rss-web
cd html2rss-web
```

## Step 2: Create the Configuration File

Create a file called `docker-compose.yml` in your new folder. This file tells Docker how to set up html2rss-web with all the features you need.

**How to create the file:**

- **On Windows:** Right-click in the folder → New → Text Document → Rename it to `docker-compose.yml` (make sure to change the extension)
- **On Mac/Linux:** Use any text editor to create the file

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

## Step 3: Download the Feed List

html2rss-web needs a list of feeds to work with. Download our pre-made list:

**On Windows:** Right-click [this link](https://raw.githubusercontent.com/html2rss/html2rss-web/master/config/feeds.yml) → Save As → Name it "feeds.yml" → Save in your html2rss-web folder

**On Mac/Linux:** Open Terminal in your html2rss-web folder and run:

```bash
curl https://raw.githubusercontent.com/html2rss/html2rss-web/master/config/feeds.yml -o feeds.yml
```

## Step 4: Start html2rss-web

Now start html2rss-web:

**On Windows:** Open Command Prompt in your html2rss-web folder and run:

```cmd
docker compose up -d
```

**On Mac/Linux:** In Terminal, run:

```bash
docker compose up -d
```

**That's it!** 🎉 html2rss-web is now running.

**To verify it's working:**

1. Open your web browser
2. Go to `http://localhost:3000`
3. You should see the html2rss-web interface with a list of available feeds

**If you see the interface, congratulations!** You've successfully set up html2rss-web.

## Next Steps

- **Try it out!** Visit `http://localhost:3000` to see html2rss-web in action
- **Browse existing feeds** - Check out what's already available
- **Create your first feed** - Follow our [How-To Guides]({{ '/web-application/how-to/' | relative_url }}) to make custom feeds
- **Need help?** Check our [troubleshooting guide]({{ '/support/troubleshooting' | relative_url }}) if something doesn't work
