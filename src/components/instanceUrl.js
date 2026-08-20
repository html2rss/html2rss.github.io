export function getDefaultInstanceUrl() {
  return atob('aHR0cHM6Ly8xLmgyci53b3JrZXJzLmRldi8=');
}

export function getStorageKey() {
  return 'html2rss.feedDirectory.instanceUrl';
}

export function getHashParams() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#!')) return new URLSearchParams();
  return new URLSearchParams(hash.slice(2));
}

export function normalizeParsedInstanceUrl(parsedUrl) {
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return null;
  }

  parsedUrl.search = '';
  parsedUrl.hash = '';
  return parsedUrl.toString();
}

export function readInstanceUrlFromHash(defaultInstanceUrl) {
  const candidate = getHashParams().get('url');
  if (!candidate) return defaultInstanceUrl;

  try {
    return normalizeParsedInstanceUrl(new URL(candidate)) || defaultInstanceUrl;
  } catch {
    return defaultInstanceUrl;
  }
}

export function readInstanceUrlFromStorage(defaultInstanceUrl) {
  try {
    const candidate = window.localStorage.getItem(getStorageKey());
    if (!candidate) return defaultInstanceUrl;
    return normalizeInstanceUrl(candidate) || defaultInstanceUrl;
  } catch {
    return defaultInstanceUrl;
  }
}

export function writeInstanceUrl(instanceUrl, defaultInstanceUrl) {
  try {
    if (instanceUrl && instanceUrl !== defaultInstanceUrl) {
      window.localStorage.setItem(getStorageKey(), instanceUrl);
    } else {
      window.localStorage.removeItem(getStorageKey());
    }
  } catch {
    // Ignore storage failures and keep the current page usable.
  }

  if (window.location.hash.startsWith('#!')) {
    const nextUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({}, '', nextUrl);
  }
}

export function readInitialInstanceUrl(defaultInstanceUrl) {
  const hashInstanceUrl = readInstanceUrlFromHash(defaultInstanceUrl);
  if (hashInstanceUrl !== defaultInstanceUrl) {
    writeInstanceUrl(hashInstanceUrl, defaultInstanceUrl);
    return hashInstanceUrl;
  }

  return readInstanceUrlFromStorage(defaultInstanceUrl);
}

export function normalizeInstanceUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return normalizeParsedInstanceUrl(new URL(trimmed));
  } catch {
    return null;
  }
}

export function formatInstanceLabel(instanceUrl) {
  try {
    const parsedUrl = new URL(instanceUrl);
    return parsedUrl.host + parsedUrl.pathname.replace(/\/$/, '');
  } catch {
    return instanceUrl;
  }
}

export function buildFeedUrl(instanceUrl, entry, parameters = {}) {
  const url = new URL(entry.path, instanceUrl);
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}
