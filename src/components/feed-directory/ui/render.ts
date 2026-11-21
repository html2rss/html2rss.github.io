import { escapeHtml } from '../lib/escape';
import { buildFeedUrl, formatInstanceLabel } from '../domain/feed-url';
import { hasActiveFilters, PAGE_SIZE, paginationItems } from '../domain/filters';
import { displayLanguage, languageAutonym, normalizeFilterLanguage } from '../domain/language';
import { isFailingLastResult } from '../domain/last-result';
import type { CatalogFacets, FacetCounts, FeedDirectoryEntry, LastResult } from '../domain/types';
import type { FeedDirectoryViewModel } from '../app/view-model';

export function renderLastResultIndicator(lastResult: LastResult): string {
  switch (lastResult.state) {
    case 'ok':
      return `<span class="fd-result fd-result-ok" title="Last known scrape on this instance succeeded">Last scrape ok</span>`;
    case 'empty':
      return `<span class="fd-result fd-result-empty" title="Last known scrape on this instance returned no items">Last scrape empty</span>`;
    case 'error':
      return `<span class="fd-result fd-result-error" title="Last known scrape on this instance failed">Last scrape failed</span>`;
    case 'unknown':
      return '';
  }
}

function renderTopicChips(facets: CatalogFacets, counts: FacetCounts, selected: string[]): string {
  if (facets.topics.length === 0) {
    return `<p class="fd-muted fd-empty-hint">Topics appear after the catalog loads.</p>`;
  }

  return facets.topics
    .map((topic) => {
      const active = selected.includes(topic);
      const count = counts.topics.get(topic) ?? 0;
      const disabled = count === 0 && !active;
      return `<button type="button" class="fd-chip${active ? ' is-active' : ''}" data-action="toggle-topic" data-topic="${escapeHtml(topic)}" aria-pressed="${active}"${disabled ? ' disabled' : ''}>${escapeHtml(topic)} <span class="fd-chip-count">${count}</span></button>`;
    })
    .join('');
}

function renderLanguageOptions(facets: CatalogFacets, counts: FacetCounts, selected: string): string {
  const normalizedSelected = normalizeFilterLanguage(selected);
  const options = facets.languages
    .map((language) => {
      const active = language === normalizedSelected;
      const count = counts.languages.get(language) ?? 0;
      const disabled = count === 0 && !active;
      return `<option value="${escapeHtml(language)}"${active ? ' selected' : ''}${disabled ? ' disabled' : ''}>${escapeHtml(languageAutonym(language))} (${count})</option>`;
    })
    .join('');

  return `<option value=""${normalizedSelected ? '' : ' selected'}>All languages</option>${options}`;
}

function renderParameterFields(entry: FeedDirectoryEntry, values: Record<string, string>): string {
  const keys = Object.keys(entry.parameterSchema);
  if (keys.length === 0) return '';

  const fields = keys
    .map((key) => {
      const value = values[key] ?? entry.parameterDefaults[key] ?? '';
      return `<label class="fd-field">
        <span class="fd-field-label">${escapeHtml(key)}</span>
        <input class="fd-input" type="text" data-param-key="${escapeHtml(key)}" data-entry-id="${escapeHtml(entry.id)}" value="${escapeHtml(String(value))}" />
      </label>`;
    })
    .join('');

  return `<div class="fd-params">${fields}</div>`;
}

const MAX_ROW_TOPICS = 2;

function renderFeedRow(entry: FeedDirectoryEntry, vm: FeedDirectoryViewModel): string {
  const language = displayLanguage(entry.language);
  const params = vm.parametersById[entry.id] ?? {};
  const feedUrl = buildFeedUrl(vm.instanceUrl, entry, params);
  const hasParameters = Object.keys(entry.parameterSchema).length > 0;
  const expanded = vm.expandedEntryId === entry.id;
  const copied = vm.copiedEntryId === entry.id;
  const failing = isFailingLastResult(entry.lastResult);
  const resultIndicator = renderLastResultIndicator(entry.lastResult);

  const visibleTopics = entry.topics.slice(0, MAX_ROW_TOPICS);
  const hiddenTopics = entry.topics.slice(MAX_ROW_TOPICS);
  const topicBadges =
    visibleTopics.map((topic) => `<span class="fd-badge">${escapeHtml(topic)}</span>`).join('') +
    (hiddenTopics.length > 0
      ? `<span class="fd-badge" title="${escapeHtml(hiddenTopics.join(', '))}">+${hiddenTopics.length}</span>`
      : '');

  const domainMarkup = entry.channelUrl
    ? `<a class="fd-domain fd-domain-link" href="${escapeHtml(entry.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">${escapeHtml(entry.siteKey)}</a>`
    : `<code class="fd-domain">${escapeHtml(entry.siteKey)}</code>`;

  const moreActions =
    (entry.channelUrl
      ? `<a class="fd-btn fd-btn-ghost fd-btn-compact" href="${escapeHtml(entry.channelUrl)}" target="_blank" rel="noopener noreferrer nofollow">Source</a>`
      : '') +
    (hasParameters
      ? `<button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="toggle-params" data-entry-id="${escapeHtml(entry.id)}" aria-expanded="${expanded}">${expanded ? 'Hide params' : 'Params'}</button>`
      : '');

  const moreMenu = moreActions
    ? `<details class="fd-more" data-entry-id="${escapeHtml(entry.id)}"${vm.openMoreEntryId === entry.id ? ' open' : ''}>
          <summary class="fd-btn fd-btn-ghost fd-btn-compact" data-action="toggle-more" data-entry-id="${escapeHtml(entry.id)}">More</summary>
          <div class="fd-more-menu">${moreActions}</div>
        </details>`
    : '';

  return `<tr class="fd-row${failing ? ' fd-row-failing' : ''}" data-entry-id="${escapeHtml(entry.id)}">
    <td class="fd-cell-feed">
      <article class="fd-feed-card">
        <h3 class="fd-feed-title">${escapeHtml(entry.title)}</h3>
        ${entry.summary ? `<p class="fd-feed-summary" title="${escapeHtml(entry.summary)}">${escapeHtml(entry.summary)}</p>` : ''}
        <div class="fd-feed-meta">
          ${domainMarkup}
          ${language !== '—' ? `<span class="fd-lang">${escapeHtml(language)}</span>` : ''}
          ${topicBadges}
          ${resultIndicator}
        </div>
      </article>
    </td>
    <td class="fd-cell-actions">
      <div class="fd-action-bar">
        <a class="fd-btn fd-btn-primary fd-btn-compact" href="${escapeHtml(feedUrl)}" target="_blank" rel="noopener noreferrer nofollow" data-action="open-feed" data-entry-id="${escapeHtml(entry.id)}">RSS</a>
        <button type="button" class="fd-btn fd-btn-ghost fd-btn-compact" data-action="copy-feed" data-entry-id="${escapeHtml(entry.id)}" aria-label="Copy RSS link">${copied ? 'Copied' : 'Copy'}</button>
        ${moreMenu}
      </div>
    </td>
  </tr>
  ${
    expanded && hasParameters
      ? `<tr class="fd-row fd-row-detail">
      <td colspan="2">
        <div class="fd-detail">
          <p class="fd-detail-title">Customize feed parameters</p>
          ${renderParameterFields(entry, params)}
        </div>
      </td>
    </tr>`
      : ''
  }`;
}

function renderPagination(vm: FeedDirectoryViewModel): string {
  if (vm.filteredTotal <= PAGE_SIZE) return '';

  const prevDisabled = vm.filters.page <= 1;
  const nextDisabled = vm.filters.page >= vm.totalPages;
  const pages = paginationItems(vm.filters.page, vm.totalPages)
    .map((item) =>
      item.kind === 'ellipsis'
        ? `<li class="fd-page-gap" aria-hidden="true">…</li>`
        : `<li><button type="button" class="fd-btn fd-btn-ghost fd-page${item.current ? ' is-current' : ''}" data-action="page-goto" data-page="${item.page}" aria-label="Page ${item.page}"${item.current ? ' aria-current="page"' : ''}>${item.page}</button></li>`
    )
    .join('');

  return `<nav class="fd-pagination" aria-label="Feed list pages">
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-prev" ${prevDisabled ? 'disabled' : ''}>Previous</button>
    <ol class="fd-page-list">${pages}</ol>
    <button type="button" class="fd-btn fd-btn-ghost" data-action="page-next" ${nextDisabled ? 'disabled' : ''}>Next</button>
  </nav>`;
}

export function renderResults(vm: FeedDirectoryViewModel): string {
  if (vm.loadState === 'loading') {
    return `<div class="fd-loading" aria-live="polite">
      <div class="fd-skeleton fd-skeleton-toolbar"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <div class="fd-skeleton fd-skeleton-row"></div>
      <p class="fd-muted">Loading feeds from the instance catalog…</p>
    </div>`;
  }

  if (vm.loadState === 'error' && vm.error) {
    return `<div class="fd-banner fd-banner-error" role="alert">${escapeHtml(vm.error.message)}</div>`;
  }

  if (vm.loadState !== 'ready') return '';

  if (vm.catalogEntryCount === 0) {
    return `<div class="fd-empty">
      <p class="fd-empty-title">No feeds in this catalog</p>
      <p class="fd-muted">Try another instance or contribute a configuration.</p>
    </div>`;
  }

  if (vm.filteredTotal === 0) {
    return `<div class="fd-empty">
      <p class="fd-empty-title">No feeds match your filters</p>
      <p class="fd-muted">Try clearing search text, topics, or language filters.</p>
      <button type="button" class="fd-btn fd-btn-ghost" data-action="clear-filters">Clear filters</button>
    </div>`;
  }

  const rows = vm.pageItems.map((entry) => renderFeedRow(entry, vm)).join('');

  return `<div class="fd-table-wrap">
    <table class="fd-table">
      <colgroup>
        <col class="fd-col-feed" />
        <col class="fd-col-actions" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Feed</th>
          <th scope="col" class="fd-col-actions-heading"><span class="fd-sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  ${renderPagination(vm)}`;
}

export type FeedDirectoryRegion = 'header' | 'instance' | 'filters' | 'results';

/**
 * Mounted once. The search input lives here and is never re-rendered; every
 * other region is a host element that is filled by its own render function.
 */
export function renderShell(initialQuery: string): string {
  return `<div class="fd-shell">
    <header class="fd-header" data-region="header"></header>
    <div style="display: contents" data-region="instance"></div>
    <section class="fd-panel fd-toolbar" aria-label="Search and filters">
      <label>
        <span class="fd-sr-only">Search feeds</span>
        <input class="fd-input fd-search-input" type="search" data-ref="search" value="${escapeHtml(initialQuery)}" placeholder="Search by feed name, site, or domain" enterkeyhint="search" />
      </label>
      <div class="fd-filter-block" data-region="filters"></div>
    </section>
    <div style="display: contents" data-region="results"></div>
  </div>`;
}

export function renderHeader(vm: FeedDirectoryViewModel): string {
  const resultLabel = hasActiveFilters(vm.filters)
    ? `${vm.filteredTotal} matching feed${vm.filteredTotal === 1 ? '' : 's'}`
    : `${vm.catalogTotal} feed${vm.catalogTotal === 1 ? '' : 's'}`;

  return `<div class="fd-header-copy">
      <p class="fd-eyebrow">Feed Directory</p>
      <p class="fd-lead">${escapeHtml(resultLabel)} from <strong>${escapeHtml(formatInstanceLabel(vm.instanceUrl))}</strong></p>
    </div>
    <div class="fd-header-actions">
      <button type="button" class="fd-btn fd-btn-ghost" data-action="toggle-instance" aria-expanded="${vm.instanceEditorOpen}">${vm.instanceEditorOpen ? 'Close instance' : 'Change instance'}</button>
      <button type="button" class="fd-btn fd-btn-ghost" data-action="export-opml" ${vm.filteredTotal === 0 ? 'disabled' : ''}>Export OPML</button>
    </div>`;
}

export function renderInstancePanel(vm: FeedDirectoryViewModel): string {
  if (!vm.instanceEditorOpen) return '';

  const feedback = vm.instanceFeedback;
  const feedbackClass = feedback?.tone ? ` fd-feedback-${feedback.tone}` : '';

  return `<section class="fd-panel" aria-label="Instance settings">
      <label class="fd-field">
        <span class="fd-field-label">Instance URL</span>
        <div class="fd-inline-field">
          <input class="fd-input" type="url" inputmode="url" spellcheck="false" data-ref="instance-draft" value="${escapeHtml(vm.instanceDraft)}" placeholder="https://your-instance.example" />
          <button type="button" class="fd-btn fd-btn-primary" data-action="apply-instance">Apply</button>
        </div>
      </label>
      <p class="fd-feedback${feedbackClass}">${escapeHtml(feedback?.message ?? 'Feed links update when you apply a valid instance URL.')}</p>
    </section>`;
}

export function renderFilters(vm: FeedDirectoryViewModel): string {
  return `<div class="fd-filter-group">
        <span class="fd-field-label">Topics</span>
        <div class="fd-chip-row" role="group" aria-label="Filter by topic">${renderTopicChips(vm.facets, vm.facetCounts, vm.filters.topics)}</div>
      </div>

      <div class="fd-filter-row">
        <label class="fd-field fd-field-inline">
          <span class="fd-field-label">Language</span>
          <select class="fd-select" data-ref="language">${renderLanguageOptions(vm.facets, vm.facetCounts, vm.filters.language)}</select>
        </label>

        <label class="fd-field fd-field-inline">
          <span class="fd-field-label">Sort</span>
          <select class="fd-select" data-ref="sort">
            <option value="relevance"${vm.filters.sort === 'relevance' ? ' selected' : ''}>Best match</option>
            <option value="title"${vm.filters.sort === 'title' ? ' selected' : ''}>Title A–Z</option>
            <option value="site"${vm.filters.sort === 'site' ? ' selected' : ''}>Site A–Z</option>
          </select>
        </label>

        ${
          hasActiveFilters(vm.filters)
            ? `<button type="button" class="fd-btn fd-btn-ghost" data-action="clear-filters">Clear filters</button>`
            : ''
        }
      </div>`;
}

export type { FeedDirectoryViewModel };
