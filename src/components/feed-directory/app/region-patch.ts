const FOCUS_KEYS = ['ref', 'action', 'topic', 'entryId', 'paramKey'] as const;

/** CSS selector that finds the re-rendered equivalent of a focused control. */
export function focusSelector(dataset: Record<string, string | undefined>): string | null {
  const parts = FOCUS_KEYS.filter((key) => dataset[key] !== undefined).map((key) => {
    const attr = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    return `[data-${attr}="${String(dataset[key]).replace(/["\\]/g, '\\$&')}"]`;
  });
  return parts.length > 0 ? parts.join('') : null;
}

/**
 * Replaces a region's markup only when it changed, and puts focus (and caret)
 * back on the equivalent control if focus was inside the region.
 */
export function patchRegion(host: HTMLElement, html: string, last: string | undefined): void {
  if (html === last) return;

  const active = document.activeElement;
  const selector =
    active instanceof HTMLElement && host.contains(active) ? focusSelector(active.dataset) : null;
  const selection =
    active instanceof HTMLInputElement ? { start: active.selectionStart, end: active.selectionEnd } : null;

  host.innerHTML = html;

  if (!selector) return;
  const next = host.querySelector<HTMLElement>(selector);
  if (!next) return;
  next.focus();
  if (selection && next instanceof HTMLInputElement && selection.start !== null && selection.end !== null) {
    try {
      next.setSelectionRange(selection.start, selection.end);
    } catch {
      // input types without selection support
    }
  }
}
