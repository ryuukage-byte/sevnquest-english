import { UserDeck, DeckItemRef } from '../types/rpg';
import kanjiDb from './db/kanji.json';
import kotobaDb from './db/kotoba.json';
import bunpouDb from './db/bunpou.json';

const now = new Date().toISOString();

const kanjiList = kanjiDb as unknown as Array<{ id: string; character: string }>;
const kotobaList = Object.values(kotobaDb as unknown as Record<string, { id: string; jlpt: string }>);
const bunpouList = bunpouDb as unknown as Array<{ id: string; level: string }>;

// Helper to map ids to DeckItemRef
function toRefs(ids: string[], category: 'kanji' | 'kotoba' | 'bunpou'): DeckItemRef[] {
  return ids.map(id => ({
    id,
    category,
    addedAt: now,
  }));
}

const alphabetRefs = toRefs(kanjiList.map(k => k.id), 'kanji');

const levelDeck = (level: 'A1' | 'A2' | 'B1' | 'B2', title: string, description: string, icon: string): UserDeck => ({
  id: `template_${level.toLowerCase()}`,
  title,
  description,
  level,
  type: 'mixed',
  isDefault: false,
  coverIcon: icon,
  createdAt: now,
  updatedAt: now,
  items: [
    ...toRefs(kotobaList.filter(k => k.jlpt === level).map(k => k.id), 'kotoba'),
    ...toRefs(bunpouList.filter(b => b.level === level).map(b => b.id), 'bunpou'),
  ],
});

export const TEMPLATE_DECKS: UserDeck[] = [
  {
    id: 'template_alphabet',
    title: 'Alphabet Dojo (A–Z, a–z)',
    description: 'All 52 capital and small letters, ready for stroke-order writing practice.',
    level: 'ALPHABET',
    type: 'mixed',
    isDefault: false,
    coverIcon: 'Aa',
    createdAt: now,
    updatedAt: now,
    items: alphabetRefs,
  },
  levelDeck('A1', 'Starter Words (A1)', 'Everyday vocabulary and the basic grammar of A1.', '🌱'),
  levelDeck('A2', 'Growing Vocabulary (A2)', 'Words for travel, shopping and daily routines, with A2 grammar.', '🧭'),
  levelDeck('B1', 'Independent Words (B1)', 'Words for work, opinions and stories, with B1 grammar.', '⚔️'),
  levelDeck('B2', 'Advanced Words (B2)', 'Academic and nuanced vocabulary, with B2 grammar.', '👑'),
];

/**
 * Get a template deck by its ID
 */
export function getTemplateDeckById(id: string): UserDeck | undefined {
  return TEMPLATE_DECKS.find(deck => deck.id === id);
}

/**
 * 1-Click clone a template deck into user's personal Buku Saku decks
 */
export function cloneTemplateToUserDecks(
  templateId: string,
  currentDecks: UserDeck[] = []
): { updatedDecks: UserDeck[]; clonedDeck: UserDeck | null } {
  const template = getTemplateDeckById(templateId);
  if (!template) {
    return { updatedDecks: currentDecks, clonedDeck: null };
  }

  const newId = `deck_cloned_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const clonedDeck: UserDeck = {
    ...template,
    id: newId,
    title: `${template.title} (Copy)`,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Clone items array
    items: template.items.map(item => ({ ...item, addedAt: new Date().toISOString() })),
  };

  return {
    updatedDecks: [clonedDeck, ...currentDecks],
    clonedDeck,
  };
}
