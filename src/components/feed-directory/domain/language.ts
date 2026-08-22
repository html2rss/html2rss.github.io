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
