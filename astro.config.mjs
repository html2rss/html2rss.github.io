// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://html2rss.github.io",
  base: "/",
  redirects: {
    // Only redirect actual old Jekyll URLs that need to be redirected
  },
  integrations: [
    starlight({
      title: "html2rss",
      description:
        "html2rss brings back RSS. It's an open source project with decentralised instances. These instances generate RSS feeds for websites which do not offer them.",
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
      },
      head: [
        {
          tag: "meta",
          attrs: {
            name: "mobile-web-app-capable",
            content: "yes",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "apple-mobile-web-app-status-bar-style",
            content: "black",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "referrer",
            content: "no-referrer",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "theme-color",
            content: "#111111",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/assets/images/apple-touch-icon.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "32x32",
            href: "/assets/images/favicon-32x32.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            type: "image/png",
            sizes: "16x16",
            href: "/assets/images/favicon-16x16.png",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "manifest",
            href: "/assets/images/site.webmanifest",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "mask-icon",
            href: "/assets/images/safari-pinned-tab.svg",
            color: "#111111",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "shortcut icon",
            href: "/assets/images/favicon.ico",
          },
        },
        {
          tag: "script",
          attrs: {
            "data-goatcounter": "https://html2rss.goatcounter.com/count",
            async: true,
            src: "//gc.zgo.at/count.js",
          },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/html2rss",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/html2rss/html2rss.github.io/edit/main/",
      },
      sidebar: [
        {
          label: "Home",
          link: "/",
        },
        {
          label: "About",
          link: "/about",
        },
        {
          label: "Feed Directory",
          link: "/feed-directory/",
        },
        {
          label: "Creating Custom Feeds",
          link: "/html2rss-configs",
        },
        {
          label: "Web Application",
          items: [
            "web-application",
            "web-application/getting-started",
            {
              label: "How-to",
              autogenerate: { directory: "web-application/how-to" },
            },
            {
              label: "Reference",
              autogenerate: { directory: "web-application/reference" },
            },
            {
              label: "Tutorials",
              autogenerate: { directory: "web-application/tutorials" },
            },
          ],
        },
        {
          label: "Ruby Gem",
          items: [
            "ruby-gem",
            "ruby-gem/installation",
            {
              label: "How-to",
              autogenerate: { directory: "ruby-gem/how-to" },
            },
            {
              label: "Reference",
              autogenerate: { directory: "ruby-gem/reference" },
            },
            {
              label: "Tutorials",
              autogenerate: { directory: "ruby-gem/tutorials" },
            },
          ],
        },
        {
          label: "Get Involved",
          autogenerate: { directory: "get-involved" },
        },
        {
          label: "Support",
          autogenerate: { directory: "support" },
        },
      ],
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
    }),
  ],
});
