import { describe, expect, it } from 'vitest';
import { isFailingLastResult, isLastResultState, lastResultSortRank } from './last-result';

describe('lastResultSortRank', () => {
  it('orders ok, unknown, empty, error', () => {
    expect(lastResultSortRank('ok')).toBeLessThan(lastResultSortRank('unknown'));
    expect(lastResultSortRank('unknown')).toBeLessThan(lastResultSortRank('empty'));
    expect(lastResultSortRank('empty')).toBeLessThan(lastResultSortRank('error'));
  });
});

describe('isFailingLastResult', () => {
  it('treats empty and error as failing', () => {
    expect(isFailingLastResult({ state: 'empty', code: null, at: null })).toBe(true);
    expect(isFailingLastResult({ state: 'error', code: 'X', at: null })).toBe(true);
    expect(isFailingLastResult({ state: 'ok', code: null, at: null })).toBe(false);
    expect(isFailingLastResult({ state: 'unknown', code: null, at: null })).toBe(false);
  });
});

describe('isLastResultState', () => {
  it('accepts only the closed set', () => {
    expect(isLastResultState('ok')).toBe(true);
    expect(isLastResultState('green')).toBe(false);
    expect(isLastResultState(null)).toBe(false);
  });
});
