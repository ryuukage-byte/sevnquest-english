import { OFFICIAL_BOOKS } from '../data/officialBooks';
import { KANJI_DATABASE } from '../data/kanji';
import { KanjiItem } from '../types/content';
import { KOTOBA_DATABASE as kotobaDb } from '../data/kotoba';

const kotobaMap = kotobaDb as Record<string, any>;
const rawKotobaList = Object.values(kotobaMap);

// Quick character -> letter item lookup (English edition: each letter of a word maps to its letter item)
const kanjiByCharCache = new Map<string, KanjiItem>();
for (const item of Object.values(KANJI_DATABASE || {})) {
  if (item && item.character) {
    kanjiByCharCache.set(item.character, item);
  }
}

/**
 * Extract the letter items used by a specific book (letters listed directly, plus letters found in its words)
 */
export function getKanjiPoolForBook(bookId: string): KanjiItem[] {
  const book = OFFICIAL_BOOKS.find(b => b.id === bookId);
  if (!book) return [];

  const seenChars = new Set<string>();
  const pool: KanjiItem[] = [];

  for (const chapter of book.chapters) {
    for (const itemRef of chapter.items) {
      if (itemRef.category === 'kanji') {
        const direct = KANJI_DATABASE[itemRef.id] || kanjiByCharCache.get(itemRef.id);
        if (direct && direct.character && !seenChars.has(direct.character)) {
          seenChars.add(direct.character);
          pool.push(direct);
        }
      } else if (itemRef.category === 'kotoba') {
        const kt = kotobaMap[itemRef.id];
        if (kt && kt.word) {
          for (const char of kt.word) {
            const letter = kanjiByCharCache.get(char);
            if (letter && letter.character && !seenChars.has(letter.character)) {
              seenChars.add(letter.character);
              pool.push(letter);
            }
          }
        }
      }
    }
  }

  return pool;
}

/**
 * Extract all playable vocabulary items for a specific book
 */
export function getKotobaPoolForBook(bookId: string): any[] {
  const book = OFFICIAL_BOOKS.find(b => b.id === bookId);
  if (!book) return [];

  const targetIds = new Set<string>();
  for (const chapter of book.chapters) {
    for (const itemRef of chapter.items) {
      if (itemRef.category === 'kotoba') {
        targetIds.add(itemRef.id);
      }
    }
  }

  const pool: any[] = [];
  const seenWords = new Set<string>();

  for (const item of rawKotobaList) {
    if (item && item.id && targetIds.has(item.id)) {
      if (item.word && !seenWords.has(item.word)) {
        seenWords.add(item.word);
        pool.push(item);
      }
    }
  }

  return pool;
}

export function getBookStatsMap(): Record<string, { kanjiCount: number; kotobaCount: number }> {
  const stats: Record<string, { kanjiCount: number; kotobaCount: number }> = {};
  for (const book of OFFICIAL_BOOKS) {
    stats[book.id] = {
      kanjiCount: getKanjiPoolForBook(book.id).length,
      kotobaCount: getKotobaPoolForBook(book.id).length,
    };
  }
  return stats;
}
