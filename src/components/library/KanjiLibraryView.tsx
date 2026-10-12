import React, { useState, useMemo, useDeferredValue } from 'react';
import type { DeckItemCategory } from '../../types/rpg';
import { Filter, LayoutGrid } from 'lucide-react';
import { KANJI_DATABASE } from '../../data/kanji';
import { KanjiItem, ItemMasteryRecord } from '../../types/content';
import { KanjiDetailModal } from './KanjiDetailModal';
import { playSound } from '../../utils/audio';
import { UserDeck } from '../../types/rpg';
import { isItemBookmarked } from '../../utils/decks';
import { SearchInput } from '../common/SearchInput';

/**
 * Letter Library (English edition). Replaces the Japanese kana/kanji charts: every capital and small
 * letter, with its sound, stroke count, and example words. Tap a letter to open its card and practice it.
 */
interface KanjiLibraryViewProps {
  items?: KanjiItem[];
  hideHeader?: boolean;
  soundEnabled?: boolean;
  itemMastery?: Record<string, ItemMasteryRecord>;
  userDecks?: UserDeck[];
  onToggleBookmark?: (id: string, category: DeckItemCategory, notes?: string, targetDeckId?: string) => void;
  onUpdateDecks?: (decks: UserDeck[]) => void;
  onRemoveItem?: (id: string, category: 'kanji') => void;
  onRewardPlayer?: (exp: number, gold: number) => void;
  onRecordStudy?: (category: 'kanjiWriting', id: string, count?: number) => void;
  onRecordInteraction?: (
    itemId: string,
    category: 'bunpou' | 'kotoba' | 'kanji' | 'dokkai' | 'choukai',
    interactionType: 'writing' | 'flashcard' | 'quiz',
    success?: boolean
  ) => void;
  onCompleteStudyItem?: (
    moduleId: 'bunpou' | 'kotoba' | 'kanji' | 'dokkai' | 'choukai' | 'boss' | 'questions' | 'tryOuts',
    expGained: number,
    goldGained: number,
    itemId?: string,
    score?: number,
    total?: number
  ) => void;
}

type LetterFilter = 'all' | 'capital' | 'small' | 'straight' | 'curve' | 'mixed';

const FILTERS: Array<{ id: LetterFilter; label: string }> = [
  { id: 'all', label: 'All letters' },
  { id: 'capital', label: 'Capital (A–Z)' },
  { id: 'small', label: 'Small (a–z)' },
  { id: 'straight', label: 'Straight strokes' },
  { id: 'curve', label: 'Curved strokes' },
  { id: 'mixed', label: 'Mixed' },
];

const isLetter = (item: KanjiItem) => /^[A-Za-z]$/.test(item.character);

export const KanjiLibraryView: React.FC<KanjiLibraryViewProps> = ({
  items,
  hideHeader = false,
  soundEnabled = true,
  itemMastery,
  userDecks,
  onToggleBookmark,
  onUpdateDecks,
  onRewardPlayer,
  onRecordStudy,
  onCompleteStudyItem,
}) => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<LetterFilter>('all');
  const [selectedLetter, setSelectedLetter] = useState<KanjiItem | null>(null);

  const allLetters = useMemo(() => {
    const source = items ?? Object.values(KANJI_DATABASE);
    const seen = new Set<string>();
    return source
      .filter(k => k && isLetter(k))
      .filter(k => {
        if (seen.has(k.character)) return false;
        seen.add(k.character);
        return true;
      })
      .sort((a, b) => {
        // Order: A–Z first, then a–z, as in the alphabet
        const ca = a.character.charCodeAt(0);
        const cb = b.character.charCodeAt(0);
        const ra = ca >= 97 ? ca - 97 + 26 : ca - 65;
        const rb = cb >= 97 ? cb - 97 + 26 : cb - 65;
        return ra - rb;
      });
  }, [items]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return allLetters.filter(k => {
      const isCapital = k.character === k.character.toUpperCase();
      if (filter === 'capital' && !isCapital) return false;
      if (filter === 'small' && isCapital) return false;
      if ((filter === 'straight' || filter === 'curve' || filter === 'mixed') && k.radical !== FILTER_SHAPE_LABEL[filter]) return false;
      if (!q) return true;
      const haystack = [
        k.character,
        k.meaningEn,
        k.meaningId,
        ...(k.kunyomi || []),
        ...(k.relatedWords || []).map(w => w.word),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [allLetters, deferredQuery, filter]);

  const isBookmarkedFor = (k: KanjiItem) => Boolean(userDecks && isItemBookmarked(userDecks, k.id || k.character, 'kanji'));

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="panel panel-stitched p-4 sm:p-5 rounded-2xl border border-border-subtle shadow-md">
          <h2 className="text-lg sm:text-xl font-bold font-heading text-text-primary flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo" /> Letter Library
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            All 52 letters, with their sound, stroke count, and example words. Tap a letter to practise writing it.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholderLatin="Search letters, sounds, example words…"
        />
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Filter className="w-4 h-4 text-text-muted shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setFilter(f.id); playSound('click', soundEnabled); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all font-heading ${
                filter === f.id ? 'bg-surface-elevated text-indigo border border-border-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel p-6 rounded-2xl text-center border border-border-subtle">
          <p className="text-sm font-bold text-text-primary">No letters match.</p>
          <p className="text-xs text-text-muted">Try another search or reset the filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 sm:gap-3">
          {filtered.map(k => {
            const mastery = itemMastery?.[k.id || k.character];
            const done = mastery ? mastery.masteryPercentage >= 100 : false;
            return (
              <button
                key={k.id || k.character}
                type="button"
                onClick={() => { setSelectedLetter(k); playSound('click', soundEnabled); }}
                className="relative panel p-2.5 sm:p-3 rounded-2xl border border-border-subtle hover:border-border-primary transition-all flex flex-col items-center gap-1 cursor-pointer"
                title={k.meaningEn}
              >
                {isBookmarkedFor(k) && <span className="absolute top-1 right-1 text-[9px] text-amber-400">★</span>}
                <span className="text-2xl sm:text-3xl font-bold font-heading text-text-primary leading-none">{k.character}</span>
                <span className="text-[9px] font-mono text-text-muted">{k.onyomi?.[0] || ''}</span>
                <span className="text-[9px] font-mono text-text-muted">{k.strokeCount} strokes{done ? ' · ✓' : ''}</span>
              </button>
            );
          })}
        </div>
      )}

      <KanjiDetailModal
        isOpen={Boolean(selectedLetter)}
        onClose={() => setSelectedLetter(null)}
        item={selectedLetter}
        masteryRecord={selectedLetter ? itemMastery?.[selectedLetter.id || selectedLetter.character] : undefined}
        soundEnabled={soundEnabled}
        isBookmarked={Boolean(selectedLetter && isBookmarkedFor(selectedLetter))}
        onToggleBookmark={onToggleBookmark && selectedLetter ? () => onToggleBookmark(selectedLetter.id || selectedLetter.character, 'kanji') : undefined}
        userDecks={userDecks}
        onToggleDeckItem={onToggleBookmark && selectedLetter ? (deckId) => onToggleBookmark(selectedLetter.id || selectedLetter.character, 'kanji', undefined, deckId) : undefined}
        onUpdateDecks={onUpdateDecks}
        onCompleteSheet={(_sheet, score, reward) => {
          if (!selectedLetter) return;
          const id = selectedLetter.id || selectedLetter.character;
          onRecordStudy?.('kanjiWriting', id, score);
          if (reward && onRewardPlayer) onRewardPlayer(reward.expGained, reward.goldGained);
          onCompleteStudyItem?.('kanji', reward?.expGained ?? 0, reward?.goldGained ?? 0, id, score, 1);
        }}
      />
    </div>
  );
};

const FILTER_SHAPE_LABEL: Record<'straight' | 'curve' | 'mixed', string> = {
  straight: 'Straight strokes',
  curve: 'Curved strokes',
  mixed: 'Straight and curved strokes',
};
