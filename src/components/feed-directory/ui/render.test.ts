import { describe, expect, it } from 'vitest';
import { renderLastResultIndicator } from './render';

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
