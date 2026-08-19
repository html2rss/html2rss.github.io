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

/**
 * @param {string} instanceUrl
 * @returns {Promise<{ configs: Array<Record<string, unknown>>, meta: Record<string, unknown> }>}
 */
export async function fetchCatalog(instanceUrl) {
  const catalogUrl = new URL('/api/v1/configs', instanceUrl).toString();

  let response;
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

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new CatalogInvalidEnvelopeError();
  }

  if (!payload?.success || !Array.isArray(payload?.data?.configs)) {
    throw new CatalogInvalidEnvelopeError();
  }

  return {
    configs: payload.data.configs,
    meta: payload.meta ?? {},
  };
}
