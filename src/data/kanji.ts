// English edition: the "kanji" pillar now teaches the English alphabet.
// Each item is one letter (capital or small). Stroke data for tracing lives in data/letters/strokeData.json.
import lettersDb from './db/kanji.json';
import { KanjiItem } from '../types/content';
import { defineLookupAlias } from './entityIds';

const rawLetterList = lettersDb as unknown as KanjiItem[];

// Index by both id and character, like the previous kanji database.
const indexedDb: Record<string, KanjiItem> = {};
for (const k of rawLetterList) {
  if (k && k.id) {
    indexedDb[k.id] = k;
    // Alias pencarian per karakter (non-enumerable) agar Object.values() tidak menggandakan item.
    if (k.character) defineLookupAlias(indexedDb, k.character, k);
  }
}

export const KANJI_DATABASE: Record<string, KanjiItem> = indexedDb;

/** Kept for compatibility with the kanji module's stage-1 quiz hook; the English edition has no separate quiz. */
export const STAGE_1_KANJI_QUIZ: never[] = [];
