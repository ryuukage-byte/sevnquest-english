/**
 * English edition: there are no kanji or furigana. These helpers keep the same names so ruby/reading
 * components render plain text unchanged.
 */
export interface RubySegment {
  text: string;
  ruby?: string;
  isKanji: boolean;
}

export function isKanji(_char: string): boolean {
  return false;
}

export function normalizeJapanesePunctuation(str: string): string {
  return str;
}

export function getFuriganaSegments(
  text: string,
  _reading?: string,
  _excludeKanji?: Set<string>
): RubySegment[] {
  return text ? [{ text, isKanji: false }] : [];
}
