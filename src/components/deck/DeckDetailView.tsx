import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  PenTool,
  Copy,
  Check,
  BookOpen,
  Plus,
  Bookmark,
  Trash2,
  Edit2,
} from 'lucide-react';
import { UserDeck, DeckItemCategory } from '../../types/rpg';
import { KotobaItem, KanjiItem, BunpouItem, ItemMasteryRecord } from '../../types/content';
import { playSound } from '../../utils/audio';
import { DeckFlashcardRunner } from './DeckFlashcardRunner';
import { DeckWritingRunner } from './DeckWritingRunner';
import { KotobaLibraryView } from '../library/KotobaLibraryView';
import { KanjiLibraryView } from '../library/KanjiLibraryView';
import { BunpouLibraryView } from '../library/BunpouLibraryView';
import { KOTOBA_DATABASE } from '../../data/kotoba';
import { KANJI_DATABASE } from '../../data/kanji';
import { BUNPOU_DATABASE } from '../../data/bunpou';
import { asWritable } from '../../engine/traits/traits';
import { resolveDeckItem } from '../../utils/decks';
import { BookIcon } from '../ui/EngravingIcons';

export interface DeckDetailViewProps {
  deck: UserDeck;
  onBack: () => void;
  isTemplate?: boolean;
  // Template deck actions
  onCloneTemplate?: () => void;
  isCloned?: boolean;
  // User deck actions (Buku Saku)
  onEditDeck?: (deck: UserDeck) => void;
  onDeleteDeck?: (deckId: string) => void;
  onOpenAddItemModal?: () => void;
  onOpenQuickPresetModal?: () => void;
  onImportBookmarks?: () => void;
  onRemoveItemFromDeck?: (itemId: string, category: DeckItemCategory) => void;
  onClearDeck?: () => void;
  onToggleBookmark?: (id: string, category: DeckItemCategory, notes?: string, targetDeckId?: string) => void;
  // Study & Audio props
  soundEnabled?: boolean;
  onRewardPlayer?: (exp: number, gold: number) => void;
  onCompleteStudyItem?: (
    moduleId: 'bunpou' | 'kotoba' | 'kanji' | 'dokkai' | 'choukai' | 'boss' | 'questions' | 'tryOuts',
    expGained: number,
    goldGained: number,
    itemId?: string,
    score?: number,
    total?: number,
    interactionType?: 'writing' | 'flashcard' | 'quiz'
  ) => void;
  itemMastery?: Record<string, ItemMasteryRecord>;
  userDecks?: UserDeck[];
  furiganaEnabled?: boolean;
}

export type DeckLibraryTab = 'kotoba' | 'kanji' | 'bunpou';

export const DeckDetailView: React.FC<DeckDetailViewProps> = ({
  deck,
  onBack,
  isTemplate = false,
  onCloneTemplate,
  isCloned = false,
  onEditDeck,
  onDeleteDeck,
  onOpenAddItemModal,
  onOpenQuickPresetModal,
  onImportBookmarks,
  onRemoveItemFromDeck,
  onClearDeck,
  onToggleBookmark,
  soundEnabled = true,
  onRewardPlayer,
  onCompleteStudyItem,
  itemMastery = {},
  userDecks = [],
}) => {
  const [activeRunner, setActiveRunner] = useState<'flashcard' | 'writing' | null>(null);

  // Extract real database entities scoped to this deck
  const deckKotoba = useMemo<KotobaItem[]>(() => {
    return (deck.items || [])
      .filter(i => i.category === 'kotoba')
      .map(i => KOTOBA_DATABASE[i.id])
      .filter((it): it is KotobaItem => Boolean(it));
  }, [deck.items]);

  const deckKanji = useMemo<KanjiItem[]>(() => {
    return (deck.items || [])
      .filter(i => i.category === 'kanji')
      .map(i => KANJI_DATABASE[i.id])
      .filter((it): it is KanjiItem => Boolean(it));
  }, [deck.items]);

  const deckBunpou = useMemo<BunpouItem[]>(() => {
    return (deck.items || [])
      .filter(i => i.category === 'bunpou')
      .map(i => BUNPOU_DATABASE[i.id])
      .filter((it): it is BunpouItem => Boolean(it));
  }, [deck.items]);

  // Initial tab defaults to whichever category has items
  const [activeTab, setActiveTab] = useState<DeckLibraryTab>(() => {
    if (deckKotoba.length > 0) return 'kotoba';
    if (deckKanji.length > 0) return 'kanji';
    if (deckBunpou.length > 0) return 'bunpou';
    return 'kotoba';
  });

  const totalItemCount = deckKotoba.length + deckKanji.length + deckBunpou.length;

  // Compute writable items (kanji + short kana words)
  const writableCount = useMemo(() => {
    return (deck.items || [])
      .map(ref => resolveDeckItem(ref))
      .filter(it => it !== null && asWritable(it) !== null).length;
  }, [deck.items]);

  // Active Runner Modals
  if (activeRunner === 'flashcard') {
    return (
      <DeckFlashcardRunner
        deck={deck}
        onClose={() => setActiveRunner(null)}
        onReward={onRewardPlayer}
        onCompleteStudyItem={onCompleteStudyItem}
        soundEnabled={soundEnabled}
      />
    );
  }

  if (activeRunner === 'writing') {
    return (
      <DeckWritingRunner
        deck={deck}
        onClose={() => setActiveRunner(null)}
        onReward={onRewardPlayer}
        onCompleteStudyItem={onCompleteStudyItem}
        soundEnabled={soundEnabled}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Back & Breadcrumb Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            playSound('click', soundEnabled);
            onBack();
          }}
          className="btn-physical-secondary px-3.5 py-2 rounded-xl text-xs font-bold font-heading flex items-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTemplate ? 'Back to template decks' : 'Back to your Notebook'}</span>
        </button>

        {/* User Deck Actions: Edit Info & Delete Deck */}
        {!isTemplate && !deck.isDefault && (
          <div className="flex items-center gap-2">
            {onEditDeck && (
              <button
                type="button"
                onClick={() => {
                  playSound('click', soundEnabled);
                  onEditDeck(deck);
                }}
                className="btn-physical-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Info Deck</span>
              </button>
            )}
            {onDeleteDeck && (
              <button
                type="button"
                onClick={() => onDeleteDeck(deck.id)}
                className="btn-physical-secondary px-3 py-1.5 rounded-xl text-xs font-bold text-wine-accent flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Deck Header Banner (Skeuomorphic Japanese Adventure Notebook) */}
      <div className="panel panel-stitched p-5 sm:p-6 rounded-3xl border border-border-subtle space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-inset border border-border-subtle flex items-center justify-center shrink-0 shadow-inner">
              <BookIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isTemplate ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-border-subtle">
                    Template Resmi
                  </span>
                ) : deck.isDefault ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-border-subtle flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-gold" />
                    <span>Bookmark Utama</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-text-secondary bg-surface-inset px-2 py-0.5 rounded-md border border-border-subtle">
                    Tipe: {deck.type}
                  </span>
                )}

                {deck.level && (
                  <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo bg-indigo/10 px-2 py-0.5 rounded-md border border-border-subtle">
                    {deck.level}
                  </span>
                )}
                <span className="text-[10px] font-mono text-text-muted">
                  {totalItemCount} item materi tersimpan
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-text-primary">
                {deck.title}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                {deck.description || (isTemplate ? 'An official curriculum deck.' : 'A collection of items you picked to study intensively.')}
              </p>
            </div>
          </div>

          {/* Action Buttons: Practice Launchers & Deck Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
            {/* Flashcard Button */}
            <button
              type="button"
              disabled={totalItemCount === 0}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveRunner('flashcard');
              }}
              className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-gold fill-gold" />
              <span>Start flashcards</span>
            </button>

            {/* Writing Button */}
            <button
              type="button"
              disabled={writableCount === 0}
              onClick={() => {
                playSound('click', soundEnabled);
                setActiveRunner('writing');
              }}
              className={`px-4 py-2.5 rounded-2xl font-heading font-bold text-xs flex items-center gap-2 transition-all ${
                writableCount === 0
                  ? 'opacity-40 cursor-not-allowed bg-surface-inset text-text-muted border border-border-subtle'
                  : 'bg-surface-elevated text-text-primary border border-border-primary shadow-sm hover:scale-105 cursor-pointer'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-indigo" />
              <span>Writing practice ({writableCount})</span>
            </button>

            {/* If Template: Salin ke Buku Saku */}
            {isTemplate && onCloneTemplate && (
              <button
                type="button"
                onClick={() => onCloneTemplate()}
                className={`px-4 py-2.5 rounded-2xl font-heading font-bold text-xs border flex items-center gap-2 transition-all cursor-pointer ${
                  isCloned
                    ? 'bg-emerald-500/15 text-emerald-700 border-border-subtle'
                    : 'bg-surface-inset hover:bg-surface-elevated text-text-primary border-border-subtle hover:border-border-primary'
                }`}
                title="Copy this template deck to your Notebook"
              >
                {isCloned ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gold" />
                    <span>Copy to Notebook</span>
                  </>
                )}
              </button>
            )}

            {/* If User Deck: Add Material */}
            {!isTemplate && onOpenAddItemModal && (
              <button
                type="button"
                onClick={onOpenAddItemModal}
                className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-gold" />
                <span>Search items</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. Secondary Bar for User Deck: Quick Preset, Import Bookmarks, Clear Deck */}
        {!isTemplate && (
          <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {onOpenQuickPresetModal && (
                <button
                  type="button"
                  onClick={onOpenQuickPresetModal}
                  className="btn-physical-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Isi Cepat Berdasarkan Level JLPT"
                >
                  <span>Isi Preset JLPT</span>
                </button>
              )}

              {!deck.isDefault && onImportBookmarks && (
                <button
                  type="button"
                  onClick={onImportBookmarks}
                  className="btn-physical-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy bookmarked items into this deck"
                >
                  <Bookmark className="w-3.5 h-3.5 text-gold" />
                  <span>Import bookmarks</span>
                </button>
              )}

              {totalItemCount > 0 && onClearDeck && (
                <button
                  type="button"
                  onClick={onClearDeck}
                  className="btn-physical-secondary px-2.5 py-1.5 rounded-xl text-xs hover:text-wine-accent transition-colors cursor-pointer flex items-center gap-1"
                  title="Remove all items from this deck"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            <div className="text-xs font-mono text-text-muted">
              Pustaka Mini Personal
            </div>
          </div>
        )}

        {/* 4. Mini Library Grimoire Volume Switcher (Matching Perpustakaan & Grimoire Architecture) */}
        <div className="pt-3 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="book-tab-nav flex-wrap">
            {/* Jilid I: Kosakata */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('kotoba');
                playSound('click', soundEnabled);
              }}
              className={`book-tab-btn cursor-pointer ${
                activeTab === 'kotoba' ? 'active' : 'inactive'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-surface-inset border border-border-subtle flex items-center justify-center text-xs font-jp font-bold text-text-primary">
                V
              </div>
              <div className="text-left">
                <span className="block text-xs leading-none font-bold">Vocabulary</span>
                <span className="text-[10px] opacity-70 font-mono">{deckKotoba.length} words</span>
              </div>
            </button>

            {/* Jilid II: Kanji */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('kanji');
                playSound('click', soundEnabled);
              }}
              className={`book-tab-btn cursor-pointer ${
                activeTab === 'kanji' ? 'active' : 'inactive'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-surface-inset border border-border-subtle flex items-center justify-center text-xs font-jp font-bold text-text-primary">
                L
              </div>
              <div className="text-left">
                <span className="block text-xs leading-none font-bold">Letters</span>
                <span className="text-[10px] opacity-70 font-mono">{deckKanji.length} Aksara</span>
              </div>
            </button>

            {/* Jilid III: Tata Bahasa */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('bunpou');
                playSound('click', soundEnabled);
              }}
              className={`book-tab-btn cursor-pointer ${
                activeTab === 'bunpou' ? 'active' : 'inactive'
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-surface-inset border border-border-subtle flex items-center justify-center text-xs font-jp font-bold text-text-primary">
                G
              </div>
              <div className="text-left">
                <span className="block text-xs leading-none font-bold">Grammar</span>
                <span className="text-[10px] opacity-70 font-mono">{deckBunpou.length} patterns</span>
              </div>
            </button>
          </div>

          <div className="text-xs font-mono text-text-muted hidden sm:block">
            {isTemplate ? 'Pustaka Mini Kurikulum' : 'Pustaka Mini Deck'}
          </div>
        </div>
      </div>

      {/* 5. Mini Library View (Exact Library Layout, Search with IME, Filters, Cards, and Modals) */}
      <div className="animate-fade-in">
        {activeTab === 'kotoba' && (
          deckKotoba.length > 0 ? (
            <KotobaLibraryView
              items={deckKotoba}
              hideHeader={false}
              soundEnabled={soundEnabled}
              itemMastery={itemMastery}
              userDecks={userDecks}
              onRewardPlayer={onRewardPlayer}
              onCompleteStudyItem={onCompleteStudyItem}
              onToggleBookmark={onToggleBookmark}
              onRemoveItem={onRemoveItemFromDeck ? (id) => onRemoveItemFromDeck(id, 'kotoba') : undefined}
            />
          ) : (
            <div className="panel panel-stitched p-8 sm:p-12 rounded-3xl border border-border-subtle text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-inset text-gold border border-border-subtle flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
                  No vocabulary in this deck yet
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  {isTemplate
                    ? 'This template deck has no vocabulary entries.'
                    : 'Search for items or use a preset to add vocabulary to this deck.'}
                </p>
              </div>
              {!isTemplate && onOpenAddItemModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenAddItemModal}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" />
                    <span>Search & add vocabulary</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'kanji' && (
          deckKanji.length > 0 ? (
            <KanjiLibraryView
              items={deckKanji}
              hideHeader={false}
              soundEnabled={soundEnabled}
              itemMastery={itemMastery}
              userDecks={userDecks}
              onRewardPlayer={onRewardPlayer}
              onCompleteStudyItem={onCompleteStudyItem}
              onToggleBookmark={onToggleBookmark}
              onRemoveItem={onRemoveItemFromDeck ? (id) => onRemoveItemFromDeck(id, 'kanji') : undefined}
            />
          ) : (
            <div className="panel panel-stitched p-8 sm:p-12 rounded-3xl border border-border-subtle text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-inset text-gold border border-border-subtle flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
                  No letters in this deck yet
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  {isTemplate
                    ? 'This template deck has no letter entries.'
                    : 'Search for items or use a preset to add letters to this deck.'}
                </p>
              </div>
              {!isTemplate && onOpenAddItemModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenAddItemModal}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" />
                    <span>Search & add letters</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'bunpou' && (
          deckBunpou.length > 0 ? (
            <BunpouLibraryView
              items={deckBunpou}
              hideHeader={false}
              soundEnabled={soundEnabled}
              itemMastery={itemMastery}
              userDecks={userDecks}
              onRewardPlayer={onRewardPlayer}
              onCompleteStudyItem={onCompleteStudyItem}
              onToggleBookmark={onToggleBookmark}
              onRemoveItem={onRemoveItemFromDeck ? (id) => onRemoveItemFromDeck(id, 'bunpou') : undefined}
            />
          ) : (
            <div className="panel panel-stitched p-8 sm:p-12 rounded-3xl border border-border-subtle text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-surface-inset text-gold border border-border-subtle flex items-center justify-center mx-auto shadow-inner">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
                  No grammar in this deck yet
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto">
                  {isTemplate
                    ? 'This template deck has no grammar entries.'
                    : 'Search for items or use a preset to add grammar patterns to this deck.'}
                </p>
              </div>
              {!isTemplate && onOpenAddItemModal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onOpenAddItemModal}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold" />
                    <span>Search & add grammar</span>
                  </button>
                </div>
              )}
            </div>
          )
        )}

        {totalItemCount === 0 && (
          <div className="panel panel-stitched p-8 sm:p-12 rounded-3xl border border-border-subtle text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-surface-inset text-gold border border-border-subtle flex items-center justify-center mx-auto shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-heading font-bold text-text-primary">
                Deck Ini Masih Kosong
              </h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                {isTemplate
                  ? 'No study items are listed in this curriculum deck yet.'
                  : 'Choose an option below to fill this deck instantly, or search for the items you want.'}
              </p>
            </div>

            {!isTemplate && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenQuickPresetModal && (
                  <button
                    type="button"
                    onClick={onOpenQuickPresetModal}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs text-gold inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Isi Otomatis Preset JLPT</span>
                  </button>
                )}

                {onOpenAddItemModal && (
                  <button
                    type="button"
                    onClick={onOpenAddItemModal}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-gold" />
                    <span>Search the library</span>
                  </button>
                )}

                {!deck.isDefault && onImportBookmarks && (
                  <button
                    type="button"
                    onClick={onImportBookmarks}
                    className="btn-physical-secondary px-4 py-2.5 rounded-2xl font-heading font-bold text-xs inline-flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-gold" />
                    <span>Import from bookmarks</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { DeckDetailView as TemplateDeckDetailView };
