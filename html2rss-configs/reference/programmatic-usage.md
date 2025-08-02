---
layout: default
title: Programmatic Usage
parent: Reference
grand_parent: html2rss-configs
nav_order: 1
---

# Programmatic Usage

You can use `html2rss-configs` programmatically in your Ruby applications.

Add to your Gemfile:

```ruby
gem 'html2rss-configs', git: 'https://github.com/html2rss/html2rss-configs.git'
```

Use it in your code:

```ruby
require 'html2rss/configs'

config = Html2rss::Configs.find_by_name('domainname.tld/whatever')
```

This will return the feed configuration.
