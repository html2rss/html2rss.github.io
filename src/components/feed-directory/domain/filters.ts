import type { CatalogFacets, FeedDirectoryEntry, FilterState, SortKey } from './types';
import { baseLanguageCode, languageMatches } from './language';
import { lastResultSortRank } from './last-result';

export const PAGE_SIZE = 25;

export const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  topics: [],
  language: '',
  sort: 'relevance',
  page: 1,
};

const SCORE_TITLE_EXACT = 70;
const SCORE_TITLE_PREFIX = 60;
const SCORE_TITLE_SUBSTRING = 50;
const SCORE_SITE = 40;
const SCORE_TOPIC = 30;
const SCORE_SUMMARY = 20;

export function queryWords(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

const SCORE_EXACT_QUERY = 1000;

function normalizedHost(channelUrl: string): string {
  try {
    return new URL(channelUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Host labels without the TLD, so `com` and `uk` never match as site words. */
function hostLabels(host: string): string[] {
  return host.split('.').filter(Boolean).slice(0, -1);
}

function siteMatches(entry: FeedDirectoryEntry, word: string): boolean {
  const host = normalizedHost(entry.channelUrl);
  const id = entry.id.toLowerCase();
  const siteKey = entry.siteKey.toLowerCase();
  if (word.includes('.') || word.includes('/')) {
    return [host, id, siteKey].some((field) => field.includes(word));
  }
  const prefixes = [...hostLabels(host), ...hostLabels(siteKey), ...id.split('/')];
  return prefixes.some((part) => part.startsWith(word));
}

function wordScore(entry: FeedDirectoryEntry, word: string): number {
  const title = entry.title.toLowerCase();
  if (title === word) return SCORE_TITLE_EXACT;
  if (title.split(/[^\p{L}\p{N}]+/u).some((part) => part.startsWith(word))) return SCORE_TITLE_PREFIX;
  if (title.includes(word)) return SCORE_TITLE_SUBSTRING;
  if (siteMatches(entry, word)) return SCORE_SITE;
  if (entry.topics.some((topic) => topic.toLowerCase().includes(word))) return SCORE_TOPIC;
  if (entry.summary.toLowerCase().includes(word)) return SCORE_SUMMARY;
  return 0;
}

/** Sum of each word's best field score; `null` unless every word matches a field literally. */
export function searchScore(entry: FeedDirectoryEntry, words: string[]): number | null {
  let total = 0;
  for (const word of words) {
    const score = wordScore(entry, word);
    if (score === 0) return null;
    total += score;
  }
  if (words.length > 1 && entry.title.toLowerCase().trim().split(/\s+/).join(' ') === words.join(' ')) {
    total += SCORE_EXACT_QUERY;
  }
  return total;
}

export function extractFacets(entries: FeedDirectoryEntry[]): CatalogFacets {
  const topics = new Set<string>();
  const languages = new Set<string>();

  for (const entry of entries) {
    for (const topic of entry.topics) {
      topics.add(topic);
    }
    if (entry.language) {
      const base = baseLanguageCode(entry.language);
      if (base) languages.add(base);
    }
  }

  return {
    topics: [...topics].sort((a, b) => a.localeCompare(b)),
    languages: [...languages].sort((a, b) => a.localeCompare(b)),
  };
}

export function filterEntries(entries: FeedDirectoryEntry[], filters: FilterState): FeedDirectoryEntry[] {
  const words = queryWords(filters.query);

  return entries.filter((entry) => {
    if (searchScore(entry, words) === null) return false;

    if (filters.topics.length > 0 && !filters.topics.some((topic) => entry.topics.includes(topic))) {
      return false;
    }

    if (filters.language && !languageMatches(entry.language, filters.language)) return false;

    return true;
  });
}

export function sortEntries(entries: FeedDirectoryEntry[], sort: SortKey, query = ''): FeedDirectoryEntry[] {
  const words = sort === 'relevance' ? queryWords(query) : [];
  const scores = new Map(entries.map((entry) => [entry, searchScore(entry, words) ?? 0]));
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (words.length > 0) {
      const byScore = (scores.get(b) ?? 0) - (scores.get(a) ?? 0);
      if (byScore !== 0) return byScore;
    }
    const byResult = lastResultSortRank(a.lastResult.state) - lastResultSortRank(b.lastResult.state);
    if (byResult !== 0) return byResult;
    if (sort === 'site') {
      return a.siteKey.localeCompare(b.siteKey);
    }
    return a.title.localeCompare(b.title);
  });
  return sorted;
}

export function paginateEntries<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE
): { items: T[]; totalPages: number; total: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    total,
  };
}

export function hasActiveFilters(filters: FilterState): boolean {
  return (
    Boolean(filters.query.trim()) ||
    filters.topics.length > 0 ||
    Boolean(filters.language) ||
    filters.page > 1
  );
}
