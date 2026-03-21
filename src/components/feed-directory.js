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

function getHashParams() {
  const hash = window.location.hash || '';
  const normalizedHash = hash.startsWith('#!') ? hash.slice(2) : hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(normalizedHash);
}

function readInstanceUrlFromHash(defaultInstanceUrl) {
  const candidate = getHashParams().get('url');
  if (!candidate) return defaultInstanceUrl;

  try {
    const parsedUrl = new URL(candidate);
    parsedUrl.search = '';
    parsedUrl.hash = '';
    return parsedUrl.toString();
  } catch {
    return defaultInstanceUrl;
  }
}

function writeInstanceUrlToHash(instanceUrl, defaultInstanceUrl) {
  const params = getHashParams();
  if (instanceUrl && instanceUrl !== defaultInstanceUrl) {
    params.set('url', instanceUrl);
  } else {
    params.delete('url');
  }

  const nextHash = params.toString();
  const nextUrl = nextHash
    ? `${window.location.pathname}${window.location.search}#!${nextHash}`
    : `${window.location.pathname}${window.location.search}`;
  window.history.replaceState({}, '', nextUrl);
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
    const parsedUrl = new URL(trimmed);
    parsedUrl.search = '';
    parsedUrl.hash = '';
    return parsedUrl.toString();
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

function updateSearchState(feedItems, query) {
  let visibleCount = 0;
  feedItems.forEach((item) => {
    const searchableText = item.dataset.searchable?.toLowerCase() || '';
    const matches = fuzzyMatch(searchableText, query);
    item.hidden = !matches;
    if (matches) visibleCount++;
  });

  const resultCount = document.querySelector('[data-result-count]');
  const resultLabel = document.querySelector('[data-result-label]');
  const emptyState = document.querySelector('[data-empty-state]');
  const emptyCopy = document.querySelector('[data-empty-copy]');
  const feedList = document.querySelector('[data-feed-list]');

  if (resultCount) {
    resultCount.textContent = String(visibleCount);
  }

  if (resultLabel) {
    const hasQuery = Boolean(query.trim());
    if (hasQuery) {
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
      emptyCopy.textContent = query
        ? `No configurations found for "${query}". Try another domain or feed name, check the community wiki, or contribute a new configuration.`
        : 'Try a different domain or feed name, or contribute a new configuration.';
    }
  }
}

function setupSearch(searchInput, feedItems) {
  if (!searchInput) return;

  const applySearch = debounce((query) => {
    updateSearchState(feedItems, query.toLowerCase());
  }, 120);

  searchInput.addEventListener('input', (event) => {
    applySearch(event.target.value);
  });

  updateSearchState(feedItems, searchInput.value.toLowerCase());
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
    writeInstanceUrlToHash(normalized, defaultInstanceUrl);
    updateFeedUrls(normalized);
    setExpanded(false);
    setInstanceFeedback('Using your custom instance.', 'success');
  };

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
  let currentInstanceUrl = readInstanceUrlFromHash(defaultInstanceUrl);
  const searchInput = document.getElementById('search-input');
  const feedItems = Array.from(document.querySelectorAll('[data-domain]'));
  const instanceInput = document.getElementById('instance-url-input');
  const updateFeedUrls = createUpdateFeedUrlsFunction();

  updateInstanceSummary(currentInstanceUrl);

  if (instanceInput) {
    instanceInput.value = currentInstanceUrl;
  }

  setupSearch(searchInput, feedItems);
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
