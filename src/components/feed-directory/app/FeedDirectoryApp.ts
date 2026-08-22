import { fetchCatalogResponse, mapCatalogError } from '../adapters/catalog-api';
import { clearFilters, readFiltersFromUrl, writeFiltersToUrl } from '../adapters/browser-location';
import {
  getDefaultInstanceUrl,
  normalizeInstanceUrl,
  persistInstanceUrl,
  readInitialInstanceUrl,
} from '../adapters/browser-storage';
import { downloadOpml } from '../adapters/browser-download';
import { buildFeedUrl } from '../domain/feed-url';
import { buildOpmlDocument } from '../domain/opml';
import { normalizeFilterLanguage } from '../domain/language';
import { debounce } from '../lib/debounce';
import { renderFeedDirectory } from '../ui/render';
import {
  applyFilterPatch,
  catalogErrorState,
  catalogReadyState,
  initialState,
  resetFilters,
  selectPagedEntries,
  type DirectoryState,
} from './directory-state';
import { buildViewModel } from './view-model';

export class FeedDirectoryApp {
  private readonly root: HTMLElement;
  private state: DirectoryState;

  private readonly debouncedSearch = debounce((value: string) => {
    this.patchFilters({ query: value, page: 1 });
  }, 180);

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = initialState(readFiltersFromUrl(), readInitialInstanceUrl(getDefaultInstanceUrl()));
  }

  start(): void {
    this.root.addEventListener('click', (event) => this.onClick(event));
    this.root.addEventListener('input', (event) => this.onInput(event));
    this.root.addEventListener('change', (event) => this.onChange(event));
    this.render();
    void this.loadCatalog();
  }

  private async loadCatalog(nextInstanceUrl = this.state.instanceUrl): Promise<void> {
    this.state = { ...this.state, loadState: 'loading', error: null };
    this.render();

    try {
      const { entries, meta } = await fetchCatalogResponse(nextInstanceUrl);
      this.state = catalogReadyState(
        {
          ...this.state,
          instanceUrl: nextInstanceUrl,
          instanceDraft: nextInstanceUrl,
        },
        entries,
        meta.total
      );
    } catch (caught) {
      this.state = catalogErrorState(this.state, mapCatalogError(caught));
    }

    this.render();
  }

  private patchFilters(patch: Parameters<typeof applyFilterPatch>[1]): void {
    this.state = applyFilterPatch(this.state, patch);
    writeFiltersToUrl(this.state.filters);
    this.render();
  }

  private currentPagedSelection() {
    const paged = selectPagedEntries(this.state);
    if (paged.filters.page !== this.state.filters.page) {
      this.state = applyFilterPatch(this.state, { page: paged.filters.page });
      writeFiltersToUrl(this.state.filters);
    }
    return selectPagedEntries(this.state);
  }

  private render(): void {
    const paged = this.currentPagedSelection();
    this.root.innerHTML = renderFeedDirectory(buildViewModel(this.state, paged));
    this.syncRefs();
  }

  private syncRefs(): void {
    const search = this.root.querySelector<HTMLInputElement>('[data-ref="search"]');
    if (search && search.value !== this.state.filters.query) {
      search.value = this.state.filters.query;
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
      const next = { ...(this.state.parametersById[entryId] ?? {}), [paramKey]: target.value };
      this.state = {
        ...this.state,
        parametersById: { ...this.state.parametersById, [entryId]: next },
      };
      this.render();
    }

    if (target.dataset.ref === 'instance-draft') {
      this.state = { ...this.state, instanceDraft: target.value };
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
      this.patchFilters({ sort: target.value as DirectoryState['filters']['sort'], page: 1 });
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
        const selected = new Set(this.state.filters.topics);
        if (selected.has(topic)) selected.delete(topic);
        else selected.add(topic);
        this.patchFilters({ topics: [...selected], page: 1 });
        break;
      }
      case 'clear-filters':
        this.patchFilters(clearFilters(this.state.filters));
        break;
      case 'page-prev':
        if (this.state.filters.page > 1) this.patchFilters({ page: this.state.filters.page - 1 });
        break;
      case 'page-next':
        this.patchFilters({ page: this.state.filters.page + 1 });
        break;
      case 'toggle-instance':
        this.state = {
          ...this.state,
          instanceEditorOpen: !this.state.instanceEditorOpen,
          instanceFeedback: null,
        };
        this.render();
        break;
      case 'apply-instance':
        void this.applyInstance();
        break;
      case 'toggle-params': {
        const entryId = actionEl.dataset.entryId;
        if (!entryId) return;
        this.state = {
          ...this.state,
          expandedEntryId: this.state.expandedEntryId === entryId ? null : entryId,
        };
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
    const normalized = normalizeInstanceUrl(this.state.instanceDraft);
    if (!normalized) {
      this.state = {
        ...this.state,
        instanceFeedback: { message: 'Enter a valid http(s) URL.', tone: 'error' },
      };
      this.render();
      return;
    }

    persistInstanceUrl(normalized, getDefaultInstanceUrl());
    this.state = resetFilters(
      {
        ...this.state,
        instanceEditorOpen: false,
        instanceFeedback: { message: 'Using your custom instance.', tone: 'success' },
      },
      readFiltersFromUrl()
    );
    await this.loadCatalog(normalized);
  }

  private async copyFeed(entryId: string | undefined): Promise<void> {
    if (!entryId) return;
    const entry = this.state.entries.find((item) => item.id === entryId);
    if (!entry) return;

    const url = buildFeedUrl(this.state.instanceUrl, entry, this.state.parametersById[entryId] ?? {});
    try {
      await navigator.clipboard.writeText(url);
      this.state = { ...this.state, copiedEntryId: entryId };
      this.render();
      window.setTimeout(() => {
        this.state = { ...this.state, copiedEntryId: null };
        this.render();
      }, 1400);
    } catch {
      this.state = {
        ...this.state,
        instanceFeedback: { message: 'Could not copy link.', tone: 'error' },
      };
      this.render();
    }
  }

  private exportOpml(): void {
    const { filteredEntries } = selectPagedEntries(this.state);
    if (filteredEntries.length === 0) return;
    const opml = buildOpmlDocument(this.state.instanceUrl, filteredEntries, this.state.parametersById);
    downloadOpml(opml);
  }
}
