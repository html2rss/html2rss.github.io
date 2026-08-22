import type { FilterState, SortKey } from './types';
import { DEFAULT_FILTER_STATE } from './filters';
import { normalizeFilterLanguage } from './language';

const SORT_KEYS: SortKey[] = ['title', 'site'];

function parseSort(value: string | null): SortKey {
  return SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : DEFAULT_FILTER_STATE.sort;
}

export function readFiltersFromUrl(): FilterState {
  const params = new URLSearchParams(window.location.search);
  const page = Number.parseInt(params.get('page') ?? '1', 10);

  return {
    query: params.get('q') ?? '',
    topics: params.getAll('topic').filter(Boolean),
    language: normalizeFilterLanguage(params.get('lang') ?? ''),
    sort: parseSort(params.get('sort')),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function writeFiltersToUrl(filters: FilterState): void {
  const params = new URLSearchParams();

  const query = filters.query.trim();
  if (query) params.set('q', query);

  for (const topic of filters.topics) {
    params.append('topic', topic);
  }

  if (filters.language) params.set('lang', normalizeFilterLanguage(filters.language));
  if (filters.sort !== DEFAULT_FILTER_STATE.sort) params.set('sort', filters.sort);
  if (filters.page > 1) params.set('page', String(filters.page));

  const next = params.toString();
  const url = next ? `${window.location.pathname}?${next}` : window.location.pathname;

  window.history.replaceState({}, '', url);
}

export function clearFilters(current: FilterState): FilterState {
  return {
    ...DEFAULT_FILTER_STATE,
    sort: current.sort,
  };
}
