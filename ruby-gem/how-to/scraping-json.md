---
title: 'Scraping JSON Responses'
---

# Scraping JSON Responses

When a website returns a JSON response (i.e., with a `Content-Type` of `application/json`), `html2rss` converts the JSON to XML, allowing you to use CSS selectors for data extraction.

> [!NOTE]
> The JSON response must be an Array or a Hash for the conversion to work.

## JSON to XML Conversion Examples

### JSON Object

A JSON object like this:

```json
{
  "data": [{ "title": "Headline", "url": "https://example.com" }]
}
```

is converted to this XML structure:

```xml
<object>
  <data>
    <array>
      <object>
        <title>Headline</title>
        <url>https://example.com</url>
      </object>
    </array>
  </data>
</object>
```

You would use `array > object` as your `items` selector.

### JSON Array

A JSON array like this:

```json
[{ "title": "Headline", "url": "https://example.com" }]
```

is converted to this XML structure:

```xml
<array>
  <object>
    <title>Headline</title>
    <url>https://example.com</url>
  </object>
</array>
```

You would use `array > object` as your `items` selector.

## Configuration Examples

### Ruby

```ruby
Html2rss.feed(
  headers: {
    Accept: 'application/json'
  },
  channel: {
    url: 'http://domainname.tld/whatever.json'
  },
  selectors: {
    title: { selector: 'foo' }
  }
)
```

### YAML

```yml
headers:
  Accept: application/json
channel:
  url: "http://domainname.tld/whatever.json"
selectors:
  items:
    selector: "array > object"
  title:
    selector: "foo"
```
