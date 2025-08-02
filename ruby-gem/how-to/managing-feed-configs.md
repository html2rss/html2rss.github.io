---
layout: default
title: Managing Feed Configs
parent: How-To Guides
grand_parent: Ruby Gem
nav_order: 7
---

# Managing Feed Configurations with YAML

For easier management, especially when using the CLI or `html2rss-web`, you can store your feed configurations in a YAML file.

## Global and Feed-Specific Configurations

You can define global settings that apply to all feeds, and then define individual feed configurations under the `feeds` key.

```yml
# Global settings
headers:
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1"
  "Accept": "text/html"

# Feed-specific settings
feeds:
  my-first-feed:
    channel:
      url: "https://example.com/blog"
    selectors:
      # ...
  my-second-feed:
    channel:
      url: "https://example.com/news"
    selectors:
      # ...
```

## Building Feeds from a YAML File

### Ruby

```ruby
require 'html2rss'

# Build a specific feed from the YAML file
my_feed_config = Html2rss.config_from_yaml_file('feeds.yml', 'my-first-feed')
rss = Html2rss.feed(my_feed_config)
puts rss

# If the YAML file contains only one feed, you can omit the feed name
single_feed_config = Html2rss.config_from_yaml_file('single.yml')
rss = Html2rss.feed(single_feed_config)
puts rss
```

### Command Line

```sh
# Build a specific feed
html2rss feed feeds.yml my-first-feed

# Build a feed from a single-feed YAML file
html2rss feed single.yml
```
