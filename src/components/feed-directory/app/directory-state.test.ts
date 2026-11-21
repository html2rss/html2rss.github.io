import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyFilterPatch, initialState, resetFilters, selectPagedEntries } from './directory-state';
import { DEFAULT_FILTER_STATE, PAGE_SIZE } from '../domain/filters';
import { readFiltersFromUrl, writeFiltersToUrl } from '../adapters/browser-location';
import type { FeedDirectoryEntry } from '../domain/types';

const entry = (id: string, title: string): FeedDirectoryEntry => ({
  id,
  path: `/${id}.rss`,
  siteKey: id.split('/')[0] ?? id,
  title,
  summary: '',
  topics: [],
  channelUrl: `https://${id}`,
  language: '',
  parameterSchema: {},
  parameterDefaults: {},
  lastResult: { state: 'unknown', code: null, at: null },
});

describe('applyFilterPatch', () => {
  it('merges filter patches immutably', () => {
    const state = initialState(DEFAULT_FILTER_STATE, 'https://example.test/');
    const next = applyFilterPatch(state, { query: 'news', page: 2 });
    expect(next.filters.query).toBe('news');
    expect(next.filters.page).toBe(2);
    expect(state.filters.query).toBe('');
  });
});

describe('openMoreEntryId', () => {
  const open = {
    ...initialState(DEFAULT_FILTER_STATE, 'https://example.test/'),
    openMoreEntryId: 'a.example/one',
  };

  it('is cleared when filters or the page change', () => {
    expect(applyFilterPatch(open, { page: 2 }).openMoreEntryId).toBeNull();
    expect(applyFilterPatch(open, { query: 'x', page: 1 }).openMoreEntryId).toBeNull();
    expect(resetFilters(open, DEFAULT_FILTER_STATE).openMoreEntryId).toBeNull();
  });
});

describe('selectPagedEntries', () => {
  it('clamps page without mutating source state', () => {
    const entries = Array.from({ length: PAGE_SIZE + 1 }, (_, index) =>
      entry(`site.example/feed-${index}`, `Feed ${index}`)
    );
    const state = {
      ...initialState(DEFAULT_FILTER_STATE, 'https://example.test/'),
      loadState: 'ready' as const,
      entries,
      catalogTotal: entries.length,
    };
    const paged = selectPagedEntries(applyFilterPatch(state, { page: 99 }));
    expect(paged.pageItems).toHaveLength(1);
    expect(paged.filters.page).toBe(2);
    expect(state.filters.page).toBe(1);
  });
});

describe('selectPagedEntries before the catalog is ready', () => {
  it.each(['idle', 'loading', 'error'] as const)('keeps the requested page while %s', (loadState) => {
    const state = {
      ...applyFilterPatch(initialState(DEFAULT_FILTER_STATE, 'https://example.test/'), { page: 3 }),
      loadState,
    };
    expect(selectPagedEntries(state).filters.page).toBe(3);
  });

  it('clamps once the catalog is ready and the page really exceeds the page count', () => {
    const entries = Array.from({ length: PAGE_SIZE * 3 }, (_, index) =>
      entry(`s.example/f-${index}`, `F ${index}`)
    );
    const ready = {
      ...initialState(DEFAULT_FILTER_STATE, 'https://example.test/'),
      loadState: 'ready' as const,
      entries,
    };
    expect(selectPagedEntries(applyFilterPatch(ready, { page: 3 })).filters.page).toBe(3);
    expect(selectPagedEntries(applyFilterPatch(ready, { page: 4 })).filters.page).toBe(3);
  });
});

describe('selectPagedEntries search ordering', () => {
  const state = (patch: Partial<typeof DEFAULT_FILTER_STATE>) =>
    applyFilterPatch(
      {
        ...initialState(DEFAULT_FILTER_STATE, 'https://example.test/'),
        loadState: 'ready' as const,
        entries: [
          entry('a.example/one', 'Alpha'),
          entry('b.example/two', 'Beta tool'),
          entry('c.example/three', 'Tool'),
        ],
      },
      patch
    );

  it('orders by relevance by default and by title on request', () => {
    expect(selectPagedEntries(state({ query: 'tool' })).filteredEntries.map((e) => e.title)).toEqual([
      'Tool',
      'Beta tool',
    ]);
    expect(
      selectPagedEntries(state({ query: 'tool', sort: 'title' })).filteredEntries.map((e) => e.title)
    ).toEqual(['Beta tool', 'Tool']);
  });
});

describe('sort in the URL', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubWindow = (search: string) => {
    const replaceState = vi.fn();
    vi.stubGlobal('window', {
      location: { search, pathname: '/feed-directory/' },
      history: { replaceState },
    });
    return replaceState;
  };

  it('reads default, title, site, and falls back for unknown', () => {
    stubWindow('');
    expect(readFiltersFromUrl().sort).toBe('relevance');
    stubWindow('?sort=title');
    expect(readFiltersFromUrl().sort).toBe('title');
    stubWindow('?sort=site');
    expect(readFiltersFromUrl().sort).toBe('site');
    stubWindow('?sort=bogus');
    expect(readFiltersFromUrl().sort).toBe('relevance');
  });

  it('keeps the default sort out of the URL and writes the others', () => {
    const replaceState = stubWindow('');
    writeFiltersToUrl({ ...DEFAULT_FILTER_STATE, query: 'x' });
    expect(replaceState).toHaveBeenLastCalledWith({}, '', '/feed-directory/?q=x');
    writeFiltersToUrl({ ...DEFAULT_FILTER_STATE, sort: 'title' });
    expect(replaceState).toHaveBeenLastCalledWith({}, '', '/feed-directory/?sort=title');
    writeFiltersToUrl({ ...DEFAULT_FILTER_STATE, sort: 'site' });
    expect(replaceState).toHaveBeenLastCalledWith({}, '', '/feed-directory/?sort=site');
  });
});
