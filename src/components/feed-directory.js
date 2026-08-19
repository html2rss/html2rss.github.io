import {
  CatalogDisabledError,
  CatalogInvalidEnvelopeError,
  CatalogNetworkError,
  fetchCatalog,
} from './catalogClient.js';
import {
  buildFeedUrl,
  formatInstanceLabel,
  getDefaultInstanceUrl,
  normalizeInstanceUrl,
  readInitialInstanceUrl,
  writeInstanceUrl,
} from './instanceUrl.js';

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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function setCatalogStatus(message, state = 'idle') {
  const status = document.querySelector('[data-catalog-status]');
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
  status.hidden = !message;
}

function setInstanceFeedback(message, state) {
  const feedback = document.querySelector('[data-instance-feedback]');
  if (!feedback) return;
  feedback.textContent = message;
  feedback.dataset.state = state;
}

function updateInstanceSummary(instanceUrl) {
  const host = document.querySelector('[data-instance-host]');
  if (host) {
    host.textContent = formatInstanceLabel(instanceUrl);
  }
}

function populateTopicFilters(configs) {
  const container = document.querySelector('[data-topic-chips]');
  if (!container) return;

  const topics = [...new Set(configs.flatMap((entry) => entry.directory?.topics || []))].sort();
  container.innerHTML = topics
    .map(
      (topic) =>
        `<button type="button" class="topic-chip" data-topic-filter="${escapeHtml(topic)}" aria-pressed="false">${escapeHtml(topic)}</button>`
    )
    .join('');
}

function populateLanguageFilter(configs) {
  const select = document.querySelector('[data-language-filter]');
  if (!select) return;

  const languages = [...new Set(configs.map((entry) => entry.channel?.language).filter(Boolean))].sort();
  select.innerHTML =
    '<option value="">All languages</option>' +
    languages
      .map((language) => `<option value="${escapeHtml(language)}">${escapeHtml(language)}</option>`)
      .join('');
}

function renderParameterForm(entry, index) {
  const schema = entry.parameters?.schema || {};
  const defaults = entry.parameters?.defaults || {};
  const keys = Object.keys(schema);
  if (keys.length === 0) return '';

  const fields = keys
    .map((key) => {
      const defaultValue = defaults[key] ?? '';
      return `<div class="form-group">
        <label for="param-${index}-${escapeHtml(key)}" class="form-label">${escapeHtml(key)}</label>
        <input type="text" id="param-${index}-${escapeHtml(key)}" name="${escapeHtml(key)}" class="form-input" value="${escapeHtml(defaultValue)}" data-param-key="${escapeHtml(key)}" aria-label="${escapeHtml(key)}" />
      </div>`;
    })
    .join('');

  return `<div class="parameter-form" id="params-${index}" hidden>
    <form class="form">${fields}
      <div class="form-actions">
        <button type="button" class="done-button" data-close-form aria-label="Close customization">Done</button>
      </div>
    </form>
  </div>`;
}

function renderCatalogRow(entry, index, instanceUrl) {
  const title = entry.directory?.title || entry.id;
  const summary = entry.directory?.summary || '';
  const topics = (entry.directory?.topics || []).join(' ');
  const language = entry.channel?.language || '';
  const feedUrl = buildFeedUrl(instanceUrl, entry, entry.parameters?.defaults || {});
  const sourceUrl = entry.channel?.url || '';
  const searchable = `${entry.id} ${title} ${summary} ${sourceUrl} ${topics} ${language}`;
  const hasParameters = Object.keys(entry.parameters?.schema || {}).length > 0;
  const [domain, ...nameParts] = entry.id.split('/');
  const name = nameParts.join('/');

  return `<article class="feed-row" data-entry-id="${escapeHtml(entry.id)}" data-domain="${escapeHtml(domain)}" data-name="${escapeHtml(name)}" data-topics="${escapeHtml(topics)}" data-language="${escapeHtml(language)}" data-searchable="${escapeHtml(searchable)}">
    <div class="feed-info">
      <div class="feed-mainline">
        <h2 class="feed-title">${escapeHtml(title)}</h2>
        <div class="feed-actions">
          <a href="${escapeHtml(feedUrl)}" target="_blank" rel="noopener noreferrer nofollow" data-feed-url class="action action-primary" aria-label="Open RSS feed" title="Open RSS feed"><span>RSS</span></a>
        </div>
      </div>
      <div class="feed-subline">
        ${summary ? `<p class="feed-summary">${escapeHtml(summary)}</p>` : '<span aria-hidden="true"></span>'}
        <details class="feed-advanced">
          <summary>Advanced</summary>
          <div class="feed-meta">
            ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer nofollow" class="meta-link" title="${escapeHtml(sourceUrl)}"><span>View source</span></a>` : ''}
            ${language ? `<span class="meta-tag">${escapeHtml(language)}</span>` : ''}
            ${hasParameters ? `<button class="meta-link" type="button" aria-expanded="false" aria-controls="params-${index}" data-target="params-${index}"><span>Customize</span></button>` : ''}
            <button type="button" data-copy-feed class="meta-link" aria-label="Copy RSS link" title="Copy RSS link"><span>Copy link</span></button>
          </div>
        </details>
      </div>
    </div>
    ${renderParameterForm(entry, index)}
  </article>`;
}

function updateFeedLinks(instanceUrl) {
  document.querySelectorAll('[data-entry-id]').forEach((item) => {
    const feedLink = item.querySelector('[data-feed-url]');
    if (!feedLink) return;

    const params = {};
    item.querySelectorAll('[data-param-key]').forEach((input) => {
      if (input.value) params[input.dataset.paramKey] = input.value;
    });

    const entry = {
      id: item.dataset.entryId,
      path: `/${item.dataset.entryId}.rss`,
    };
    feedLink.href = buildFeedUrl(instanceUrl, entry, params);
  });
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

  if (resultCount) resultCount.textContent = String(visibleCount);
  if (resultLabel) {
    resultLabel.textContent = hasActiveFilters
      ? visibleCount === 1
        ? 'matching feed'
        : 'matching feeds'
      : visibleCount === 1
        ? 'ready-to-use feed'
        : 'ready-to-use feeds';
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

  if (searchInput) searchInput.addEventListener('input', applyFilters);

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-topic-filter]');
    if (!button) return;
    const pressed = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!pressed));
    applyFilters();
  });

  const languageFilter = document.querySelector('[data-language-filter]');
  if (languageFilter) languageFilter.addEventListener('change', applyFilters);

  applyFilters();
}

function buildOpmlDocument(visibleItems) {
  const outlines = visibleItems
    .map((item) => {
      const feedLink = item.querySelector('[data-feed-url]');
      const title = item.querySelector('.feed-title')?.textContent?.trim() || item.dataset.entryId;
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

function setupInstanceEditor(
  defaultInstanceUrl,
  getCurrentInstanceUrl,
  setCurrentInstanceUrl,
  updateFeedUrls,
  reloadCatalog
) {
  const toggle = document.querySelector('[data-toggle-instance]');
  const editor = document.getElementById('instance-editor');
  const input = document.getElementById('instance-url-input');
  const apply = document.querySelector('[data-apply-instance]');
  if (!toggle || !editor || !input || !apply) return;

  const directory = document.querySelector('[data-feed-directory]');
  if (directory) directory.dataset.enhanced = 'true';

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

  const applyInstance = async () => {
    const normalized = normalizeInstanceUrl(input.value);
    if (!normalized) {
      setInstanceFeedback('Enter a valid URL.', 'error');
      return;
    }

    setCurrentInstanceUrl(normalized);
    input.value = normalized;
    updateInstanceSummary(normalized);
    writeInstanceUrl(normalized, defaultInstanceUrl);
    setExpanded(false);
    setInstanceFeedback('Using your custom instance.', 'success');
    await reloadCatalog(normalized);
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
  document.addEventListener('click', (event) => {
    const sourceButton = event.target.closest('[data-target]');
    if (!sourceButton) return;

    const form = document.getElementById(sourceButton.dataset.target);
    if (!form) return;

    const isExpanded = !form.hidden;
    form.hidden = isExpanded;
    sourceButton.setAttribute('aria-expanded', String(!isExpanded));
    const label = sourceButton.querySelector('span');
    if (label) label.textContent = isExpanded ? 'Customize' : 'Close';

    if (!isExpanded) updateFeedUrls(getCurrentInstanceUrl());
  });
}

function setupCloseForms() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-close-form]');
    if (!button) return;

    const form = button.closest('.parameter-form');
    const toggle = document.querySelector(`[data-target="${form?.id}"]`);
    if (!form || !toggle) return;

    form.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    const label = toggle.querySelector('span');
    if (label) label.textContent = 'Customize';
  });
}

function setupParameterInputs(updateFeedUrls, getCurrentInstanceUrl) {
  document.addEventListener(
    'input',
    debounce((event) => {
      if (!event.target.matches('.form-input')) return;
      updateFeedUrls(getCurrentInstanceUrl());
    }, 180)
  );
}

function setupCopyButtons() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-feed]');
    if (!button) return;

    const feedLink = button.closest('[data-entry-id]')?.querySelector('[data-feed-url]');
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
}

async function renderCatalog(instanceUrl) {
  const root = document.querySelector('[data-feed-list]');
  const searchInput = document.getElementById('search-input');
  if (!root) return;

  setCatalogStatus('Loading feeds from the instance catalog…', 'loading');
  root.innerHTML = '';

  try {
    const { configs } = await fetchCatalog(instanceUrl);
    populateTopicFilters(configs);
    populateLanguageFilter(configs);
    root.innerHTML = configs.map((entry, index) => renderCatalogRow(entry, index, instanceUrl)).join('');

    const feedItems = Array.from(root.querySelectorAll('[data-entry-id]'));
    document
      .querySelector('[data-result-count]')
      ?.replaceChildren(document.createTextNode(String(feedItems.length)));
    setCatalogStatus('', 'idle');
    setupFilters(searchInput, feedItems);
    setupOpmlExport(feedItems);
    updateFeedLinks(instanceUrl);
  } catch (error) {
    root.innerHTML = '';
    document.querySelector('[data-empty-state]')?.setAttribute('hidden', '');
    if (error instanceof CatalogDisabledError) {
      setCatalogStatus('This instance has the feed catalog disabled.', 'error');
    } else if (error instanceof CatalogInvalidEnvelopeError) {
      setCatalogStatus('The instance returned an unexpected catalog response.', 'error');
    } else if (error instanceof CatalogNetworkError) {
      setCatalogStatus('Could not load the feed catalog from this instance.', 'error');
    } else {
      setCatalogStatus('Could not load the feed catalog.', 'error');
    }
  }
}

function initializeFeedDirectory() {
  const defaultInstanceUrl = getDefaultInstanceUrl();
  let currentInstanceUrl = readInitialInstanceUrl(defaultInstanceUrl);
  const instanceInput = document.getElementById('instance-url-input');
  const updateFeedUrls = () => updateFeedLinks(currentInstanceUrl);
  const reloadCatalog = async (nextUrl) => {
    currentInstanceUrl = nextUrl;
    await renderCatalog(currentInstanceUrl);
  };

  updateInstanceSummary(currentInstanceUrl);
  if (instanceInput) instanceInput.value = currentInstanceUrl;

  setupInstanceEditor(
    defaultInstanceUrl,
    () => currentInstanceUrl,
    (nextUrl) => {
      currentInstanceUrl = nextUrl;
    },
    updateFeedUrls,
    reloadCatalog
  );
  setupParameterForms(updateFeedUrls, () => currentInstanceUrl);
  setupCloseForms();
  setupParameterInputs(updateFeedUrls, () => currentInstanceUrl);
  setupCopyButtons();

  renderCatalog(currentInstanceUrl);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFeedDirectory);
} else {
  initializeFeedDirectory();
}
