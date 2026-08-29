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
        last_result: { state: 'ok', code: null, at: '2026-08-29T08:00:00Z' },
      },
      {
        id: 'bbc.co.uk/available_episodes',
        path: '/bbc.co.uk/available_episodes.rss',
        channel: { url: 'https://www.bbc.co.uk/programmes/%<id>s/episodes/player', language: 'en-GB' },
        directory: { title: 'BBC Sounds — Programme episodes', summary: 'Episodes.', topics: ['media'] },
        parameters: { schema: { id: { type: 'string' } }, defaults: { id: 'b006wkfp' } },
        last_result: { state: 'unknown', code: null, at: null },
      },
      {
        id: 'example.com/broken-scrape',
        path: '/example.com/broken-scrape.rss',
        channel: { url: 'https://example.com/broken', language: 'en' },
        directory: { title: 'Broken', summary: '', topics: [] },
        parameters: { schema: {}, defaults: {} },
        last_result: { state: 'error', code: 'EXTRACTION_EMPTY', at: '2026-08-29T09:00:00Z' },
      },
      { id: 'broken' },
      {
        id: 'missing.last/result',
        path: '/missing.last/result.rss',
        channel: { url: 'https://missing.example/', language: 'en' },
        directory: { title: 'Missing last_result', summary: '', topics: [] },
        parameters: { schema: {}, defaults: {} },
      },
      {
        id: 'invalid.last/result',
        path: '/invalid.last/result.rss',
        channel: { url: 'https://invalid.example/', language: 'en' },
        directory: { title: 'Invalid last_result', summary: '', topics: [] },
        parameters: { schema: {}, defaults: {} },
        last_result: { state: 'green', code: null, at: null },
      },
    ],
  },
  meta: {
    total: 3,
    catalog_version: 2,
    starters: ['anthropic.com/news', 'bbc.co.uk/available_episodes'],
  },
};

function mockFetch(response: Partial<Response> & Pick<Response, 'status'>): typeof fetch {
  return (async () => response) as typeof fetch;
}

describe('fetchCatalogResponse', () => {
  it('maps valid v2 envelope rows and drops invalid ones', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => validEnvelope,
    } as Response);

    const { entries, meta } = await fetchCatalogResponse('https://example.test/', fetchImpl);

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      id: 'anthropic.com/news',
      siteKey: 'anthropic.com',
      title: 'Anthropic — News',
      topics: ['news'],
      language: 'en',
      lastResult: { state: 'ok', code: null, at: '2026-08-29T08:00:00Z' },
    });
    expect(entries[1]?.parameterDefaults).toEqual({ id: 'b006wkfp' });
    expect(entries[1]?.lastResult).toEqual({ state: 'unknown', code: null, at: null });
    expect(entries[2]?.lastResult).toEqual({
      state: 'error',
      code: 'EXTRACTION_EMPTY',
      at: '2026-08-29T09:00:00Z',
    });
    expect(meta).toEqual({
      total: 3,
      catalogVersion: 2,
      starters: ['anthropic.com/news', 'bbc.co.uk/available_episodes'],
    });
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

  it('throws unsupported version for catalog_version 1 (fail closed)', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => ({
        ...validEnvelope,
        meta: { total: 3, catalog_version: 1, starters: [] },
      }),
    } as Response);
    await expect(fetchCatalogResponse('https://example.test/', fetchImpl)).rejects.toBeInstanceOf(
      CatalogUnsupportedVersionError
    );
  });

  it('throws unsupported version when catalog_version is not supported', async () => {
    const fetchImpl = mockFetch({
      ok: true,
      status: 200,
      json: async () => ({
        ...validEnvelope,
        meta: { total: 3, catalog_version: 99, starters: [] },
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
