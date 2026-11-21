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
    catalogTotal: 0,
    catalogEntryCount: 0,
    filteredTotal: 0,
    pageItems: [],
    totalPages: 1,
    expandedEntryId: null,
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
