import { describe, expect, it } from 'vitest';
import {
  CatalogDisabledError,
  CatalogInvalidEnvelopeError,
  CatalogUnsupportedVersionError,
  fetchCatalogResponse,
  mapCatalogError,
} from './catalog-api';

const validEnvelope = {
  success: true,
  data: {
    configs: [
      {
        id: 'anthropic.com/news',
        path: '/anthropic.com/news.rss',
        channel: { url: 'https://www.anthropic.com/news', language: 'en' },
        directory: { title: 'Anthropic — News', summary: 'Announcements.', topics: ['news'] },
        parameters: { schema: {}, defaults: {} },
      },
      {
        id: 'bbc.co.uk/available_episodes',
        path: '/bbc.co.uk/available_episodes.rss',
        channel: { url: 'https://www.bbc.co.uk/programmes/%<id>s/episodes/player', language: 'en-GB' },
        directory: { title: 'BBC Sounds — Programme episodes', summary: 'Episodes.', topics: ['media'] },
        parameters: { schema: { id: { type: 'string' } }, defaults: { id: 'b006wkfp' } },
      },
      { id: 'broken' },
    ],
  },
  meta: { total: 2, catalog_version: 1 },
};

function mockFetch(response: Partial<Response> & Pick<Response, 'status'>): typeof fetch {
  return (async () => response) as typeof fetch;
}

describe('fetchCatalogResponse', () => {
  it('maps valid envelope rows and drops invalid ones', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => validEnvelope,
    } as Response);

    const { entries, meta } = await fetchCatalogResponse('https://example.test/', fetchImpl);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      id: 'anthropic.com/news',
      siteKey: 'anthropic.com',
      title: 'Anthropic — News',
      topics: ['news'],
      language: 'en',
    });
    expect(entries[1]?.parameterDefaults).toEqual({ id: 'b006wkfp' });
    expect(meta).toEqual({ total: 2, catalogVersion: 1 });
  });

  it('throws disabled on 404', async () => {
    const fetchImpl = mockFetch({ ok: false, status: 404 } as Response);
    await expect(fetchCatalogResponse('https://example.test/', fetchImpl)).rejects.toBeInstanceOf(
      CatalogDisabledError
    );
  });

  it('throws invalid on malformed envelope', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => ({ success: false }),
    } as Response);
    await expect(fetchCatalogResponse('https://example.test/', fetchImpl)).rejects.toBeInstanceOf(
      CatalogInvalidEnvelopeError
    );
  });

  it('throws unsupported version when catalog_version is not supported', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => ({
        ...validEnvelope,
        meta: { total: 2, catalog_version: 99 },
      }),
    } as Response);
    await expect(fetchCatalogResponse('https://example.test/', fetchImpl)).rejects.toBeInstanceOf(
      CatalogUnsupportedVersionError
    );
  });
});

describe('mapCatalogError', () => {
  it('maps unsupported version errors', () => {
    expect(mapCatalogError(new CatalogUnsupportedVersionError()).kind).toBe('unsupported_version');
  });
});
