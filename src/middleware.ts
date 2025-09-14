import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const { url } = context;
  const pathname = url.pathname;

  // Redirect mapping from Jekyll URLs (with trailing slash) to Astro URLs (without trailing slash)
  const redirectMap: Record<string, string> = {
    '/about/': '/about',
    '/configs/': '/configs',
    '/html2rss-configs/': '/html2rss-configs',
    '/get-involved/contributing/': '/get-involved/contributing',
    '/get-involved/discussions/': '/get-involved/discussions',
    '/get-involved/issues-and-features/': '/get-involved/issues-and-features',
    '/get-involved/sponsoring/': '/get-involved/sponsoring',
    '/ruby-gem/how-to/advanced-content-extraction/': '/ruby-gem/how-to/advanced-content-extraction',
    '/ruby-gem/how-to/custom-http-requests/': '/ruby-gem/how-to/custom-http-requests',
    '/ruby-gem/how-to/dynamic-parameters/': '/ruby-gem/how-to/dynamic-parameters',
    '/ruby-gem/how-to/handling-dynamic-content/': '/ruby-gem/how-to/handling-dynamic-content',
    '/ruby-gem/how-to/managing-feed-configs/': '/ruby-gem/how-to/managing-feed-configs',
    '/ruby-gem/how-to/scraping-json/': '/ruby-gem/how-to/scraping-json',
    '/ruby-gem/how-to/styling-rss-feed/': '/ruby-gem/how-to/styling-rss-feed',
    '/ruby-gem/reference/auto-source/': '/ruby-gem/reference/auto-source',
    '/ruby-gem/reference/channel/': '/ruby-gem/reference/channel',
    '/ruby-gem/reference/cli-reference/': '/ruby-gem/reference/cli-reference',
    '/ruby-gem/reference/headers/': '/ruby-gem/reference/headers',
    '/ruby-gem/reference/strategy/': '/ruby-gem/reference/strategy',
    '/ruby-gem/reference/stylesheets/': '/ruby-gem/reference/stylesheets',
    '/web-application/reference/versioning-and-releases/': '/web-application/reference/versioning-and-releases'
  };

  // Check for specific redirects
  if (redirectMap[pathname]) {
    return context.redirect(redirectMap[pathname], 301);
  }

  // Generic redirect: remove trailing slash (except for root)
  if (pathname.endsWith('/') && pathname !== '/') {
    const newPath = pathname.slice(0, -1);
    return context.redirect(newPath, 301);
  }

  return next();
});
