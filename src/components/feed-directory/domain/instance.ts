import type { CatalogEntry } from './types';

const DEFAULT_INSTANCE = atob('aHR0cHM6Ly8xLmgyci53b3JrZXJzLmRldi8=');
const STORAGE_KEY = 'html2rss.feedDirectory.instanceUrl';

function hashParams(): URLSearchParams {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#!')) return new URLSearchParams();
  return new URLSearchParams(hash.slice(2));
}

function normalizeParsed(parsed: URL): string | null {
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString();
}

export function getDefaultInstanceUrl(): string {
  return DEFAULT_INSTANCE;
}

export function normalizeInstanceUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return normalizeParsed(new URL(trimmed));
  } catch {
    return null;
  }
}

export function formatInstanceLabel(instanceUrl: string): string {
  try {
    const parsed = new URL(instanceUrl);
    return parsed.host + parsed.pathname.replace(/\/$/, '');
  } catch {
    return instanceUrl;
  }
}

export function readInitialInstanceUrl(defaultUrl = getDefaultInstanceUrl()): string {
  const fromHash = hashParams().get('url');
  if (fromHash) {
    try {
      const normalized = normalizeParsed(new URL(fromHash));
      if (normalized) {
        persistInstanceUrl(normalized, defaultUrl);
        return normalized;
      }
    } catch {
      // fall through
    }
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const normalized = normalizeInstanceUrl(stored);
      if (normalized) return normalized;
    }
  } catch {
    // ignore storage failures
  }

  return defaultUrl;
}

export function persistInstanceUrl(instanceUrl: string, defaultUrl = getDefaultInstanceUrl()): void {
  try {
    if (instanceUrl && instanceUrl !== defaultUrl) {
      window.localStorage.setItem(STORAGE_KEY, instanceUrl);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }

  if (window.location.hash.startsWith('#!')) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({}, '', next);
  }
}

export function buildFeedUrl(
  instanceUrl: string,
  entry: Pick<CatalogEntry, 'path'>,
  parameters: Record<string, string> = {}
): string {
  const url = new URL(entry.path, instanceUrl);
  for (const [key, value] of Object.entries(parameters)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

export function parseSiteDomain(entryId: string): string {
  const slash = entryId.indexOf('/');
  return slash === -1 ? entryId : entryId.slice(0, slash);
}
