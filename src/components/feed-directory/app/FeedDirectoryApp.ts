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
import { isFailingLastResult } from '../domain/last-result';
import { buildOpmlDocument } from '../domain/opml';
import { normalizeFilterLanguage } from '../domain/language';
import { debounce } from '../lib/debounce';
import type { FeedDirectoryEntry } from '../domain/types';
import {
  renderFilters,
  renderHeader,
  renderInstancePanel,
  renderResults,
  renderShell,
  type FeedDirectoryRegion,
} from '../ui/render';
import { patchRegion } from './region-patch';
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
  private readonly lastHtml: Partial<Record<FeedDirectoryRegion, string>> = {};

  private readonly debouncedSearch = debounce((value: string) => {
    this.patchFilters({ query: value, page: 1 });
  }, 180);

  constructor(root: HTMLElement) {
    this.root = root;
    this.state = initialState(readFiltersFromUrl(), readInitialInstanceUrl(getDefaultInstanceUrl()));
  }

  start(): void {
    this.root.innerHTML = renderShell(this.state.filters.query);
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

  private viewModel() {
    return buildViewModel(this.state, this.currentPagedSelection());
  }

  private region(name: FeedDirectoryRegion): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(`[data-region="${name}"]`);
  }

  private setRegion(name: FeedDirectoryRegion, html: string): void {
    const host = this.region(name);
    if (!host) return;
    patchRegion(host, html, this.lastHtml[name], () =>
      this.root.querySelector<HTMLElement>('[data-action="toggle-instance"]')
    );
    this.lastHtml[name] = html;
  }

  /** The shell (and search input) is mounted once; only changed regions are replaced. */
  private render(): void {
    const vm = this.viewModel();
    this.setRegion('header', renderHeader(vm));
    this.setRegion('instance', renderInstancePanel(vm));
    this.setRegion('filters', renderFilters(vm));
    this.setRegion('results', renderResults(vm));
    this.syncSearch();
  }

  /** Never overwrite the search box while the user is typing in it. */
  private syncSearch(): void {
    const search = this.root.querySelector<HTMLInputElement>('[data-ref="search"]');
    if (search && search !== document.activeElement && search.value !== this.state.filters.query) {
      search.value = this.state.filters.query;
    }
  }

  /** Patch the live DOM, then record the markup it now matches so the next render is a no-op. */
  private patchResultsInPlace(patch: (host: HTMLElement) => void): void {
    const host = this.region('results');
    if (!host) return;
    patch(host);
    this.lastHtml.results = renderResults(this.viewModel());
  }

  private updateFeedLink(entryId: string): void {
    const entry = this.findEntry(entryId);
    if (!entry) return;
    const url = buildFeedUrl(this.state.instanceUrl, entry, this.state.parametersById[entryId] ?? {});
    this.patchResultsInPlace((host) => {
      host.querySelectorAll<HTMLAnchorElement>('[data-action="open-feed"]').forEach((link) => {
        if (link.dataset.entryId === entryId) link.href = url;
      });
    });
  }

  private updateCopyButtons(): void {
    this.patchResultsInPlace((host) => {
      host.querySelectorAll<HTMLElement>('[data-action="copy-feed"]').forEach((button) => {
        button.textContent = button.dataset.entryId === this.state.copiedEntryId ? 'Copied' : 'Copy';
      });
    });
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
      this.updateFeedLink(entryId);
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
      case 'open-feed': {
        const entryId = actionEl.dataset.entryId;
        const entry = this.findEntry(entryId);
        if (!entry) return;
        if (isFailingLastResult(entry.lastResult) && !this.confirmFailingSubscribe(entry)) {
          event.preventDefault();
        }
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

  private findEntry(entryId: string | undefined): FeedDirectoryEntry | undefined {
    if (!entryId) return undefined;
    return this.state.entries.find((item) => item.id === entryId);
  }

  private confirmFailingSubscribe(entry: FeedDirectoryEntry): boolean {
    const detail =
      entry.lastResult.state === 'empty'
        ? 'The last known scrape on this instance returned no items.'
        : 'The last known scrape on this instance failed.';
    return window.confirm(`${detail} Feeds that recently failed often fail again. Subscribe anyway?`);
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
    const entry = this.findEntry(entryId);
    if (!entry || !entryId) return;
    if (isFailingLastResult(entry.lastResult) && !this.confirmFailingSubscribe(entry)) return;

    const url = buildFeedUrl(this.state.instanceUrl, entry, this.state.parametersById[entryId] ?? {});
    try {
      await navigator.clipboard.writeText(url);
      this.state = { ...this.state, copiedEntryId: entryId };
      this.updateCopyButtons();
      window.setTimeout(() => {
        this.state = { ...this.state, copiedEntryId: null };
        this.updateCopyButtons();
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

    const failingCount = filteredEntries.filter((entry) => isFailingLastResult(entry.lastResult)).length;
    if (failingCount > 0) {
      const detail =
        failingCount === 1
          ? '1 feed in this export had an empty or failed last scrape on this instance.'
          : `${failingCount} feeds in this export had an empty or failed last scrape on this instance.`;
      if (!window.confirm(`${detail} Feeds that recently failed often fail again. Export anyway?`)) {
        return;
      }
    }

    const opml = buildOpmlDocument(this.state.instanceUrl, filteredEntries, this.state.parametersById);
    downloadOpml(opml);
  }
}
