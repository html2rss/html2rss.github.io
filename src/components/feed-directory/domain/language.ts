/**
 * Collapse BCP 47 tags (e.g. de-DE, en-GB) to a base language code for filtering.
 */
export function baseLanguageCode(language: string | null | undefined): string | null {
  if (!language) return null;

  const trimmed = language.trim();
  if (!trimmed) return null;

  const base = trimmed.split(/[-_]/)[0]?.toLowerCase();
  return base || null;
}

export function languageMatches(entryLanguage: string | undefined, filterLanguage: string): boolean {
  if (!filterLanguage) return true;

  const entryBase = baseLanguageCode(entryLanguage);
  const filterBase = baseLanguageCode(filterLanguage);

  return entryBase !== null && filterBase !== null && entryBase === filterBase;
}

export function normalizeFilterLanguage(filterLanguage: string): string {
  return baseLanguageCode(filterLanguage) ?? '';
}

export function displayLanguage(language: string | null | undefined): string {
  return baseLanguageCode(language) ?? '—';
}

const autonyms = new Map<string, Intl.DisplayNames | null>();

function autonymNames(code: string): Intl.DisplayNames | null {
  if (!autonyms.has(code)) {
    try {
      autonyms.set(code, new Intl.DisplayNames([code], { type: 'language', fallback: 'code' }));
    } catch {
      autonyms.set(code, null);
    }
  }
  return autonyms.get(code) ?? null;
}

/** The language's name in that language (`de` → `Deutsch`); the code itself when Intl cannot name it. */
export function languageAutonym(code: string): string {
  try {
    return autonymNames(code)?.of(code) || code;
  } catch {
    return code;
  }
}

export interface LanguageOption {
  code: string;
  label: string;
}

/** Catalog languages plus the selected one if the catalog lacks it, sorted by autonym. */
export function languageOptions(codes: readonly string[], selected: string): LanguageOption[] {
  const all = selected && !codes.includes(selected) ? [...codes, selected] : [...codes];
  return all
    .map((code) => ({ code, label: languageAutonym(code) }))
    .sort((a, b) => a.label.localeCompare(b.label) || a.code.localeCompare(b.code));
}
