// Feed Directory JavaScript functionality

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function getDefaultInstanceUrl() {
  return atob('aHR0cHM6Ly8xLmgyci53b3JrZXJzLmRldi8=');
}

function getStorageKey() {
  return 'html2rss.feedDirectory.instanceUrl';
}

function getHashParams() {
  const hash = window.location.hash || '';
  if (!hash.startsWith('#!')) return new URLSearchParams();
  return new URLSearchParams(hash.slice(2));
}

function normalizeParsedInstanceUrl(parsedUrl) {
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return null;
  }

  parsedUrl.search = '';
  parsedUrl.hash = '';
  return parsedUrl.toString();
}

function readInstanceUrlFromHash(defaultInstanceUrl) {
  const candidate = getHashParams().get('url');
  if (!candidate) return defaultInstanceUrl;

  try {
    return normalizeParsedInstanceUrl(new URL(candidate)) || defaultInstanceUrl;
  } catch {
    return defaultInstanceUrl;
  }
}

function readInstanceUrlFromStorage(defaultInstanceUrl) {
  try {
    const candidate = window.localStorage.getItem(getStorageKey());
    if (!candidate) return defaultInstanceUrl;
    return normalizeInstanceUrl(candidate) || defaultInstanceUrl;
  } catch {
    return defaultInstanceUrl;
  }
}

function writeInstanceUrl(instanceUrl, defaultInstanceUrl) {
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

function readInitialInstanceUrl(defaultInstanceUrl) {
  const hashInstanceUrl = readInstanceUrlFromHash(defaultInstanceUrl);
  if (hashInstanceUrl !== defaultInstanceUrl) {
    writeInstanceUrl(hashInstanceUrl, defaultInstanceUrl);
    return hashInstanceUrl;
  }

  return readInstanceUrlFromStorage(defaultInstanceUrl);
}

function fuzzyMatch(text, query) {
  if (!query) return true;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let textIndex = 0;
  let queryIndex = 0;
  while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
    if (lowerQuery[queryIndex] === lowerText[textIndex]) queryIndex++;
    textIndex++;
  }
  return queryIndex === lowerQuery.length;
}

function formatInstanceLabel(instanceUrl) {
  try {
    const parsedUrl = new URL(instanceUrl);
    return parsedUrl.host + parsedUrl.pathname.replace(/\/$/, '');
  } catch {
    return instanceUrl;
  }
}

function normalizeInstanceUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return normalizeParsedInstanceUrl(new URL(trimmed));
  } catch {
    return null;
  }
}

function updateInstanceSummary(instanceUrl) {
  const host = document.querySelector('[data-instance-host]');
  if (host) {
    host.textContent = formatInstanceLabel(instanceUrl);
  }
}

function setInstanceFeedback(message, state) {
  const feedback = document.querySelector('[data-instance-feedback]');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function createUpdateFeedUrlsFunction() {
  return function updateFeedUrls(instanceUrl) {
    document.querySelectorAll('[data-feed-url]').forEach((link) => {
      const item = link.closest('[data-domain]');
      if (!item) return;

      const domain = item.dataset.domain;
      const name = item.dataset.name;
      if (!domain || !name) return;

      const params = {};
      item.querySelectorAll('[data-param-key]').forEach((input) => {
        if (input.value) params[input.dataset.paramKey] = input.value;
      });

      let url = instanceUrl.endsWith('/') ? instanceUrl : `${instanceUrl}/`;
      url += `${domain}/${name}.rss`;

      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => queryParams.append(key, value));
      const queryString = queryParams.toString();
      if (queryString) url += `?${queryString}`;

      link.href = url;
    });
  };
}

function updateSearchState(feedItems, query, selectedTopics = [], selectedLanguage = '') {
  let visibleCount = 0;
  feedItems.forEach((item) => {
    const searchableText = item.dataset.searchable?.toLowerCase() || '';
    const matchesSearch = fuzzyMatch(searchableText, query);
    const itemTopics = (item.dataset.topics || '').split(/\s+/).filter(Boolean);
    const matchesTopics =
      selectedTopics.length === 0 || selectedTopics.some((topic) => itemTopics.includes(topic));
    const itemLanguage = item.dataset.language || '';
    const matchesLanguage = !selectedLanguage || itemLanguage === selectedLanguage;
    const matches = matchesSearch && matchesTopics && matchesLanguage;
    item.hidden = !matches;
    if (matches) visibleCount++;
  });

  const resultCount = document.querySelector('[data-result-count]');
  const resultLabel = document.querySelector('[data-result-label]');
  const emptyState = document.querySelector('[data-empty-state]');
  const emptyCopy = document.querySelector('[data-empty-copy]');
  const feedList = document.querySelector('[data-feed-list]');
  const hasActiveFilters = Boolean(query.trim()) || selectedTopics.length > 0 || Boolean(selectedLanguage);

  if (resultCount) {
    resultCount.textContent = String(visibleCount);
  }

  if (resultLabel) {
    if (hasActiveFilters) {
      resultLabel.textContent = visibleCount === 1 ? 'matching feed' : 'matching feeds';
    } else {
      resultLabel.textContent = visibleCount === 1 ? 'ready-to-use feed' : 'ready-to-use feeds';
    }
  }

  if (emptyState && emptyCopy && feedList) {
    const hasNoResults = visibleCount === 0;
    emptyState.hidden = !hasNoResults;
    feedList.hidden = hasNoResults;
    if (hasNoResults) {
      emptyCopy.textContent = hasActiveFilters
        ? 'No configurations match the current search and filters. Try clearing a topic or language filter.'
        : 'Try a different domain or feed name, or contribute a new configuration.';
    }
  }
}

function getSelectedTopics() {
  return Array.from(document.querySelectorAll('[data-topic-filter][aria-pressed="true"]')).map(
    (button) => button.dataset.topicFilter
  );
}

function getSelectedLanguage() {
  const languageFilter = document.querySelector('[data-language-filter]');
  return languageFilter?.value || '';
}

function setupFilters(searchInput, feedItems) {
  const applyFilters = debounce(() => {
    updateSearchState(
      feedItems,
      (searchInput?.value || '').toLowerCase(),
      getSelectedTopics(),
      getSelectedLanguage()
    );
  }, 120);

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  document.querySelectorAll('[data-topic-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const pressed = button.getAttribute('aria-pressed') === 'true';
      button.setAttribute('aria-pressed', String(!pressed));
      applyFilters();
    });
  });

  const languageFilter = document.querySelector('[data-language-filter]');
  if (languageFilter) {
    languageFilter.addEventListener('change', applyFilters);
  }

  applyFilters();
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function buildOpmlDocument(visibleItems) {
  const outlines = visibleItems
    .map((item) => {
      const feedLink = item.querySelector('[data-feed-url]');
      const title =
        item.querySelector('.feed-title')?.textContent?.trim() ||
        `${item.dataset.domain}/${item.dataset.name}`;
      const xmlUrl = feedLink?.href;
      if (!xmlUrl || xmlUrl === '#' || xmlUrl.endsWith('/#')) return null;

      const htmlUrl = item.querySelector('.meta-link[title]')?.getAttribute('href') || '';
      const htmlAttr = htmlUrl ? ` htmlUrl="${escapeXml(htmlUrl)}"` : '';
      return `    <outline type="rss" text="${escapeXml(title)}" title="${escapeXml(title)}" xmlUrl="${escapeXml(xmlUrl)}"${htmlAttr} />`;
    })
    .filter(Boolean)
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

function setupOpmlExport(feedItems) {
  const exportButton = document.querySelector('[data-export-opml]');
  if (!exportButton) return;

  exportButton.addEventListener('click', () => {
    const visibleItems = feedItems.filter((item) => !item.hidden);
    if (visibleItems.length === 0) return;

    const opml = buildOpmlDocument(visibleItems);
    const blob = new Blob([opml], { type: 'text/x-opml+xml' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = 'html2rss-feeds.opml';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  });
}

function setupSearch(searchInput, feedItems) {
  setupFilters(searchInput, feedItems);
}

function setupInstanceEditor(
  defaultInstanceUrl,
  getCurrentInstanceUrl,
  setCurrentInstanceUrl,
  updateFeedUrls
) {
  const toggle = document.querySelector('[data-toggle-instance]');
  const editor = document.getElementById('instance-editor');
  const input = document.getElementById('instance-url-input');
  const apply = document.querySelector('[data-apply-instance]');
  if (!toggle || !editor || !input || !apply) return;

  const directory = document.querySelector('[data-feed-directory]');
  if (directory) {
    directory.dataset.enhanced = 'true';
  }

  const setExpanded = (expanded) => {
    editor.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.textContent = expanded ? 'Close' : 'Change';
  };

  toggle.addEventListener('click', () => {
    const nextExpanded = editor.hidden;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      input.value = getCurrentInstanceUrl();
      setInstanceFeedback('Feed links update when you apply a valid instance URL.', 'idle');
      input.focus();
      input.select();
    }
  });

  const applyInstance = () => {
    const normalized = normalizeInstanceUrl(input.value);
    if (!normalized) {
      setInstanceFeedback('Enter a valid URL.', 'error');
      return;
    }

    setCurrentInstanceUrl(normalized);
    input.value = normalized;
    updateInstanceSummary(normalized);
    writeInstanceUrl(normalized, defaultInstanceUrl);
    updateFeedUrls(normalized);
    setExpanded(false);
    setInstanceFeedback('Using your custom instance.', 'success');
  };

  setExpanded(false);

  apply.addEventListener('click', applyInstance);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyInstance();
    }
  });
}

function setupParameterForms(updateFeedUrls, getCurrentInstanceUrl) {
  document.querySelectorAll('[data-target]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const sourceButton = event.currentTarget;
      const form = document.getElementById(sourceButton.dataset.target);
      if (!form) return;

      const isExpanded = !form.hidden;
      form.hidden = isExpanded;
      sourceButton.setAttribute('aria-expanded', String(!isExpanded));
      const label = sourceButton.querySelector('span');
      if (label) {
        label.textContent = isExpanded ? 'Customize' : 'Close';
      }

      if (!isExpanded) {
        updateFeedUrls(getCurrentInstanceUrl());
      }
    });
  });
}

function setupCloseForms() {
  document.querySelectorAll('[data-close-form]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const form = event.currentTarget.closest('.parameter-form');
      const toggle = document.querySelector(`[data-target="${form?.id}"]`);
      if (!form || !toggle) return;

      form.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      const label = toggle.querySelector('span');
      if (label) {
        label.textContent = 'Customize';
      }
    });
  });
}

function setupParameterInputs(updateFeedUrls, getCurrentInstanceUrl) {
  document.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener(
      'input',
      debounce(() => updateFeedUrls(getCurrentInstanceUrl()), 180)
    );
  });
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy-feed]').forEach((button) => {
    button.addEventListener('click', async () => {
      const feedLink = button.closest('[data-domain]')?.querySelector('[data-feed-url]');
      if (!feedLink?.href) return;

      try {
        await navigator.clipboard.writeText(feedLink.href);
        const label = button.querySelector('span');
        button.dataset.copied = 'true';
        if (label) label.textContent = 'Copied';
        window.setTimeout(() => {
          button.dataset.copied = 'false';
          if (label) label.textContent = 'Copy link';
        }, 1400);
      } catch {
        const label = button.querySelector('span');
        if (label) label.textContent = 'Copy failed';
        window.setTimeout(() => {
          if (label) label.textContent = 'Copy link';
        }, 1400);
      }
    });
  });
}

function initializeFeedDirectory() {
  const defaultInstanceUrl = getDefaultInstanceUrl();
  let currentInstanceUrl = readInitialInstanceUrl(defaultInstanceUrl);
  const searchInput = document.getElementById('search-input');
  const feedItems = Array.from(document.querySelectorAll('[data-domain]'));
  const instanceInput = document.getElementById('instance-url-input');
  const updateFeedUrls = createUpdateFeedUrlsFunction();

  updateInstanceSummary(currentInstanceUrl);

  if (instanceInput) {
    instanceInput.value = currentInstanceUrl;
  }

  setupSearch(searchInput, feedItems);
  setupOpmlExport(feedItems);
  setupInstanceEditor(
    defaultInstanceUrl,
    () => currentInstanceUrl,
    (nextUrl) => {
      currentInstanceUrl = nextUrl;
    },
    updateFeedUrls
  );
  setupParameterForms(updateFeedUrls, () => currentInstanceUrl);
  setupCloseForms();
  setupParameterInputs(updateFeedUrls, () => currentInstanceUrl);
  setupCopyButtons();

  updateFeedUrls(currentInstanceUrl);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeedDirectory);
} else {
  initializeFeedDirectory();
}
