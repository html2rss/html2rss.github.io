import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTER_STATE, extractFacets, filterEntries, sortEntries } from './filters';
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
    expect(facets.topics).toEqual(['media', 'news']);
    expect(facets.languages).toEqual(['de', 'en']);
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
