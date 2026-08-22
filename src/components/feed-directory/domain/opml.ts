import { escapeXml } from '../lib/escape';
import { buildFeedUrl } from './instance';
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

export function downloadOpml(content: string, filename = 'html2rss-feeds.opml'): void {
  const blob = new Blob([content], { type: 'text/x-opml+xml' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
