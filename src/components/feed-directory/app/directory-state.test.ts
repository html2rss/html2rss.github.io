import { describe, expect, it } from 'vitest';
import { applyFilterPatch, initialState, selectPagedEntries } from './directory-state';
import { DEFAULT_FILTER_STATE, PAGE_SIZE } from '../domain/filters';
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
