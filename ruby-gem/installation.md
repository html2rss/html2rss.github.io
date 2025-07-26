---
layout: default
title: Installation
nav_order: 2
parent: Ruby Gem
permalink: /ruby-gem/installation
---

# Installation

This guide will walk you through the process of installing html2rss on your system. html2rss can be installed in several ways, depending on your preferred method and environment.

---

### Prerequisites

- **Ruby:** html2rss is built with Ruby. Ensure you have Ruby installed (version 3.3 or higher recommended). You can check your Ruby version by running `ruby -v` in your terminal. If you don't have Ruby, visit [ruby-lang.org](https://www.ruby-lang.org/en/documentation/installation/) for installation instructions.
- **Bundler (Recommended):** Bundler is a Ruby gem that manages your application's dependencies. It's highly recommended for a smooth installation. Install it with `gem install bundler`.

---

### Method 1: Gem Installation (Recommended for CLI Usage)

The simplest way to get html2rss for command-line usage is to install it as a Ruby gem.

```bash
gem install html2rss
```

After installation, you should be able to run `html2rss --version` to confirm it's working.

---

### Method 2: Using a Gemfile (For Ruby Projects)

If you're integrating html2rss into an existing Ruby project, add it to your `Gemfile`:

```ruby
# Gemfile
gem 'html2rss'
```

Then, run `bundle install` in your project directory.

---

### Method 3: Docker (For Containerized Environments)

For a more isolated and reproducible environment, you can use the official html2rss Docker image.

```bash
docker pull html2rss/html2rss
```

You can then run html2rss commands within a Docker container. Refer to the [Docker Hub page](https://hub.docker.com/r/html2rss/html2rss) for detailed usage.

---

### Verifying Installation

To ensure html2rss is installed correctly, open your terminal and run:

```bash
html2rss --version
```

You should see the installed version number. If you encounter any issues, please refer to the [Troubleshooting Guide]({{ "/support/troubleshooting" | relative_url }}).

---

### Next Steps

Now that html2rss is installed, let's create your [first RSS feed]({{ '/ruby-gem/your-first-feed' | relative_url }})!
