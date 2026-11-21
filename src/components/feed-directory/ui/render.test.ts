import { describe, expect, it } from 'vitest';
import type { FeedDirectoryViewModel } from '../app/view-model';
import {
  renderFilters,
  renderHeader,
  renderInstancePanel,
  renderLastResultIndicator,
  renderResults,
  renderShell,
} from './render';

describe('renderLastResultIndicator', () => {
  it('renders no badge for unknown (cold)', () => {
    expect(renderLastResultIndicator({ state: 'unknown', code: null, at: null })).toBe('');
  });

  it('renders ambient badges for ok, empty, and error', () => {
    expect(renderLastResultIndicator({ state: 'ok', code: null, at: null })).toContain('fd-result-ok');
    expect(renderLastResultIndicator({ state: 'empty', code: null, at: null })).toContain('fd-result-empty');
    expect(renderLastResultIndicator({ state: 'error', code: 'X', at: null })).toContain('fd-result-error');
  });
});

describe('mounted shell', () => {
  const vm = {
    loadState: 'ready',
    error: null,
    instanceUrl: 'https://example.test',
    instanceEditorOpen: true,
    instanceDraft: 'https://example.test',
    instanceFeedback: null,
    filters: { query: 'abc', topics: [], language: '', sort: 'title', page: 1 },
    facets: { topics: ['news'], languages: ['en'] },
    facetCounts: { topics: new Map([['news', 1]]), languages: new Map([['en', 1]]) },
    catalogTotal: 0,
    catalogEntryCount: 0,
    filteredTotal: 0,
    pageItems: [],
    totalPages: 1,
    expandedEntryId: null,
    openMoreEntryId: null,
    parametersById: {},
    copiedEntryId: null,
  } satisfies FeedDirectoryViewModel;

  it('owns the search input in the shell only', () => {
    expect(renderShell('abc').match(/data-ref="search"/g)).toHaveLength(1);
    for (const html of [renderHeader(vm), renderInstancePanel(vm), renderFilters(vm), renderResults(vm)]) {
      expect(html).not.toContain('data-ref="search"');
    }
  });

  it('provides a host for every region', () => {
    const shell = renderShell('');
    for (const region of ['header', 'instance', 'filters', 'results']) {
      expect(shell).toContain(`data-region="${region}"`);
    }
  });
});

describe('scannable results', () => {
  const entry = (id: string, patch: Partial<FeedDirectoryViewModel['pageItems'][number]> = {}) => ({
    id,
    path: `/${id}.rss`,
    siteKey: 'a.example',
    title: id,
    summary: 'A long summary',
    topics: ['one', 'two', 'three', 'four'],
    channelUrl: 'https://a.example',
    language: 'de',
    parameterSchema: {},
    parameterDefaults: {},
    lastResult: { state: 'unknown' as const, code: null, at: null },
    ...patch,
  });
  const base: FeedDirectoryViewModel = {
    loadState: 'ready',
    error: null,
    instanceUrl: 'https://example.test',
    instanceEditorOpen: false,
    instanceDraft: '',
    instanceFeedback: null,
    filters: { query: '', topics: ['gone'], language: 'fr', sort: 'title', page: 3 },
    facets: { topics: ['one', 'gone', 'zero'], languages: ['de', 'fr', 'xx'] },
    facetCounts: { topics: new Map([['one', 4]]), languages: new Map([['de', 29]]) },
    catalogTotal: 400,
    catalogEntryCount: 400,
    filteredTotal: 400,
    pageItems: [entry('a.example/one'), entry('a.example/two', { channelUrl: '', topics: ['one'] })],
    totalPages: 8,
    expandedEntryId: null,
    openMoreEntryId: null,
    parametersById: {},
    copiedEntryId: null,
  };

  it('shows live topic counts and disables zero-count chips unless selected', () => {
    const html = renderFilters(base);
    expect(html).toMatch(/data-topic="one"[^>]*>one <span class="fd-chip-count">4<\/span>/);
    expect(html).toMatch(/data-topic="zero"[^>]*disabled/);
    expect(html).not.toMatch(/data-topic="gone"[^>]*disabled/);
  });

  it('labels languages by autonym with counts and keeps code values', () => {
    const html = renderFilters(base);
    expect(html).toContain('<option value="de">Deutsch (29)</option>');
    expect(html).toMatch(/<option value="fr" selected>[^<]*\(0\)<\/option>/);
    expect(html).toMatch(/<option value="xx" disabled>[^<]*\(0\)<\/option>/);
  });

  it('keeps a selected language and topic that the catalog lacks visible, enabled and clearable', () => {
    const html = renderFilters({
      ...base,
      filters: { ...base.filters, topics: ['absent'], language: 'qq' },
    });
    expect(html).toMatch(
      /<button[^>]*class="fd-chip is-active"[^>]*data-topic="absent" aria-pressed="true">absent <span class="fd-chip-count">0<\/span>/
    );
    expect(html).not.toMatch(/data-topic="absent"[^>]*disabled/);
    expect(html).toMatch(/<option value="qq" selected>qq \(0\)<\/option>/);
  });

  it('orders language options by autonym', () => {
    const html = renderFilters({
      ...base,
      filters: { ...base.filters, language: '' },
      facets: { ...base.facets, languages: ['ja', 'pt', 'de'] },
    });
    const codes = [...html.matchAll(/<option value="([a-z]+)"/g)]
      .map((match) => match[1])
      .filter((code) => !['relevance', 'title', 'site'].includes(code ?? ''));
    expect(codes).toEqual(['de', 'pt', 'ja']);
  });

  it('renders numbered pages with one aria-current and ellipses', () => {
    const html = renderResults(base);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/data-page="3"[^>]*aria-current="page"/);
    expect(html).toContain('fd-page-gap');
    expect(html).toContain('data-action="page-next"');
  });

  it('keeps rows dense: two topics plus +N, full summary in title, More only with extras', () => {
    const html = renderResults(base);
    expect(html).toContain('title="A long summary"');
    expect(html).toContain('>+2</span>');
    expect(html.match(/<details class="fd-more"/g)).toHaveLength(1);
    expect(html.match(/>Copy</g)).toHaveLength(2);
  });

  it('opens the More menu from state', () => {
    expect(renderResults({ ...base, openMoreEntryId: 'a.example/one' })).toMatch(
      /<details class="fd-more" data-entry-id="a.example\/one" open>/
    );
  });
});
