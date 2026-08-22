import type { CatalogEntry, CatalogLoadError } from './types';

export class CatalogDisabledError extends Error {
  constructor(message = 'Catalog is disabled on this instance.') {
    super(message);
    this.name = 'CatalogDisabledError';
  }
}

export class CatalogNetworkError extends Error {
  constructor(message = 'Could not reach the instance catalog.') {
    super(message);
    this.name = 'CatalogNetworkError';
  }
}

export class CatalogInvalidEnvelopeError extends Error {
  constructor(message = 'The instance returned an invalid catalog response.') {
    super(message);
    this.name = 'CatalogInvalidEnvelopeError';
  }
}

export interface CatalogResponse {
  configs: CatalogEntry[];
  meta: { total?: number; catalog_version?: number };
}

export async function fetchCatalog(instanceUrl: string): Promise<CatalogResponse> {
  const catalogUrl = new URL('/api/v1/configs', instanceUrl).toString();

  let response: Response;
  try {
    response = await fetch(catalogUrl, { headers: { Accept: 'application/json' } });
  } catch {
    throw new CatalogNetworkError();
  }

  if (response.status === 404) {
    throw new CatalogDisabledError();
  }

  if (!response.ok) {
    throw new CatalogNetworkError(`Catalog request failed with status ${response.status}.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CatalogInvalidEnvelopeError();
  }

  const data = payload as {
    success?: boolean;
    data?: { configs?: CatalogEntry[] };
    meta?: CatalogResponse['meta'];
  };

  if (!data?.success || !Array.isArray(data?.data?.configs)) {
    throw new CatalogInvalidEnvelopeError();
  }

  return {
    configs: data.data.configs,
    meta: data.meta ?? {},
  };
}

export function mapCatalogError(error: unknown): CatalogLoadError {
  if (error instanceof CatalogDisabledError) {
    return { kind: 'disabled', message: 'This instance has the feed catalog disabled.' };
  }
  if (error instanceof CatalogInvalidEnvelopeError) {
    return { kind: 'invalid', message: 'The instance returned an unexpected catalog response.' };
  }
  if (error instanceof CatalogNetworkError) {
    return { kind: 'network', message: 'Could not load the feed catalog from this instance.' };
  }
  return { kind: 'unknown', message: 'Could not load the feed catalog.' };
}
