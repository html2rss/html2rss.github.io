---
title: 'Channel'
---

# Channel

The `channel` configuration block defines the metadata for your RSS feed.

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

## Options

| Attribute     | Required     | Description                                                                                                                              |
| :------------ | :----------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `url`         | **Required** | The URL of the website to scrape.                                                                                                        |
| `title`       | Optional     | The title of the RSS feed. Defaults to the website's title.                                                                              |
| `description` | Optional     | A description for the RSS feed. Defaults to the website's meta description.                                                              |
| `author`      | Optional     | The author of the feed, in the format `email (Name)`.                                                                                    |
| `ttl`         | Optional     | The "time to live" for the feed in minutes. Defaults to the `max-age` from the response headers, or `360`.                               |
| `language`    | Optional     | The language of the feed. Defaults to the `lang` attribute of the `<html>` tag.                                                          |
| `time_zone`   | Optional     | The time zone for parsing dates. See the [list of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). |
