export interface FeedDirectoryEntry {
  id: string;
  path: string;
  siteKey: string;
  title: string;
  summary: string;
  topics: readonly string[];
  channelUrl: string;
  language: string;
  parameterSchema: Readonly<Record<string, { type: string }>>;
  parameterDefaults: Readonly<Record<string, string>>;
}

export type SortKey = 'title' | 'site';

export interface FilterState {
  query: string;
  topics: string[];
  language: string;
  sort: SortKey;
  page: number;
}

export interface CatalogFacets {
  topics: string[];
  languages: string[];
}

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export type CatalogErrorKind = 'disabled' | 'network' | 'invalid' | 'unsupported_version' | 'unknown';

export interface CatalogLoadError {
  kind: CatalogErrorKind;
  message: string;
}
