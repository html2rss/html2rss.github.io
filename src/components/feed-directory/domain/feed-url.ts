import type { FeedDirectoryEntry } from './types';

export function buildFeedUrl(
  instanceUrl: string,
  entry: Pick<FeedDirectoryEntry, 'path'>,
  parameters: Record<string, string> = {}
): string {
  const url = new URL(entry.path, instanceUrl);
  for (const [key, value] of Object.entries(parameters)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function formatInstanceLabel(instanceUrl: string): string {
  try {
    const parsed = new URL(instanceUrl);
    return parsed.host + parsed.pathname.replace(/\/$/, '');
  } catch {
    return instanceUrl;
  }
}
