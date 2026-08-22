import type { CatalogFacets, FeedDirectoryEntry, FilterState, SortKey } from './types';
import { baseLanguageCode, languageMatches } from './language';

export const PAGE_SIZE = 25;

export const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  topics: [],
  language: '',
  sort: 'title',
  page: 1,
};

export function buildSearchableText(entry: FeedDirectoryEntry): string {
  const topics = entry.topics.join(' ');
  const languageBase = baseLanguageCode(entry.language);
  return [
    entry.id,
    entry.title,
    entry.summary,
    entry.channelUrl,
    entry.language,
    languageBase,
    topics,
    entry.siteKey,
  ]
    .filter(Boolean)
    .join(' ');
}

export function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let textIndex = 0;
  let queryIndex = 0;
  while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
    if (lowerQuery[queryIndex] === lowerText[textIndex]) queryIndex += 1;
    textIndex += 1;
  }
  return queryIndex === lowerQuery.length;
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
  const query = filters.query.trim().toLowerCase();

  return entries.filter((entry) => {
    const searchable = buildSearchableText(entry).toLowerCase();
    if (query && !fuzzyMatch(searchable, query)) return false;

    if (filters.topics.length > 0 && !filters.topics.some((topic) => entry.topics.includes(topic))) {
      return false;
    }

    if (filters.language && !languageMatches(entry.language, filters.language)) return false;

    return true;
  });
}

export function sortEntries(entries: FeedDirectoryEntry[], sort: SortKey): FeedDirectoryEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
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
