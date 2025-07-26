---
layout: default
title: Stylesheets
nav_order: 5
parent: Configuration
grand_parent: Ruby Gem
permalink: /ruby-gem/configuration/stylesheets
---

# `stylesheets`

The `stylesheets` key allows you to add CSS or XSLT stylesheets to your RSS feed to improve its appearance in a web browser.

```yaml
stylesheets:
  - href: "/relative/base/path/to/style.xls"
    media: "all"
    type: "text/xsl"
  - href: "http://example.com/rss.css"
    media: "all"
    type: "text/css"
```

---

### Explanation

You can add plain CSS stylesheets or XSLT (eXtensible Stylesheet Language Transformations) to style your RSS feed when viewed in a web browser.

- CSS stylesheets use element selectors to apply styles.
- XSLT allows you to use HTML templates and add JavaScript or external resources for advanced styling.

---

### Examples

#### Ruby example

```ruby
Html2rss.feed(
  stylesheets: [
    {
      href: '/relative/base/path/to/style.xsl', media: :all, type: 'text/xsl'
    },
    {
      href: 'http://example.com/rss.css', media: :all, type: 'text/css'
    }
  ],
  channel: {},
  selectors: {}
)
```

#### YAML example

```yaml
stylesheets:
  - href: "/relative/base/path/to/style.xsl"
    media: "all"
    type: "text/xsl"
  - href: "http://example.com/rss.css"
    media: "all"
    type: "text/css"
feeds:
  # your feed configs here
```

---

### Further Reading

- [How to format RSS with CSS on lifewire.com](https://www.lifewire.com/how-to-format-rss-3469302)
- [XSLT: Extensible Stylesheet Language Transformations on MDN](https://developer.mozilla.org/en-US/docs/Web/XSLT)
- [The XSLT used by html2rss-web](https://github.com/html2rss/html2rss-web/blob/master/public/rss.xsl)
