import { fetchCatalog, mapCatalogError } from '../domain/catalog';
import {
  DEFAULT_FILTER_STATE,
  extractFacets,
  filterEntries,
  paginateEntries,
  PAGE_SIZE,
  sortEntries,
} from '../domain/filters';
import {
  buildFeedUrl,
  getDefaultInstanceUrl,
  normalizeInstanceUrl,
  persistInstanceUrl,
  readInitialInstanceUrl,
} from '../domain/instance';
import { buildOpmlDocument, downloadOpml } from '../domain/opml';
import type { CatalogEntry, CatalogFacets, FilterState, LoadState } from '../domain/types';
import { clearFilters, readFiltersFromUrl, writeFiltersToUrl } from '../domain/url-state';
import { normalizeFilterLanguage } from '../domain/language';
import { debounce } from '../lib/debounce';
import { renderFeedDirectory, type RenderContext } from '../ui/render';

export class FeedDirectoryApp {
  private readonly root: HTMLElement;
  private loadState: LoadState = 'idle';
  private entries: CatalogEntry[] = [];
  private facets: CatalogFacets = { topics: [], languages: [] };
  private catalogTotal = 0;
  private filters: FilterState = readFiltersFromUrl();
  private instanceUrl = readInitialInstanceUrl(getDefaultInstanceUrl());
  private instanceDraft = this.instanceUrl;
  private instanceEditorOpen = false;
  private instanceFeedback: RenderContext['instanceFeedback'] = null;
  private expandedEntryId: string | null = null;
  private parametersById: Record<string, Record<string, string>> = {};
  private copiedEntryId: string | null = null;
  private error: RenderContext['error'] = null;

  private readonly debouncedSearch = debounce((value: string) => {
    this.patchFilters({ query: value, page: 1 });
  }, 180);

  constructor(root: HTMLElement) {
    this.root = root;
  }

  start(): void {
    this.root.addEventListener('click', (event) => this.onClick(event));
    this.root.addEventListener('input', (event) => this.onInput(event));
    this.root.addEventListener('change', (event) => this.onChange(event));
    this.render();
    void this.loadCatalog();
  }

  private async loadCatalog(nextInstanceUrl = this.instanceUrl): Promise<void> {
    this.loadState = 'loading';
    this.error = null;
    this.render();

    try {
      const { configs, meta } = await fetchCatalog(nextInstanceUrl);
      this.instanceUrl = nextInstanceUrl;
      this.instanceDraft = nextInstanceUrl;
      this.entries = configs;
      this.catalogTotal = meta.total ?? configs.length;
      this.facets = extractFacets(configs);
      this.loadState = 'ready';
      this.error = null;
      this.expandedEntryId = null;
      this.parametersById = {};
    } catch (caught) {
      this.loadState = 'error';
      this.error = mapCatalogError(caught);
      this.entries = [];
      this.facets = { topics: [], languages: [] };
      this.catalogTotal = 0;
    }

    this.render();
  }

  private patchFilters(patch: Partial<FilterState>): void {
    this.filters = { ...this.filters, ...patch };
    writeFiltersToUrl(this.filters);
    this.render();
  }

  private filteredEntries(): CatalogEntry[] {
    return sortEntries(filterEntries(this.entries, this.filters), this.filters.sort);
  }

  private pagedResults() {
    const filtered = this.filteredEntries();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(this.filters.page, 1), totalPages);

    if (safePage !== this.filters.page) {
      this.filters = { ...this.filters, page: safePage };
      writeFiltersToUrl(this.filters);
    }

    return paginateEntries(filtered, safePage);
  }

  private buildContext(): RenderContext {
    const { items, totalPages, total } = this.pagedResults();

    return {
      loadState: this.loadState,
      error: this.error,
      instanceUrl: this.instanceUrl,
      instanceEditorOpen: this.instanceEditorOpen,
      instanceDraft: this.instanceDraft,
      instanceFeedback: this.instanceFeedback,
      filters: this.filters,
      facets: this.facets,
      entries: this.entries,
      filteredTotal: total,
      pageItems: items,
      totalPages,
      catalogTotal: this.catalogTotal,
      expandedEntryId: this.expandedEntryId,
      parametersById: this.parametersById,
      copiedEntryId: this.copiedEntryId,
    };
  }

  private render(): void {
    this.root.innerHTML = renderFeedDirectory(this.buildContext());
    this.syncRefs();
  }

  private syncRefs(): void {
    const search = this.root.querySelector<HTMLInputElement>('[data-ref="search"]');
    if (search && search.value !== this.filters.query) {
      search.value = this.filters.query;
    }
  }

  private onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;

    if (target.dataset.ref === 'search') {
      this.debouncedSearch(target.value);
      return;
    }

    const entryId = target.dataset.entryId;
    const paramKey = target.dataset.paramKey;
    if (entryId && paramKey) {
      const next = { ...(this.parametersById[entryId] ?? {}), [paramKey]: target.value };
      this.parametersById = { ...this.parametersById, [entryId]: next };
      this.render();
    }

    if (target.dataset.ref === 'instance-draft') {
      this.instanceDraft = target.value;
    }
  }

  private onChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.dataset.ref === 'language') {
      this.patchFilters({ language: normalizeFilterLanguage(target.value), page: 1 });
      return;
    }

    if (target.dataset.ref === 'sort') {
      this.patchFilters({ sort: target.value as FilterState['sort'], page: 1 });
    }
  }

  private onClick(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const actionEl = target.closest<HTMLElement>('[data-action]');
    if (!actionEl) return;

    const action = actionEl.dataset.action;
    if (!action) return;

    switch (action) {
      case 'toggle-topic': {
        const topic = actionEl.dataset.topic;
        if (!topic) return;
        const selected = new Set(this.filters.topics);
        if (selected.has(topic)) selected.delete(topic);
        else selected.add(topic);
        this.patchFilters({ topics: [...selected], page: 1 });
        break;
      }
      case 'clear-filters':
        this.patchFilters(clearFilters(this.filters));
        break;
      case 'page-prev':
        if (this.filters.page > 1) this.patchFilters({ page: this.filters.page - 1 });
        break;
      case 'page-next':
        this.patchFilters({ page: this.filters.page + 1 });
        break;
      case 'toggle-instance':
        this.instanceEditorOpen = !this.instanceEditorOpen;
        this.instanceFeedback = null;
        this.render();
        break;
      case 'apply-instance':
        void this.applyInstance();
        break;
      case 'toggle-params': {
        const entryId = actionEl.dataset.entryId;
        if (!entryId) return;
        this.expandedEntryId = this.expandedEntryId === entryId ? null : entryId;
        this.render();
        break;
      }
      case 'copy-feed':
        void this.copyFeed(actionEl.dataset.entryId);
        break;
      case 'export-opml':
        this.exportOpml();
        break;
      default:
        break;
    }
  }

  private async applyInstance(): Promise<void> {
    const normalized = normalizeInstanceUrl(this.instanceDraft);
    if (!normalized) {
      this.instanceFeedback = { message: 'Enter a valid http(s) URL.', tone: 'error' };
      this.render();
      return;
    }

    persistInstanceUrl(normalized, getDefaultInstanceUrl());
    this.instanceEditorOpen = false;
    this.instanceFeedback = { message: 'Using your custom instance.', tone: 'success' };
    this.filters = { ...DEFAULT_FILTER_STATE, ...readFiltersFromUrl() };
    await this.loadCatalog(normalized);
  }

  private async copyFeed(entryId: string | undefined): Promise<void> {
    if (!entryId) return;
    const entry = this.entries.find((item) => item.id === entryId);
    if (!entry) return;

    const url = buildFeedUrl(this.instanceUrl, entry, this.parametersById[entryId] ?? {});
    try {
      await navigator.clipboard.writeText(url);
      this.copiedEntryId = entryId;
      this.render();
      window.setTimeout(() => {
        this.copiedEntryId = null;
        this.render();
      }, 1400);
    } catch {
      this.instanceFeedback = { message: 'Could not copy link.', tone: 'error' };
      this.render();
    }
  }

  private exportOpml(): void {
    const entries = this.filteredEntries();
    if (entries.length === 0) return;
    const opml = buildOpmlDocument(this.instanceUrl, entries, this.parametersById);
    downloadOpml(opml);
  }
}
