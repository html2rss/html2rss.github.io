import { escapeXml } from '../lib/escape';
import { buildFeedUrl } from './feed-url';
import type { FeedDirectoryEntry } from './types';

export function buildOpmlDocument(
  instanceUrl: string,
  entries: FeedDirectoryEntry[],
  parametersById: Record<string, Record<string, string>>
): string {
  const outlines = entries
    .map((entry) => {
      const xmlUrl = buildFeedUrl(instanceUrl, entry, parametersById[entry.id] ?? {});
      const htmlAttr = entry.channelUrl ? ` htmlUrl="${escapeXml(entry.channelUrl)}"` : '';
      return `    <outline type="rss" text="${escapeXml(entry.title)}" title="${escapeXml(entry.title)}" xmlUrl="${escapeXml(xmlUrl)}"${htmlAttr} />`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>html2rss feeds</title>
  </head>
  <body>
${outlines}
  </body>
</opml>
`;
}
