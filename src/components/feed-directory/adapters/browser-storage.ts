export const DEFAULT_INSTANCE_URL = 'https://1.h2r.workers.dev/';

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
  return DEFAULT_INSTANCE_URL;
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
