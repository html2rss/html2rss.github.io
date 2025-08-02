---
layout: default
title: Strategy
nav_order: 4
parent: Reference
grand_parent: Ruby Gem
permalink: /ruby-gem/reference/strategy
---

# Strategy

The `strategy` key defines how `html2rss` fetches a website's content.

- **`faraday`** (default): Makes a direct HTTP request. It is fast but does not execute JavaScript.
- **`browserless`**: Renders the website in a headless Chrome browser, which is necessary for JavaScript-heavy sites.

## `browserless`

To use the `browserless` strategy, you need a running instance of [Browserless.io](https://www.browserless.io/).

### Docker

You can run a local Browserless.io instance using Docker:

```sh
docker run \
  --rm \
  -p 3000:3000 \
  -e "CONCURRENT=10" \
  -e "TOKEN=6R0W53R135510" \
  ghcr.io/browserless/chromium
```

### Configuration

Set the `strategy` to `browserless` in your feed configuration:

```yml
strategy: browserless
```

### Command-Line Usage

You can also specify the strategy on the command line:

```sh
# Set environment variables for your Browserless.io instance
BROWSERLESS_IO_WEBSOCKET_URL="ws://127.0.0.1:3000"
BROWSERLESS_IO_API_TOKEN="6R0W53R135510"

# Use the browserless strategy
html2rss feed --strategy=browserless my_config.yml
```
