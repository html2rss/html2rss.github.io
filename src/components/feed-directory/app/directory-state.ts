import {
  DEFAULT_FILTER_STATE,
  extractFacets,
  facetCounts,
  filterEntries,
  paginateEntries,
  sortEntries,
} from '../domain/filters';
import type {
  CatalogFacets,
  CatalogLoadError,
  FacetCounts,
  FeedDirectoryEntry,
  FilterState,
  LoadState,
} from '../domain/types';

export interface InstanceFeedback {
  message: string;
  tone: 'idle' | 'error' | 'success';
}

export interface DirectoryState {
  loadState: LoadState;
  entries: FeedDirectoryEntry[];
  facets: CatalogFacets;
  catalogTotal: number;
  filters: FilterState;
  instanceUrl: string;
  instanceDraft: string;
  instanceEditorOpen: boolean;
  instanceFeedback: InstanceFeedback | null;
  expandedEntryId: string | null;
  openMoreEntryId: string | null;
  parametersById: Record<string, Record<string, string>>;
  copiedEntryId: string | null;
  error: CatalogLoadError | null;
}

export interface PagedSelection {
  filteredEntries: FeedDirectoryEntry[];
  pageItems: FeedDirectoryEntry[];
  filteredTotal: number;
  totalPages: number;
  facetCounts: FacetCounts;
  filters: FilterState;
}

export function initialState(filters: FilterState, instanceUrl: string): DirectoryState {
  return {
    loadState: 'idle',
    entries: [],
    facets: { topics: [], languages: [] },
    catalogTotal: 0,
    filters,
    instanceUrl,
    instanceDraft: instanceUrl,
    instanceEditorOpen: false,
    instanceFeedback: null,
    expandedEntryId: null,
    openMoreEntryId: null,
    parametersById: {},
    copiedEntryId: null,
    error: null,
  };
}

export function applyFilterPatch(state: DirectoryState, patch: Partial<FilterState>): DirectoryState {
  return {
    ...state,
    openMoreEntryId: null,
    filters: { ...state.filters, ...patch },
  };
}

export function selectPagedEntries(state: DirectoryState): PagedSelection {
  const filteredEntries = sortEntries(
    filterEntries(state.entries, state.filters),
    state.filters.sort,
    state.filters.query
  );
  const { items, totalPages, total } = paginateEntries(filteredEntries, state.filters.page);
  // Until the catalog is ready there are no entries, so the page count says nothing about the URL's page.
  const page =
    state.loadState === 'ready' ? Math.min(Math.max(state.filters.page, 1), totalPages) : state.filters.page;

  return {
    filteredEntries,
    pageItems: items,
    filteredTotal: total,
    totalPages,
    facetCounts: facetCounts(state.entries, state.filters),
    filters: { ...state.filters, page },
  };
}

export function resetCatalogState(state: DirectoryState): DirectoryState {
  return {
    ...state,
    expandedEntryId: null,
    openMoreEntryId: null,
    parametersById: {},
  };
}

export function catalogReadyState(
  state: DirectoryState,
  entries: FeedDirectoryEntry[],
  catalogTotal: number
): DirectoryState {
  return {
    ...resetCatalogState(state),
    loadState: 'ready',
    entries,
    catalogTotal,
    facets: extractFacets(entries),
    error: null,
  };
}

export function catalogErrorState(state: DirectoryState, error: CatalogLoadError): DirectoryState {
  return {
    ...state,
    loadState: 'error',
    error,
    entries: [],
    facets: { topics: [], languages: [] },
    catalogTotal: 0,
  };
}

export function resetFilters(state: DirectoryState, filters: FilterState): DirectoryState {
  return {
    ...state,
    openMoreEntryId: null,
    filters: { ...DEFAULT_FILTER_STATE, ...filters },
  };
}
