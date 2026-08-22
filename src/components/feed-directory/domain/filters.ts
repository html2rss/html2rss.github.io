import type { CatalogEntry, CatalogFacets, FilterState, SortKey } from './types';
import { parseSiteDomain } from './instance';
import { baseLanguageCode, languageMatches } from './language';

export const PAGE_SIZE = 25;

export const DEFAULT_FILTER_STATE: FilterState = {
  query: '',
  topics: [],
  language: '',
  sort: 'title',
  page: 1,
};

export function buildSearchableText(entry: CatalogEntry): string {
  const topics = (entry.directory?.topics ?? []).join(' ');
  const language = entry.channel?.language;
  const languageBase = baseLanguageCode(language);
  return [
    entry.id,
    entry.directory?.title,
    entry.directory?.summary,
    entry.channel?.url,
    language,
    languageBase,
    topics,
    parseSiteDomain(entry.id),
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

export function extractFacets(entries: CatalogEntry[]): CatalogFacets {
  const topics = new Set<string>();
  const languages = new Set<string>();

  for (const entry of entries) {
    for (const topic of entry.directory?.topics ?? []) {
      topics.add(topic);
    }
    if (entry.channel?.language) {
      const base = baseLanguageCode(entry.channel.language);
      if (base) languages.add(base);
    }
  }

  return {
    topics: [...topics].sort((a, b) => a.localeCompare(b)),
    languages: [...languages].sort((a, b) => a.localeCompare(b)),
  };
}

export function filterEntries(entries: CatalogEntry[], filters: FilterState): CatalogEntry[] {
  const query = filters.query.trim().toLowerCase();

  return entries.filter((entry) => {
    const searchable = buildSearchableText(entry).toLowerCase();
    if (query && !fuzzyMatch(searchable, query)) return false;

    const entryTopics = entry.directory?.topics ?? [];
    if (filters.topics.length > 0 && !filters.topics.some((topic) => entryTopics.includes(topic))) {
      return false;
    }

    if (filters.language && !languageMatches(entry.channel?.language, filters.language)) return false;

    return true;
  });
}

export function sortEntries(entries: CatalogEntry[], sort: SortKey): CatalogEntry[] {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    if (sort === 'site') {
      return parseSiteDomain(a.id).localeCompare(parseSiteDomain(b.id));
    }
    const titleA = a.directory?.title ?? a.id;
    const titleB = b.directory?.title ?? b.id;
    return titleA.localeCompare(titleB);
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
