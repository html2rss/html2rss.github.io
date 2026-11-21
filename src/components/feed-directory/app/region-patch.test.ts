import { describe, expect, it } from 'vitest';
import { clampIndex, findEquivalent } from './region-patch';

describe('findEquivalent', () => {
  it('matches a parameter input by entry and key', () => {
    const candidates = [
      { entryId: 'a', paramKey: 'x' },
      { entryId: 'a', paramKey: 'q' },
    ];
    expect(findEquivalent({ entryId: 'a', paramKey: 'q' }, candidates)).toBe(1);
  });

  it('matches values with newlines, quotes and backslashes without a selector', () => {
    const topic = 'a"b\nc\\d]';
    const candidates = [
      { action: 'toggle-topic', topic: 'other' },
      { action: 'toggle-topic', topic },
    ];
    expect(findEquivalent({ action: 'toggle-topic', topic }, candidates)).toBe(1);
  });

  it('matches a page control by its page number', () => {
    const candidates = [
      { action: 'page-prev' },
      { action: 'page-goto', page: '2' },
      { action: 'page-goto', page: '3' },
    ];
    expect(findEquivalent({ action: 'page-goto', page: '3' }, candidates)).toBe(2);
    expect(findEquivalent({ action: 'page-goto', page: '9' }, candidates)).toBe(-1);
  });

  it('does not match a different key set or an empty identity', () => {
    expect(findEquivalent({ action: 'toggle-topic', topic: 'a' }, [{ topic: 'a' }])).toBe(-1);
    expect(findEquivalent({}, [{}])).toBe(-1);
  });
});

describe('clampIndex', () => {
  it('keeps the position, clamps to the last control, and reports none', () => {
    expect(clampIndex(1, 3)).toBe(1);
    expect(clampIndex(5, 3)).toBe(2);
    expect(clampIndex(-1, 3)).toBe(0);
    expect(clampIndex(2, 0)).toBe(-1);
  });
});
