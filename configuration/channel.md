---
layout: default
title: Channel
nav_order: 1
parent: Configuration
---

# `channel`

The `channel` key contains information about the RSS feed itself, such as its title, URL, and description.

```yaml
channel:
  url: https://example.com
  title: "My Custom Feed"
  description: "A feed of the latest news from Example.com"
  author: "jane.doe@example.com (Jane Doe)"
  ttl: 60
  language: "en-us"
  time_zone: "Europe/Berlin"
```

---

## Channel Options

| Attribute     | Required     | Type    | Default        | Remark                                                                                                                                  |
| :------------ | :----------- | :------ | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | **Required** | String  |                | The URL of the website to scrape.                                                                                                       |
| `title`       | Optional     | String  | Auto-generated | The title of the RSS feed.                                                                                                              |
| `description` | Optional     | String  | Auto-generated | Retrieved from meta description tags.                                                                                                   |
| `author`      | Optional     | String  | Blank          | Format: `email (Name)`.                                                                                                                 |
| `ttl`         | Optional     | Integer | Auto-generated | Time to live in minutes. `html2rss` will use the `max-age` from the response headers if available, otherwise it will default to `360`.  |
| `language`    | Optional     | String  | Auto-generated | Determined by the `lang` attribute of the `<html>` tag.                                                                                 |
| `time_zone`   | Optional     | String  | `'UTC'`        | The time zone to use for parsing dates. See a [list of valid time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). |
