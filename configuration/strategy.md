---
layout: default
title: Strategy
nav_order: 2
parent: Configuration
---

# `strategy`

The `strategy` key defines how `html2rss` fetches the website's content.

- **`faraday`** (default): Makes a simple HTTP request and does not execute JavaScript. It's fast and works for many websites.
- **`browserless`**: Uses a headless Chrome browser to render the website. This is essential for JavaScript-heavy websites that build their HTML on the client side.

## browserless

### Requirements

To use the `browserless` strategy, you need to have a [Browserless.io](https://www.browserless.io/) instance running.

```yaml
strategy: browserless
```

You can use _Browserless.io_ to run a headless Chrome browser and return the website's source code after the website generated it.
For this, you can either run your own Browserless.io instance (Docker image available -- [read their license](https://github.com/browserless/browserless/pkgs/container/chromium#licensing)!) or pay them for a hosted instance.

To run a local Browserless.io instance, you can use the following Docker command:

```sh
docker run \
  --rm \
  -p 3000:3000 \
  -e "CONCURRENT=10" \
  -e "TOKEN=6R0W53R135510" \
  ghcr.io/browserless/chromium
```

### Usage examples CLI

To make html2rss use your instance, specify the `browserless` strategy.

```sh
# auto:
BROWSERLESS_IO_WEBSOCKET_URL="ws://127.0.0.1:3000" BROWSERLESS_IO_API_TOKEN="6R0W53R135510" \
  html2rss auto --strategy=browserless https://example.com

# feed:
BROWSERLESS_IO_WEBSOCKET_URL="ws://127.0.0.1:3000" BROWSERLESS_IO_API_TOKEN="6R0W53R135510" \
  html2rss feed --strategy=browserless the_the_config.yml
```

> [!TIP]
> When running locally with commands from above, you can skip setting the environment variables, as they are aligned with the default values from above example.

### Usage examples in feed config

In your config, set `strategy: browserless`.

```yml
strategy: browserless
headers:
  User-Agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
channel:
  url: https://www.imdb.com/user/ur67728460/ratings
  ttl: 1440
selectors:
  items:
    selector: "li.ipc-metadata-list-summary-item"
  title:
    selector: ".ipc-title__text"
    post_process:
      - name: gsub
        pattern: "/^(\\d+.)\\s/"
        replacement: ""
      - name: template
        string: "%{self} rated with: %{user_rating}"
  url:
    selector: "a.ipc-title-link-wrapper"
    extractor: "href"
  user_rating:
    selector: "[data-testid='ratingGroup--other-user-rating'] > .ipc-rating-star--rating"
```
