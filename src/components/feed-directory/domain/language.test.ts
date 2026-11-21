import { describe, expect, it } from 'vitest';
import {
  baseLanguageCode,
  displayLanguage,
  languageAutonym,
  languageMatches,
  normalizeFilterLanguage,
} from './language';

describe('baseLanguageCode', () => {
  it('collapses BCP 47 tags to base language codes', () => {
    expect(baseLanguageCode('en-GB')).toBe('en');
    expect(baseLanguageCode('de_DE')).toBe('de');
    expect(baseLanguageCode('')).toBeNull();
  });
});

describe('languageMatches', () => {
  it('matches base language codes only', () => {
    expect(languageMatches('en-US', 'en')).toBe(true);
    expect(languageMatches('de-DE', 'en')).toBe(false);
    expect(languageMatches(undefined, 'en')).toBe(false);
  });
});

describe('normalizeFilterLanguage', () => {
  it('normalizes filter values to base codes', () => {
    expect(normalizeFilterLanguage('en-GB')).toBe('en');
    expect(normalizeFilterLanguage('')).toBe('');
  });
});

describe('displayLanguage', () => {
  it('shows base code or em dash placeholder', () => {
    expect(displayLanguage('fr-CA')).toBe('fr');
    expect(displayLanguage(undefined)).toBe('—');
  });
});

describe('languageAutonym', () => {
  it('names a language in itself', () => {
    expect(languageAutonym('de')).toBe('Deutsch');
    expect(languageAutonym('fr')).toBe('français');
  });

  it('falls back to the code when Intl cannot name it', () => {
    expect(languageAutonym('zz')).toBe('zz');
    expect(languageAutonym('x')).toBe('x');
    expect(languageAutonym('123')).toBe('123');
  });
});
