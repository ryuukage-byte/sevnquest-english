import React, { useMemo, useState } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';

export type FeatureTarget =
  | { type: 'tab'; tab: 'maps' | 'daily' | 'weekly' | 'leaderboard' | 'library' | 'deck' | 'settings' }
  | { type: 'status' }
  | { type: 'recall' }
  | { type: 'guide' };

interface FeatureEntry {
  id: string;
  title: string;
  hint: string;
  keywords: string;
  target: FeatureTarget;
}

const FEATURES: FeatureEntry[] = [
  { id: 'flashcard', title: 'Flashcards', hint: 'Notebook → choose a deck → Start flashcards', keywords: 'flashcard kartu hafalan kosakata kotoba kanji deck', target: { type: 'tab', tab: 'deck' } },
  { id: 'menulis', title: 'Writing practice', hint: 'Notebook → choose a deck → Writing practice', keywords: 'menulis tulis writing stroke goresan kanji kana hiragana katakana', target: { type: 'tab', tab: 'deck' } },
  { id: 'buku-saku', title: 'Notebook & decks', hint: 'Your collection of word, letter and grammar decks', keywords: 'buku saku deck bookmark simpan koleksi bikin buat', target: { type: 'tab', tab: 'deck' } },
  { id: 'kotoba', title: 'Vocabulary dictionary', hint: 'Library → Vocabulary: search words, meanings and examples', keywords: 'kotoba kosakata kata vocab kamus arti', target: { type: 'tab', tab: 'library' } },
  { id: 'kanji', title: 'Letter library', hint: 'Library → Letters: sounds, meanings and stroke order', keywords: 'kanji onyomi kunyomi goresan huruf', target: { type: 'tab', tab: 'library' } },
  { id: 'bunpou', title: 'Grammar (Bunpou)', hint: 'Library → Grammar: formulas, meanings and examples', keywords: 'bunpou pola kalimat tata bahasa grammar rumus konjugasi', target: { type: 'tab', tab: 'library' } },
  { id: 'world', title: 'World', hint: 'Arena Arcade games', keywords: 'world arcade dungeon tower menara game latihan speed rush', target: { type: 'tab', tab: 'maps' } },
  { id: 'recall', title: 'Memory recall', hint: 'Review items you are starting to forget (SRS)', keywords: 'recall ulang ulangan srs review memori lupa', target: { type: 'recall' } },
  { id: 'misi-harian', title: 'Daily quests', hint: 'Finish quests and claim EXP & Coin', keywords: 'misi harian daily hadiah klaim koin exp streak', target: { type: 'tab', tab: 'daily' } },
  { id: 'misi-mingguan', title: 'Weekly quests', hint: 'Weekly goals with bigger rewards', keywords: 'misi mingguan weekly hadiah target', target: { type: 'tab', tab: 'weekly' } },
  { id: 'rank', title: 'Leaderboard', hint: 'Player rankings', keywords: 'rank peringkat leaderboard skor papan', target: { type: 'tab', tab: 'leaderboard' } },
  { id: 'status', title: 'Status sheet & profile', hint: 'Level, tier, mastery and weak spots', keywords: 'status profil karakter mastery tutor kelemahan lemah level tier nama avatar', target: { type: 'status' } },
  { id: 'pengaturan', title: 'Settings', hint: 'Menu → sound, pronunciation, account, reset data', keywords: 'pengaturan setting menu suara sfx furigana akun login google reset hapus data tema', target: { type: 'tab', tab: 'settings' } },
  { id: 'panduan', title: 'SevnQuest guide', hint: 'How to study & a path for beginners', keywords: 'panduan bantuan tutorial cara mulai pemula help', target: { type: 'guide' } },
];

const norm = (s: string) => s.normalize('NFKC').toLowerCase().trim();

interface FeatureSearchProps {
  onSelect: (target: FeatureTarget) => void;
}

/** Pencarian fitur di Castle: ketik kata kunci, ketuk hasil untuk langsung menuju fitur. */
export const FeatureSearch: React.FC<FeatureSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const tokens = norm(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return [];
    return FEATURES.filter(f => {
      const hay = `${f.title} ${f.hint} ${f.keywords}`.toLowerCase();
      return tokens.every(t => hay.includes(t));
    }).slice(0, 5);
  }, [query]);

  const pick = (f: FeatureEntry) => {
    setQuery('');
    onSelect(f.target);
  };

  return (
    <div className="p-3 space-y-2">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && results[0]) pick(results[0]);
            if (e.key === 'Escape') setQuery('');
          }}
          placeholder="Search features, flashcards, writing…"
          aria-label="Search features"
          className="w-full pl-10 pr-10 py-3 bg-surface-inset border border-border-subtle rounded-2xl text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-border-primary transition-all shadow-inner font-medium"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {query.trim() && (
        results.length > 0 ? (
          <ul className="space-y-1.5">
            {results.map(f => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => pick(f)}
                  className="w-full p-3 rounded-2xl bg-surface-inset border border-border-subtle hover:border-border-primary flex items-center justify-between gap-3 text-left transition-all group cursor-pointer"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-text-primary font-heading group-hover:text-gold transition-colors">{f.title}</span>
                    <span className="block text-[10px] text-text-secondary font-mono truncate">{f.hint}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-gold shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-secondary font-body px-1">No features found. Try another word, e.g. “flashcard”, “writing”, “misi”.</p>
        )
      )}
    </div>
  );
};
