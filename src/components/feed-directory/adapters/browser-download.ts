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
