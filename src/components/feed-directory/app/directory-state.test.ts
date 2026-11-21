import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyFilterPatch, initialState, selectPagedEntries } from './directory-state';
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
