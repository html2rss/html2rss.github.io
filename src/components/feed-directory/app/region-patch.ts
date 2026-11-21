const FOCUS_KEYS = ['ref', 'action', 'topic', 'page', 'entryId', 'paramKey'] as const;
const CONTROLS = 'button, input, select, textarea, a[href], summary';

type Dataset = Record<string, string | undefined>;

/**
 * Index of the candidate that carries the same focus identity as `target`, or -1.
 * Compares dataset values directly: catalog values never reach a CSS selector.
 */
export function findEquivalent(target: Dataset, candidates: Dataset[]): number {
  if (FOCUS_KEYS.every((key) => target[key] === undefined)) return -1;
  return candidates.findIndex((candidate) => FOCUS_KEYS.every((key) => candidate[key] === target[key]));
}

/** Nearest surviving slot for a control that is gone: same position, clamped to the end. */
export function clampIndex(oldIndex: number, count: number): number {
  if (count <= 0) return -1;
  return Math.min(Math.max(oldIndex, 0), count - 1);
}

function enabledControls(host: HTMLElement): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>(CONTROLS)].filter(
    (el) => !el.matches(':disabled') && (el.matches('summary') || !el.closest('details:not([open])'))
  );
}

/**
 * Replaces a region's markup only when it changed. If focus was inside the region it is
 * restored to the equivalent control (with caret), else to the nearest surviving control,
 * else to `fallback`, else to the region host itself.
 */
export function patchRegion(
  host: HTMLElement,
  html: string,
  last: string | undefined,
  fallback?: () => HTMLElement | null
): void {
  if (html === last) return;

  const active = document.activeElement;
  const hadFocus = active instanceof HTMLElement && host.contains(active);
  const oldIndex = hadFocus ? enabledControls(host).indexOf(active) : -1;
  const target: Dataset = hadFocus ? { ...active.dataset } : {};
  const selection =
    active instanceof HTMLInputElement ? { start: active.selectionStart, end: active.selectionEnd } : null;

  host.innerHTML = html;
  if (!hadFocus) return;

  const controls = enabledControls(host);
  const match = findEquivalent(
    target,
    controls.map((el) => ({ ...el.dataset }))
  );
  const next =
    match >= 0 ? controls[match] : (controls[clampIndex(oldIndex, controls.length)] ?? fallback?.() ?? null);

  if (!next) {
    host.tabIndex = -1;
    host.focus({ preventScroll: true });
    return;
  }

  next.focus({ preventScroll: true });
  if (
    match >= 0 &&
    selection &&
    next instanceof HTMLInputElement &&
    selection.start !== null &&
    selection.end !== null
  ) {
    try {
      next.setSelectionRange(selection.start, selection.end);
    } catch {
      // input types without selection support
    }
  }
}
