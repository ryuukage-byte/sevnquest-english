import { OfficialBook, OfficialChapter } from '../types/books';
import { DeckItemRef } from '../types/rpg';
import kanjiDb from './db/kanji.json';
import kotobaDb from './db/kotoba.json';
import bunpouDb from './db/bunpou.json';
import dokkaiDb from './db/dokkai.json';
import choukaiDb from './db/choukai.json';

// English curriculum books, one per CEFR level, built from the English datasets.
const now = new Date().toISOString();

function toRefs(ids: string[], category: 'kanji' | 'kotoba' | 'bunpou' | 'dokkai' | 'choukai'): DeckItemRef[] {
  return ids.map(id => ({ id, category: category as DeckItemRef['category'], addedAt: now }));
}

const letters = (kanjiDb as unknown as Array<{ id: string; character: string }>).map(k => k.id);
const vocab = Object.values(kotobaDb as unknown as Record<string, { id: string; jlpt: string }>);
const grammar = bunpouDb as unknown as Array<{ id: string; level: string }>;
const dokkai = Object.values(dokkaiDb as unknown as Record<string, { id: string; level: string }>);
const listening = Object.values(choukaiDb as unknown as Record<string, { id: string; level: string }>);

const CHUNK = 20;
function chapters(bookId: string, levelLabel: string, level: string): OfficialChapter[] {
  const words = vocab.filter(v => v.jlpt === level).map(v => v.id);
  const chapterList: OfficialChapter[] = [];
  for (let i = 0; i * CHUNK < words.length; i++) {
    chapterList.push({
      id: `ch_${level.toLowerCase()}_vocab_${i + 1}`,
      bookId,
      chapterNumber: i + 1,
      titleJp: `${levelLabel} Vocabulary ${i + 1}`,
      titleId: `${levelLabel} Vocabulary ${i + 1}`,
      subtitle: `${Math.min(CHUNK, words.length - i * CHUNK)} words`,
      description: `Core ${level} words to learn, recognise and spell.`,
      coverIcon: '📖',
      items: toRefs(words.slice(i * CHUNK, (i + 1) * CHUNK), 'kotoba'),
    });
  }
  const n = chapterList.length;
  const grammarIds = grammar.filter(g => g.level === level).map(g => g.id);
  chapterList.push({
    id: `ch_${level.toLowerCase()}_grammar`,
    bookId,
    chapterNumber: n + 1,
    titleJp: `${levelLabel} Grammar`,
    titleId: `${levelLabel} Grammar`,
    subtitle: `${grammarIds.length} grammar points`,
    description: `Grammar patterns at ${level} level, with example sentences and quizzes.`,
    coverIcon: '✒️',
    items: toRefs(grammarIds, 'bunpou'),
  });
  const readingIds = dokkai.filter(d => d.level === level).map(d => d.id);
  const listeningIds = listening.filter(c => c.level === level).map(c => c.id);
  if (readingIds.length || listeningIds.length) {
    chapterList.push({
      id: `ch_${level.toLowerCase()}_reading`,
      bookId,
      chapterNumber: n + 2,
      titleJp: `${levelLabel} Reading & Listening`,
      titleId: `${levelLabel} Reading & Listening`,
      subtitle: `${readingIds.length} passages, ${listeningIds.length} dialogues`,
      description: `Reading passages and listening dialogues at ${level} level.`,
      coverIcon: '🎧',
      items: [...toRefs(readingIds, 'dokkai'), ...toRefs(listeningIds, 'choukai')],
    });
  }
  return chapterList;
}

const LEVEL_BOOKS: Array<{ level: 'A1' | 'A2' | 'B1' | 'B2'; accent: string; cover: string }> = [
  { level: 'A1', accent: 'text-emerald-500', cover: '🌱' },
  { level: 'A2', accent: 'text-sky-500', cover: '🧭' },
  { level: 'B1', accent: 'text-amber-500', cover: '⚔️' },
  { level: 'B2', accent: 'text-rose-500', cover: '👑' },
];

const letterBook: OfficialBook = {
  id: 'book_alphabet',
  title: 'Alphabet Academy',
  japaneseTitle: 'Alphabet Academy',
  subtitle: 'Capital & small letters with stroke-order writing',
  description: 'Learn to recognise and write all 52 letters, one stroke at a time.',
  level: 'ALPHABET',
  category: 'curriculum',
  coverIcon: '🔤',
  colorTheme: {
    accentColor: 'text-indigo-500',
    badgeBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    borderAccent: 'border-indigo-500/40',
    cardBg: 'bg-indigo-500/5',
  },
  chapters: [
    {
      id: 'ch_alpha_upper', bookId: 'book_alphabet', chapterNumber: 1, titleJp: 'Capital Letters A–Z', titleId: 'Capital Letters A–Z',
      subtitle: '26 letters', description: 'Uppercase letters with stroke order.', coverIcon: 'A',
      items: toRefs(letters.filter(id => /^letter_[A-Z]$/.test(id)), 'kanji'),
    },
    {
      id: 'ch_alpha_lower', bookId: 'book_alphabet', chapterNumber: 2, titleJp: 'Small Letters a–z', titleId: 'Small Letters a–z',
      subtitle: '26 letters', description: 'Lowercase letters with stroke order.', coverIcon: 'a',
      items: toRefs(letters.filter(id => /^letter_[a-z]$/.test(id)), 'kanji'),
    },
  ],
};

export const OFFICIAL_BOOKS: OfficialBook[] = [
  letterBook,
  ...LEVEL_BOOKS.map(({ level, accent, cover }) => {
    const bookId = `book_${level.toLowerCase()}`;
    return {
      id: bookId,
      title: `${level} Essentials`,
      japaneseTitle: `${level} Essentials`,
      subtitle: `Core vocabulary, grammar and reading for ${level}`,
      description: `The ${level} curriculum: words, grammar points, reading passages and listening dialogues.`,
      level,
      category: 'curriculum' as const,
      coverIcon: cover,
      colorTheme: {
        accentColor: accent,
        badgeBg: `bg-current/15 ${accent} border-current/30`,
        borderAccent: 'border-current/40',
        cardBg: 'bg-surface-card',
      },
      chapters: chapters(bookId, `${level}`, level),
    };
  }),
];

export function getOfficialBookById(id: string): OfficialBook | undefined {
  return OFFICIAL_BOOKS.find(b => b.id === id);
}

import type { UserDeck } from '../types/rpg';

export function chapterToUserDeck(chapter: OfficialChapter, book: OfficialBook): UserDeck {
  return {
    id: chapter.id,
    title: `${book.title}: ${chapter.titleId}`,
    description: chapter.description || `${book.title} - Chapter ${chapter.chapterNumber}`,
    level: book.level,
    type: 'mixed',
    isDefault: false,
    coverIcon: chapter.coverIcon || book.coverIcon,
    createdAt: now,
    updatedAt: now,
    items: chapter.items,
  };
}

/** Convert an entire book into one deck (the full course, all chapters) */
export function bookToFullUserDeck(book: OfficialBook): UserDeck {
  const allItems: DeckItemRef[] = [];
  const seen = new Set<string>();
  for (const ch of book.chapters) {
    for (const it of ch.items) {
      const key = `${it.category}_${it.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        allItems.push(it);
      }
    }
  }
  return {
    id: `full_${book.id}`,
    title: `${book.title} (All Chapters)`,
    description: `Full course: ${book.title} (${book.chapters.length} chapters · ${allItems.length} items)`,
    level: book.level,
    type: 'mixed',
    isDefault: false,
    coverIcon: book.coverIcon,
    createdAt: now,
    updatedAt: now,
    items: allItems,
  };
}

/** Clone a chapter into the learner's own Buku Saku decks */
export function cloneChapterToUserDecks(
  chapter: OfficialChapter,
  book: OfficialBook,
  currentDecks: UserDeck[] = []
): { updatedDecks: UserDeck[]; clonedDeck: UserDeck } {
  const newId = `deck_cloned_ch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const clonedDeck: UserDeck = {
    id: newId,
    title: `${book.title}: ${chapter.titleId} (Copy)`,
    description: chapter.description || `Copy of material from ${book.title}`,
    level: book.level,
    type: 'mixed',
    isDefault: false,
    coverIcon: chapter.coverIcon || book.coverIcon,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: chapter.items.map(item => ({ ...item, addedAt: new Date().toISOString() })),
  };
  return { updatedDecks: [clonedDeck, ...currentDecks], clonedDeck };
}
