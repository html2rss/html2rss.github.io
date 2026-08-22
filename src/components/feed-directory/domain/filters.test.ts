import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTER_STATE, extractFacets, filterEntries, fuzzyMatch, sortEntries } from './filters';
import type { FeedDirectoryEntry } from './types';

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

  it('filters by fuzzy query across searchable text', () => {
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

describe('fuzzyMatch', () => {
  it('matches subsequence queries case-insensitively', () => {
    expect(fuzzyMatch('Anthropic News', 'anth')).toBe(true);
    expect(fuzzyMatch('Anthropic News', 'xyz')).toBe(false);
  });
});
