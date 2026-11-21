import { describe, expect, it } from 'vitest';
import { focusSelector } from './region-patch';

describe('focusSelector', () => {
  it('addresses a parameter input by entry and key', () => {
    expect(focusSelector({ entryId: 'a', paramKey: 'q' })).toBe('[data-entry-id="a"][data-param-key="q"]');
  });

  it('addresses a topic chip and escapes quotes', () => {
    expect(focusSelector({ action: 'toggle-topic', topic: 'a"b' })).toBe(
      '[data-action="toggle-topic"][data-topic="a\\"b"]'
    );
  });

  it('returns null for controls without a stable key', () => {
    expect(focusSelector({})).toBeNull();
  });
});
