import { getWordTypeLabel } from '../../utils/wordType';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, ArrowRight, ArrowLeft, Edit3 } from 'lucide-react';
import { BookIcon } from '../ui/EngravingIcons';
import { KotobaItem, Question } from '../../types/content';
import { KOTOBA_DATABASE } from '../../data/kotoba';
import { BUNPOU_DATABASE } from '../../data/bunpou';
import { QuizEngine } from './QuizEngine';
import { speakJapanese, playSound } from '../../utils/audio';
import { RubyText } from './RubyText';
import { UniversalFlashcard } from './UniversalFlashcard';
import { KotobaDetailModal } from '../library/KotobaDetailModal';
import { KotobaWritingPractice } from './KotobaWritingPractice';
import { fisherYatesShuffle } from '../../utils/smartRandomizer';

interface KotobaModuleProps {
  kotobaIds: string[];
  bunpouIds?: string[];
  onReward: (exp: number, gold: number, moduleId: string, itemId?: string, score?: number, total?: number) => void;
  onBack: () => void;
  playerMp: number;
  playerInt: number;
  onUseMp: (amount: number) => boolean;
  soundEnabled?: boolean;
  furiganaEnabled?: boolean;
}

// English edition: Japanese verb conjugation drills are not ported, so this yields no conjugation forms.
const conjugateVerb = (_word: string, _reading?: string): any => null;

export const KotobaModule: React.FC<KotobaModuleProps> = ({
  kotobaIds,
  bunpouIds = [],
  onReward,
  onBack: _onBack,
  playerMp,
  playerInt,
  onUseMp,
  soundEnabled = true,
  furiganaEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'flashcard' | 'writing'>('library');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedWritingIndex, setSelectedWritingIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [expPopup, setExpPopup] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KotobaItem | null>(null);

  const fallbackKotobaItem: KotobaItem = useMemo(() => {
    return Object.values(KOTOBA_DATABASE)[0] || {
      id: 'kotoba_0001',
      word: 'cat',
      reading: '/kæt/',
      meaningId: 'a small furry animal kept as a pet',
      meaningEn: 'I / me',
      meaningJa: 'A small furry animal that many people keep as a pet.',
      jlpt: 'A1',
      wordType: 'noun',
      kanjiComponents: []
    };
  }, []);

  // Items dedicated to this stage
  const items: KotobaItem[] = useMemo(() => {
    let validItems = (kotobaIds || []).map(id => KOTOBA_DATABASE[id]).filter(Boolean);
    if (validItems.length === 0) {
      validItems = Object.values(KOTOBA_DATABASE).slice(0, 5);
    }
    return validItems;
  }, [kotobaIds]);

  const currentItem = items[currentCardIndex] || items[0] || fallbackKotobaItem;
  const currentWritingItem = items[selectedWritingIndex] || items[0] || fallbackKotobaItem;

  // English edition: quiz questions come from the stage's own vocabulary. Distractors are other words of the
  // same part of speech, so the choices stay plausible. (Japanese conjugation drills are not ported.)
  const compiledQuizQuestions: Question[] = useMemo(() => {
    const list: Question[] = [];
    const allWords = Object.values(KOTOBA_DATABASE).filter(k => k && k.word);
    const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    items.forEach((item) => {
      const gloss = item.meaningEn || item.meaningId;
      const sameType = allWords.filter(k => k.id !== item.id && k.word !== item.word && k.wordType === item.wordType);
      const pool = sameType.length >= 3 ? sameType : allWords.filter(k => k.id !== item.id && k.word !== item.word);

      // 1. Meaning: "What does X mean?"
      const glossDistractors = Array.from(new Set(pool.map(p => p.meaningEn || p.meaningId)))
        .filter(m => m && m.toLowerCase() !== gloss.toLowerCase());
      const meaningDistractors = fisherYatesShuffle(glossDistractors).slice(0, 3);
      const meaningOptions = fisherYatesShuffle([gloss, ...meaningDistractors]);
      list.push({
        id: `vocab_meaning_${item.id}`,
        instruction: `What does "${item.word}" mean?`,
        prompt: item.word,
        ruby: item.reading,
        options: meaningOptions,
        correctIndex: meaningOptions.indexOf(gloss),
        explanation: `"${item.word}" (${item.reading}) means "${gloss}". ${item.definitionId || ''}`.trim(),
        audioPrompt: item.word,
        difficultyLevel: 1,
      });

      // 2. Usage: fill the blank in the example sentence
      const example = item.exampleSentence?.japanese;
      if (example && example.toLowerCase().includes(item.word.toLowerCase())) {
        const blanked = example.replace(new RegExp(escapeRe(item.word), 'i'), '_____');
        const wordDistractors = fisherYatesShuffle(Array.from(new Set(pool.map(p => p.word)))).slice(0, 3);
        const wordOptions = fisherYatesShuffle([item.word, ...wordDistractors]);
        list.push({
          id: `vocab_fill_${item.id}`,
          instruction: 'Choose the word that completes the sentence.',
          prompt: blanked,
          options: wordOptions,
          correctIndex: wordOptions.indexOf(item.word),
          explanation: `The full sentence is: "${example}"`,
          audioPrompt: example,
          difficultyLevel: 2,
        });
      }
    });

    return list;
  }, [items]);

  const handlePlayAudio = (word: string, reading?: string) => {
    speakJapanese(reading || word);
  };

  const handleFlipCard = () => {
    if (!isFlipped) {
      onReward(0.01, 0, 'kotoba_flip');
      setExpPopup(true);
      setTimeout(() => setExpPopup(false), 800);
    }
    setIsFlipped(!isFlipped);
    playSound('click', soundEnabled);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < items.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      playSound('click', soundEnabled);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      playSound('click', soundEnabled);
    }
  };

  const handleStartQuiz = () => {
    playSound('click', soundEnabled);
    setIsQuizActive(true);
  };

  // Quiz mode: dynamically renders the exact questions compiled for this stage's kotoba
  if (isQuizActive) {
    return (
      <div className="w-full space-y-4">
        <QuizEngine
          title={`📝 Vocabulary quiz (${compiledQuizQuestions.length} questions)`}
          questions={compiledQuizQuestions}
          playerMp={playerMp}
          playerInt={playerInt}
          onUseMp={onUseMp}
          soundEnabled={soundEnabled}
          furiganaEnabled={furiganaEnabled}
          onComplete={(score, total, exp, gold) => {
            onReward(exp, gold, 'kotoba', items[0]?.id || 'kotoba_set', score, total);
          }}
          onExit={() => {
            setIsQuizActive(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-2xl bg-surface-elevated text-indigo shadow-sm border border-border-subtle">
            <BookIcon className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-text-primary font-heading flex items-center gap-2">
              Module 2: 📝 KOTOBA (Vocabulary)
            </h2>
            <p className="text-xs text-text-secondary">
              Learn {items.length} words today with the library, flashcards, writing canvas & quiz
            </p>
          </div>
        </div>

        {/* Tab Switcher: Pustaka, Flashcard, Tulis Canvas, Latihan (X) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-inset p-1 rounded-2xl border border-border-subtle">
          <button
            onClick={() => {
              setActiveTab('library');
              playSound('click', soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'library'
                ? 'seg-active text-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            📖 Pustaka
          </button>

          <button
            onClick={() => {
              setActiveTab('flashcard');
              playSound('click', soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flashcard'
                ? 'seg-active text-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🗂️ Flashcard
          </button>

          <button
            onClick={() => {
              setActiveTab('writing');
              playSound('click', soundEnabled);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'writing'
                ? 'seg-active text-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Writing canvas</span>
          </button>

          <button
            onClick={handleStartQuiz}
            className="btn-physical-secondary px-3 py-1.5 rounded-xl text-xs font-bold text-gold transition-all flex items-center gap-1.5"
          >
            🎯 Quiz ({compiledQuizQuestions.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-surface-card panel-stitched border border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary font-heading mb-1">Vocabulary (Kotoba)</h3>
            <p className="text-xs text-text-secondary">
              Study the word list below. Hear each pronunciation, read the example, and switch to the writing canvas or the quiz ({compiledQuizQuestions.length} questions) to earn EXP!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  playSound('click', soundEnabled);
                }}
                className="flex items-start gap-3 p-3.5 rounded-2xl bg-surface-card border border-border-subtle hover:bg-surface-elevated transition-colors cursor-pointer group"
              >
                <div className="shrink-0 w-7 h-7 rounded-full bg-surface-inset flex items-center justify-center text-[10px] font-bold text-indigo border border-border-subtle">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h4 className="text-lg font-black text-text-primary font-jp mb-0.5 flex items-end gap-1.5">
                        <RubyText japanese={item.word} reading={item.reading} showFurigana={furiganaEnabled} />
                      </h4>
                      <p className="text-xs font-bold text-gold mb-1">{item.meaningId}</p>
                      <p className="text-[10px] text-text-muted">Tipe: {getWordTypeLabel(item.wordType)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(item.word, item.reading);
                      }}
                      className="btn-physical-secondary p-1.5 rounded-lg hover:text-indigo transition-colors"
                      title="Listen"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'flashcard' && (
        <div className="space-y-4">
          {/* Card Progress */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Kata <strong className="text-indigo font-bold">{currentCardIndex + 1}</strong> dari {items.length}</span>
            <span className="font-mono text-gold font-bold">Total: {items.length}</span>
          </div>

          {/* Interactive 3D Flip Card */}
          <div className="relative">
            <AnimatePresence>
              {expPopup && (
                <motion.div
                  key="expPopup"
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -40, scale: 1.2 }}
                  exit={{ opacity: 0, y: -60 }}
                  className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 text-state-success font-black text-xl drop-shadow-md pointer-events-none flex items-center gap-1"
                >
                  +0.01 EXP
                </motion.div>
              )}
            </AnimatePresence>
            <UniversalFlashcard
              item={currentItem}
              isFlipped={isFlipped}
              onFlip={handleFlipCard}
              soundEnabled={soundEnabled}
              furiganaEnabled={furiganaEnabled}
            />
          </div>

          {/* Card Controls */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrevCard}
              disabled={currentCardIndex === 0}
              className="rpg-btn rpg-btn-secondary flex-1 py-3 text-sm font-bold gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={handleNextCard}
              disabled={currentCardIndex === items.length - 1}
              className="rpg-btn rpg-btn-primary flex-1 py-3 text-sm font-bold gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Quiz CTA Banner */}
          <div className="p-4 rounded-2xl bg-surface-card panel-stitched border border-border-subtle flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-text-primary font-heading">Siap Menguji Ingatan Kotoba?</h4>
              <p className="text-[11px] text-text-secondary">Answer meaning and usage questions with {compiledQuizQuestions.length} tantangan pilihan ganda</p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="btn py-2 px-4 text-xs font-bold shrink-0 text-gold"
            >
              Start quiz ({compiledQuizQuestions.length})
            </button>
          </div>
        </div>
      )}

      {activeTab === 'writing' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-surface-card panel-stitched border border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary font-heading flex items-center gap-2 mb-1">
              <Edit3 className="w-4 h-4 text-wine-accent" />
              Letter writing (canvas)
            </h3>
            <p className="text-xs text-text-secondary">
              Pick a word below to practise the stroke order of each letter on the canvasanvas interaktif.
            </p>
          </div>

          {/* Word Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedWritingIndex(idx);
                  playSound('click', soundEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedWritingIndex === idx
                    ? 'seg-active text-gold'
                    : 'bg-surface-card text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                <span className="font-jp text-sm font-black">{item.word}</span>
                <span className="text-[10px] opacity-75">({item.reading || item.word})</span>
              </button>
            ))}
          </div>

          {/* Writing Canvas Practice Module */}
          <div className="rounded-2xl bg-surface-card panel-stitched border border-border-subtle p-3 sm:p-5 shadow-md">
            <KotobaWritingPractice
              key={currentWritingItem.id}
              kotoba={currentWritingItem}
              soundEnabled={soundEnabled}
              onCompleteWord={(score, reward) => {
                onReward(reward?.expGained ?? 20, reward?.goldGained ?? 10, 'kotoba_writing', currentWritingItem.id, score, 100);
              }}
              onFinishWord={() => {
                if (selectedWritingIndex < items.length - 1) {
                  setSelectedWritingIndex(prev => prev + 1);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <KotobaDetailModal
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            item={selectedItem}
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
