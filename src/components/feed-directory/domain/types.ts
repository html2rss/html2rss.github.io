export interface CatalogEntry {
  id: string;
  path: string;
  source: string;
  directory: {
    title: string;
    summary: string;
    topics: string[];
  };
  channel: {
    url: string;
    language: string;
    title: string;
  };
  parameters: {
    schema: Record<string, { type: string }>;
    defaults: Record<string, string | null>;
  };
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

export type CatalogErrorKind = 'disabled' | 'network' | 'invalid' | 'unknown';

export interface CatalogLoadError {
  kind: CatalogErrorKind;
  message: string;
}
