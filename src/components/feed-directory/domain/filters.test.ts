import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTER_STATE,
  extractFacets,
  facetCounts,
  filterEntries,
  hasActiveFilters,
  paginateEntries,
  paginationItems,
  PAGE_SIZE,
  sortEntries,
} from './filters';
import type { FeedDirectoryEntry, LastResult } from './types';

const unknownResult: LastResult = { state: 'unknown', code: null, at: null };

const baseEntry = (
  overrides: Partial<FeedDirectoryEntry> & Pick<FeedDirectoryEntry, 'id'>
): FeedDirectoryEntry => ({
  path: `/${overrides.id}.rss`,
  siteKey: overrides.siteKey ?? overrides.id.split('/')[0] ?? overrides.id,
  title: overrides.title ?? overrides.id,
  summary: overrides.summary ?? '',
  topics: overrides.topics ?? [],
  channelUrl: overrides.channelUrl ?? `https://${overrides.id}`,
  language: overrides.language ?? '',
  parameterSchema: overrides.parameterSchema ?? {},
  parameterDefaults: overrides.parameterDefaults ?? {},
  lastResult: overrides.lastResult ?? unknownResult,
  ...overrides,
});

describe('filterEntries', () => {
  const mundo = baseEntry({
    id: 'bbc.com/mundo',
    siteKey: 'bbc.com',
    channelUrl: 'https://www.bbc.com/mundo',
    title: 'BBC — Mundo',
    summary: 'Spanish-language news from BBC Mundo.',
    language: 'es',
    topics: ['news'],
  });
  const sounds = baseEntry({
    id: 'bbc.co.uk/available_episodes',
    siteKey: 'bbc.co.uk',
    channelUrl: 'https://www.bbc.co.uk/programmes/%<id>s/episodes/player',
    title: 'BBC Sounds — Programme episodes',
    topics: ['media'],
  });

  it('filters by word query across searchable fields', () => {
    const hits = filterEntries([mundo, sounds], { ...DEFAULT_FILTER_STATE, query: 'bbc' });
    expect(hits.map((entry) => entry.id)).toEqual(['bbc.com/mundo', 'bbc.co.uk/available_episodes']);
  });

  it('filters by topic and language', () => {
    expect(
      filterEntries([mundo, sounds], { ...DEFAULT_FILTER_STATE, topics: ['news'] }).map((entry) => entry.id)
    ).toEqual(['bbc.com/mundo']);
    expect(
      filterEntries([mundo, sounds], { ...DEFAULT_FILTER_STATE, language: 'es' }).map((entry) => entry.id)
    ).toEqual(['bbc.com/mundo']);
  });
});

describe('sortEntries', () => {
  it('sorts by title and site key', () => {
    const a = baseEntry({ id: 'z.example/feed', siteKey: 'z.example', title: 'Zulu' });
    const b = baseEntry({ id: 'a.example/feed', siteKey: 'a.example', title: 'Alpha' });
    expect(sortEntries([a, b], 'title').map((entry) => entry.id)).toEqual([
      'a.example/feed',
      'z.example/feed',
    ]);
    expect(sortEntries([a, b], 'site').map((entry) => entry.id)).toEqual([
      'a.example/feed',
      'z.example/feed',
    ]);
  });

  it('demotes empty and error below ok and unknown', () => {
    const error = baseEntry({
      id: 'a.example/error',
      title: 'Alpha error',
      lastResult: { state: 'error', code: 'X', at: null },
    });
    const empty = baseEntry({
      id: 'b.example/empty',
      title: 'Beta empty',
      lastResult: { state: 'empty', code: null, at: null },
    });
    const unknown = baseEntry({
      id: 'c.example/unknown',
      title: 'Charlie unknown',
      lastResult: { state: 'unknown', code: null, at: null },
    });
    const ok = baseEntry({
      id: 'd.example/ok',
      title: 'Delta ok',
      lastResult: { state: 'ok', code: null, at: '2026-08-29T08:00:00Z' },
    });

    expect(sortEntries([error, empty, unknown, ok], 'title').map((entry) => entry.id)).toEqual([
      'd.example/ok',
      'c.example/unknown',
      'b.example/empty',
      'a.example/error',
    ]);
  });
});

describe('extractFacets', () => {
  it('collects unique topics and base languages', () => {
    const facets = extractFacets([
      baseEntry({ id: 'a.example/one', topics: ['news'], language: 'en-US' }),
      baseEntry({ id: 'b.example/two', topics: ['media', 'news'], language: 'de-DE' }),
    ]);
    expect(facets.topics).toEqual(['news', 'media']);
    expect(facets.languages).toEqual(['de', 'en']);
  });

  it('orders topics by catalog size descending, then name, independent of filters', () => {
    const entries = [
      baseEntry({ id: 'a.example/1', topics: ['zeta', 'beta'] }),
      baseEntry({ id: 'a.example/2', topics: ['alpha', 'beta'] }),
      baseEntry({ id: 'a.example/3', topics: ['beta', 'zeta', 'alpha'] }),
      baseEntry({ id: 'a.example/4', topics: ['gamma'] }),
    ];
    expect(extractFacets(entries).topics).toEqual(['beta', 'alpha', 'zeta', 'gamma']);
  });
});

describe('page size', () => {
  it('shows 50 feeds per page', () => {
    expect(PAGE_SIZE).toBe(50);
    const items = Array.from({ length: 120 }, (_, index) => index);
    const page3 = paginateEntries(items, 3);
    expect(page3.items).toHaveLength(20);
    expect(page3.totalPages).toBe(3);
    expect(paginateEntries(items, 1).items).toHaveLength(50);
  });
});

describe('paginationItems', () => {
  const label = (page: number, total: number) =>
    paginationItems(page, total).map((item) =>
      item.kind === 'ellipsis' ? '…' : item.current ? `[${item.page}]` : String(item.page)
    );

  it('lists every page up to seven', () => {
    expect(label(1, 1)).toEqual(['[1]']);
    expect(label(3, 7)).toEqual(['1', '2', '[3]', '4', '5', '6', '7']);
  });

  it('shows first, last, current ±1 and ellipses beyond seven', () => {
    expect(label(1, 20)).toEqual(['[1]', '2', '…', '20']);
    expect(label(2, 20)).toEqual(['1', '[2]', '3', '…', '20']);
    expect(label(10, 20)).toEqual(['1', '…', '9', '[10]', '11', '…', '20']);
    expect(label(19, 20)).toEqual(['1', '…', '18', '[19]', '20']);
    expect(label(20, 20)).toEqual(['1', '…', '19', '[20]']);
  });

  it('shows a page instead of an ellipsis that would hide only one', () => {
    expect(label(4, 8)).toEqual(['1', '2', '3', '[4]', '5', '…', '8']);
    expect(label(5, 9)).toEqual(['1', '…', '4', '[5]', '6', '…', '9']);
    expect(label(6, 9)).toEqual(['1', '…', '5', '[6]', '7', '8', '9']);
  });

  it('marks exactly one current page and clamps out-of-range input', () => {
    expect(paginationItems(4, 8).filter((item) => item.kind === 'page' && item.current)).toHaveLength(1);
    expect(label(99, 8)).toEqual(['1', '…', '7', '[8]']);
  });
});

describe('facetCounts', () => {
  const entries = [
    baseEntry({ id: 'a.example/1', title: 'Alpha news', topics: ['news', 'tech'], language: 'en-US' }),
    baseEntry({ id: 'b.example/2', title: 'Beta news', topics: ['news'], language: 'de-DE' }),
    baseEntry({ id: 'c.example/3', title: 'Gamma tech', topics: ['tech'], language: 'de' }),
    baseEntry({ id: 'd.example/4', title: 'Delta other', topics: ['misc'], language: 'fr' }),
  ];

  it('counts every entry with no filters', () => {
    const { topics, languages } = facetCounts(entries, DEFAULT_FILTER_STATE);
    expect([...topics]).toEqual([
      ['news', 2],
      ['tech', 2],
      ['misc', 1],
    ]);
    expect(Object.fromEntries(languages)).toEqual({ en: 1, de: 2, fr: 1 });
  });

  it('applies the query to both facets', () => {
    const { topics, languages } = facetCounts(entries, { ...DEFAULT_FILTER_STATE, query: 'news' });
    expect(Object.fromEntries(topics)).toEqual({ news: 2, tech: 1 });
    expect(Object.fromEntries(languages)).toEqual({ en: 1, de: 1 });
  });

  it('counts topics under the language, ignoring selected topics', () => {
    const { topics } = facetCounts(entries, { ...DEFAULT_FILTER_STATE, language: 'de', topics: ['misc'] });
    expect(Object.fromEntries(topics)).toEqual({ news: 1, tech: 1 });
    expect(topics.get('misc')).toBeUndefined();
  });

  it('counts languages under the topics (any of), ignoring the selected language', () => {
    const { languages } = facetCounts(entries, {
      ...DEFAULT_FILTER_STATE,
      topics: ['news', 'misc'],
      language: 'de',
    });
    expect(Object.fromEntries(languages)).toEqual({ en: 1, de: 1, fr: 1 });
  });

  it('reports zero for options the filters exclude', () => {
    const { topics, languages } = facetCounts(entries, { ...DEFAULT_FILTER_STATE, query: 'delta' });
    expect(topics.get('news') ?? 0).toBe(0);
    expect(languages.get('de') ?? 0).toBe(0);
    expect(topics.get('misc')).toBe(1);
  });
});

describe('hasActiveFilters', () => {
  it('ignores the page alone', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, page: 2 })).toBe(false);
  });

  it('detects query, topic and language', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, query: ' x ' })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, topics: ['a'] })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, language: 'de' })).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_FILTER_STATE, query: '  ' })).toBe(false);
  });
});

describe('search matching', () => {
  const ids = (entries: FeedDirectoryEntry[]) => entries.map((entry) => entry.id);
  const search = (entries: FeedDirectoryEntry[], query: string) =>
    filterEntries(entries, { ...DEFAULT_FILTER_STATE, query });

  it('matches literal substrings, not subsequences', () => {
    const twoDs = baseEntry({ id: 'a.example/x', title: 'Dog diary' });
    const literal = baseEntry({ id: 'b.example/y', title: 'Odd news' });
    expect(ids(search([twoDs, literal], 'dd'))).toEqual(['b.example/y']);
  });

  it('requires every word, each in any field', () => {
    const both = baseEntry({ id: 'a.example/one', title: 'Rust weekly', topics: ['news'] });
    const onlyOne = baseEntry({ id: 'b.example/two', title: 'Rust blog', topics: ['dev'] });
    expect(ids(search([both, onlyOne], 'rust news'))).toEqual(['a.example/one']);
    expect(ids(search([both, onlyOne], '  RUST  '))).toEqual(['a.example/one', 'b.example/two']);
  });

  it('ignores URL boilerplate in site fields', () => {
    const bbc = baseEntry({
      id: 'bbc.co.uk/news',
      siteKey: 'bbc.co.uk',
      channelUrl: 'https://www.bbc.co.uk/news',
      title: 'Headlines',
    });
    for (const word of ['https', 'www', 'com', 'bc', 'uk']) expect(search([bbc], word)).toEqual([]);
    for (const word of ['bbc', 'news', 'bbc.co.uk', 'bbc.co.uk/news']) {
      expect(ids(search([bbc], word))).toEqual([bbc.id]);
    }
    const example = baseEntry({ id: 'example.com/news', siteKey: 'example.com', title: 'Headlines' });
    expect(ids(search([example], 'example.com/news'))).toEqual([example.id]);
  });

  it('tolerates template and invalid channel URLs', () => {
    const template = baseEntry({ id: 'a.example/t', channelUrl: 'https://%<host>s/%<id>s', title: 'T' });
    const invalid = baseEntry({ id: 'b.example/i', channelUrl: 'not a url', title: 'I' });
    expect(ids(search([template, invalid], '.example'))).toEqual(['a.example/t', 'b.example/i']);
  });

  it('ranks a multi-word exact title above longer titles, even when failing', () => {
    const longer = baseEntry({ id: 'a.example/l', title: 'BBC News Mundo' });
    const exact = baseEntry({
      id: 'b.example/e',
      title: 'BBC News',
      lastResult: { state: 'error', code: 'X', at: null },
    });
    expect(ids(sortEntries([longer, exact], 'relevance', ' bbc  NEWS '))).toEqual([
      'b.example/e',
      'a.example/l',
    ]);
  });

  it('does not search language', () => {
    expect(search([baseEntry({ id: 'a.example/one', language: 'es' })], 'es')).toEqual([]);
  });

  it('ranks title over site, topic, and summary matches', () => {
    const summary = baseEntry({ id: 'a.example/s', title: 'Aaa', summary: 'about zebra' });
    const topic = baseEntry({ id: 'b.example/t', title: 'Bbb', topics: ['zebra'] });
    const site = baseEntry({ id: 'zebra.example/u', siteKey: 'zebra.example', title: 'Ccc' });
    const title = baseEntry({ id: 'd.example/v', title: 'The big zebra' });
    expect(ids(sortEntries([summary, topic, site, title], 'relevance', 'zebra'))).toEqual([
      'd.example/v',
      'zebra.example/u',
      'b.example/t',
      'a.example/s',
    ]);
  });

  it('ranks exact title over prefix over substring', () => {
    const substring = baseEntry({ id: 'a.example/a', title: 'Unfeeding' });
    const prefix = baseEntry({ id: 'b.example/b', title: 'Feed reader' });
    const exact = baseEntry({ id: 'c.example/c', title: 'Feed' });
    expect(ids(sortEntries([substring, prefix, exact], 'relevance', 'feed'))).toEqual([
      'c.example/c',
      'b.example/b',
      'a.example/a',
    ]);
  });

  it('keeps a failing better match above a healthy weaker match under relevance', () => {
    const failing = baseEntry({
      id: 'a.example/f',
      title: 'Zebra',
      lastResult: { state: 'error', code: 'X', at: null },
    });
    const healthy = baseEntry({
      id: 'b.example/h',
      title: 'Other',
      summary: 'zebra',
      lastResult: { state: 'ok', code: null, at: null },
    });
    expect(ids(sortEntries([healthy, failing], 'relevance', 'zebra'))).toEqual([
      'a.example/f',
      'b.example/h',
    ]);
    expect(ids(sortEntries([failing, healthy], 'title', 'zebra'))).toEqual(['b.example/h', 'a.example/f']);
    expect(ids(sortEntries([failing, healthy], 'site', 'zebra'))).toEqual(['b.example/h', 'a.example/f']);
  });

  it('orders relevance without a query like the title sort', () => {
    const entries = [
      baseEntry({ id: 'z.example/z', title: 'Zulu' }),
      baseEntry({
        id: 'e.example/e',
        title: 'Alpha',
        lastResult: { state: 'error', code: 'X', at: null },
      }),
      baseEntry({ id: 'm.example/m', title: 'Mike' }),
    ];
    expect(ids(sortEntries(entries, 'relevance'))).toEqual(ids(sortEntries(entries, 'title')));
    expect(ids(sortEntries(entries, 'relevance', '   '))).toEqual([
      'm.example/m',
      'z.example/z',
      'e.example/e',
    ]);
  });
});
