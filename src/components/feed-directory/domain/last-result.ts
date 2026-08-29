import type { LastResult, LastResultState } from './types';

const LAST_RESULT_STATES = new Set<LastResultState>(['ok', 'empty', 'error', 'unknown']);

/** Lower rank sorts first. Demotes empty/error below ok/unknown. */
export function lastResultSortRank(state: LastResultState): number {
  switch (state) {
    case 'ok':
      return 0;
    case 'unknown':
      return 1;
    case 'empty':
      return 2;
    case 'error':
      return 3;
  }
}

export function isFailingLastResult(lastResult: LastResult): boolean {
  return lastResult.state === 'empty' || lastResult.state === 'error';
}

export function isLastResultState(value: unknown): value is LastResultState {
  return typeof value === 'string' && LAST_RESULT_STATES.has(value as LastResultState);
}
