---
layout: default
title: Contributing
parent: Get Involved
nav_order: 10
---

# Contributing to html2rss

We're thrilled that you're interested in contributing to `html2rss`! There are many ways to get involved, and we welcome contributions of all kinds.

---

## Code of Conduct

Before you begin, please read our [Code of Conduct](https://github.com/html2rss/.github/blob/main/CODE_OF_CONDUCT.md). We expect all contributors to adhere to this code to ensure that our community is a welcoming and inclusive space for everyone.

---

## How to Contribute

Here are some of the ways you can contribute to the `html2rss` project:

### 1. Create a Feed Config

Are you missing an RSS feed for a website? You can create your own feed config and share it with the community. It's a great way to get started with `html2rss` and help other users.

The html2rss "ecosystem" is a community project. We welcome contributions of all kinds. This includes new feed configs, suggesting and implementing features, providing bug fixes, documentation improvements, and any other kind of help.

Which way you choose to add a new feed config is up to you. You can do it manually. Please [submit a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork)!

After you're done, you can test your feed config by running `bundle exec html2rss feed lib/html2rss/configs/<domainname.tld>/<path>.yml`.

#### Prefered way: manually

1. Fork this repo and run `bundle install` (you need to have Ruby >= 3.1 installed).
2. Create a new folder and file following ths convention: `lib/html2rss/configs/<domainname.tld>/<path>.yml`
3. Create the feed config in the `<path>.yml` file.
4. Add this spec file in the `spec/html2rss/configs/<domainname.tld>/<path>_spec.rb` file.

```ruby
  RSpec.describe '<domainname.tld>/<path>' do
    include_examples 'config.yml', described_class
  end
```

### 2. Improve this Website

This website is built with Jekyll and is hosted on GitHub Pages. If you have any ideas for improving the documentation or the design, we'd love to hear from you.

[**Find the source code on GitHub**](https://github.com/html2rss/html2rss.github.io)

### 3. Host a Public Instance

The [`html2rss-web`](https://github.com/html2rss/html2rss-web) project is a web application that allows you to create and manage your RSS feeds through a user-friendly interface. You can host your own public instance to help other users create feeds.

[**Learn how to host a public instance**]({{ '/web-application/how-to/deployment' | relative_url }})

### 4. Improve the `html2rss` Gem

Are you a Ruby developer? You can help us improve the core `html2rss` gem. Whether you're fixing a bug, adding a new feature, or improving the documentation, your contributions are welcome.

[**Check out the documentation for the `html2rss` Gem**]({{ '/ruby-gem/' | relative_url }})

### 5. Report Bugs & Discuss Features

If you've found a bug, please open an issue on the appropriate GitHub repository. For new feature ideas, we encourage you to start a discussion first.

**Report Bugs:**

- [**`html2rss` issues**](https://github.com/html2rss/html2rss/issues)
- [**`html2rss-web` issues**](https://github.com/html2rss/html2rss-web/issues)
- [**`html2rss-configs` issues**](https://github.com/html2rss/html2rss-configs/issues)

**Discuss Features:**

- [**Start a New Discussion on GitHub**](https://github.com/orgs/html2rss/discussions)

---

We appreciate your interest in contributing to `html2rss`!
