import type { PagedSelection, DirectoryState } from './directory-state';
import type {
  CatalogFacets,
  CatalogLoadError,
  FeedDirectoryEntry,
  FilterState,
  LoadState,
} from '../domain/types';
import type { InstanceFeedback } from './directory-state';

export interface FeedDirectoryViewModel {
  loadState: LoadState;
  error: CatalogLoadError | null;
  instanceUrl: string;
  instanceEditorOpen: boolean;
  instanceDraft: string;
  instanceFeedback: InstanceFeedback | null;
  filters: FilterState;
  facets: CatalogFacets;
  catalogTotal: number;
  catalogEntryCount: number;
  filteredTotal: number;
  pageItems: FeedDirectoryEntry[];
  totalPages: number;
  expandedEntryId: string | null;
  parametersById: Record<string, Record<string, string>>;
  copiedEntryId: string | null;
}

export function buildViewModel(state: DirectoryState, paged: PagedSelection): FeedDirectoryViewModel {
  return {
    loadState: state.loadState,
    error: state.error,
    instanceUrl: state.instanceUrl,
    instanceEditorOpen: state.instanceEditorOpen,
    instanceDraft: state.instanceDraft,
    instanceFeedback: state.instanceFeedback,
    filters: paged.filters,
    facets: state.facets,
    catalogTotal: state.catalogTotal,
    catalogEntryCount: state.entries.length,
    filteredTotal: paged.filteredTotal,
    pageItems: paged.pageItems,
    totalPages: paged.totalPages,
    expandedEntryId: state.expandedEntryId,
    parametersById: state.parametersById,
    copiedEntryId: state.copiedEntryId,
  };
}
