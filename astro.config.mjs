// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://html2rss.github.io",
  base: "/",
  redirects: {
    "/configs": "/feed-directory/",
    "/components/html2rss-web": "/web-application/",
    "/components/html2rss": "/ruby-gem/",
    "/components/html2rss-configs": "/html2rss-configs/",
    "/components": "/",
  },
  build: {
    inlineStylesheets: "auto",
  },
  image: {
    domains: ["html2rss.github.io"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "html2rss.github.io",
      },
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["@astrojs/starlight"],
          },
        },
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        // Simple path-based exclusion for known noindex pages
        return !page.includes("/feed-directory/");
      },
    }),
    starlight({
      title: "html2rss",
      description:
        "html2rss brings back RSS. It's an open source project with decentralised instances. These instances generate RSS feeds for websites which do not offer them.",
      logo: {
        src: "./src/assets/logo.png",
        replacesTitle: true,
        alt: "html2rss logo - Turn any website into RSS",
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
          tag: "meta",
          attrs: {
            name: "keywords",
            content:
              "RSS, feed, web scraping, automation, open source, Ruby, Astro, Starlight, html2rss, RSS generator, website to RSS",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "author",
            content: "html2rss team",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "robots",
            content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:type",
            content: "website",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "html2rss",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:locale",
            content: "en_US",
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
          tag: "link",
          attrs: {
            rel: "preload",
            href: "/assets/images/logo.png",
            as: "image",
            type: "image/png",
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
        {
          tag: "script",
          attrs: {
            type: "application/ld+json",
          },
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "html2rss",
            description:
              "html2rss brings back RSS. It's an open source project with decentralised instances. These instances generate RSS feeds for websites which do not offer them.",
            url: "https://html2rss.github.io",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Organization",
              name: "html2rss",
              url: "https://github.com/html2rss",
            },
            license: "https://github.com/html2rss/html2rss/blob/main/LICENSE",
            codeRepository: "https://github.com/html2rss/html2rss",
            programmingLanguage: "Ruby",
            keywords: "RSS, feed, web scraping, automation, open source, Ruby, Astro, Starlight",
            featureList: [
              "Create RSS feeds from any website",
              "No coding required",
              "Open source",
              "Decentralized instances",
              "Web application interface",
              "Ruby gem for developers",
            ],
          }),
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
          label: "Getting Started",
          link: "/getting-started/",
        },
        {
          label: "Common Use Cases",
          link: "/common-use-cases",
        },
        {
          label: "Feed Directory",
          link: "/feed-directory/",
        },
        {
          label: "Web Application",
          collapsed: true,
          items: [
            "web-application/getting-started",
            "web-application",
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
          collapsed: true,
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
          label: "Write Your Own Feed Configs",
          link: "/html2rss-configs",
        },
        {
          label: "About",
          link: "/about",
        },
        {
          label: "Get Involved",
          collapsed: false,
          autogenerate: { directory: "get-involved" },
        },
        {
          label: "Troubleshooting",
          collapsed: true,
          autogenerate: { directory: "troubleshooting" },
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
