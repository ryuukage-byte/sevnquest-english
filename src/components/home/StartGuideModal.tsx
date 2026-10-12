import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, Compass, Languages, BookOpen, Repeat, Flame, Sprout, Library, Map as MapIcon,
} from 'lucide-react';
import { playSound } from '../../utils/audio';

export type GuidePath = 'foundation' | 'library' | 'world';

interface StartGuideModalProps {
  isOpen: boolean;
  soundEnabled?: boolean;
  /** Dipanggil saat panduan ditutup atau selesai (tandai sudah dilihat). */
  onClose: () => void;
  /** Dipanggil saat user memilih jalur di langkah terakhir. */
  onPickPath: (path: GuidePath) => void;
}

type Icon = React.ComponentType<{ className?: string }>;

interface Slide {
  id: string;
  label: string;
  title: string;
  body: string;
  icon: Icon;
  points?: { icon: Icon; title: string; text: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 'what',
    label: 'What is it?',
    title: 'What is SevnQuest?',
    body: 'A place to learn English, built like an adventure: from the alphabet up to CEFR level B2. You study material, answer questions, and earn EXP to level up your character. Every answer helps the app learn where you are strong and where you need practice.',
    icon: Compass,
  },
  {
    id: 'pillars',
    label: 'Three pillars',
    title: 'What do you learn?',
    body: 'Three main pillars that support each other: words need spelling, sentences need grammar, and reading and listening bring it together.',
    icon: Library,
    points: [
      { icon: BookOpen, title: 'Vocabulary', text: 'Words: meaning, pronunciation (IPA), part of speech and example sentences.' },
      { icon: Languages, title: 'Letters', text: 'The 52 capital and small letters: sound, stroke order and handwriting.' },
      { icon: Library, title: 'Grammar', text: 'Grammar points (tenses, conditionals, passive…) for building your own sentences.' },
    ],
  },
  {
    id: 'exp',
    label: 'Progress',
    title: 'How do you progress?',
    body: 'EXP is not just a click reward. It follows how well you know something.',
    icon: Flame,
    points: [
      { icon: BookOpen, title: '1. Study', text: 'Read the material in the Notebook or the Library.' },
      { icon: Flame, title: '2. Practise', text: 'Answer questions. Wrong answers are recorded too, so you know your weak spots.' },
      { icon: Repeat, title: '3. Mastery', text: 'Items you get right often gain mastery; weak ones come back in Recall.' },
      { icon: Compass, title: '4. EXP & level', text: 'EXP raises your level and your learning tier.' },
    ],
  },
  {
    id: 'path',
    label: 'Your path',
    title: 'Where should a beginner start?',
    body: 'Not sure where to begin? Start with the Alphabet Academy if you are still learning letters. Otherwise, pick the level that matches your English and work through it.',
    icon: Sprout,
    points: [
      { icon: Sprout, title: 'Brand new to English', text: 'Notebook → Alphabet Academy → Letters → A1.' },
      { icon: Library, title: 'Already know the alphabet', text: 'Library for vocabulary, letters and grammar at your level.' },
    ],
  },
  {
    id: 'next',
    label: 'Next step',
    title: 'What happens after a lesson?',
    body: 'You never have to guess. The home screen always shows the next step: Recall if something needs review, your next stage on the map, or your daily quests.',
    icon: Compass,
  },
];

export const StartGuideModal: React.FC<StartGuideModalProps> = ({
  isOpen, soundEnabled = true, onClose, onPickPath,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slide = SLIDES[index];
  const Icon = slide.icon;
  const isLast = index === SLIDES.length - 1;

  const go = (next: number) => {
    playSound('click', soundEnabled);
    setIndex(next);
  };

  const pick = (path: GuidePath) => {
    playSound('click', soundEnabled);
    onPickPath(path);
  };

  return (
    <div
      className="fixed inset-0 z-[9980] flex items-center justify-center p-4 bg-slate-950/85"
      role="dialog"
      aria-modal="true"
      aria-label="Panduan SevnQuest"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md panel panel-stitched p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <span className="breadcrumb-label text-gold-soft">
            {slide.label} · {index + 1}/{SLIDES.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
            title="Close"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 ui-icon-box rounded-xl text-gold shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading text-text-primary">{slide.title}</h3>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed font-body">{slide.body}</p>

            {slide.points && (
              <ul className="space-y-2">
                {slide.points.map(p => {
                  const PIcon = p.icon;
                  return (
                    <li
                      key={p.title}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-surface-inset border border-border-subtle shadow-inner"
                    >
                      <PIcon className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-heading text-text-primary">{p.title}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{p.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {isLast && (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                  Choose your path
                </p>
                <button type="button" onClick={() => pick('foundation')} className="btn-physical-primary w-full py-3 px-4 text-sm font-bold font-heading flex items-center justify-between">
                  <span className="flex items-center gap-2"><Sprout className="w-4 h-4" /> Start with the Alphabet Academy</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => pick('library')} className="btn-physical-secondary w-full py-3 px-4 text-sm font-bold font-heading flex items-center justify-between">
                  <span className="flex items-center gap-2"><Library className="w-4 h-4" /> Open Vocabulary, Letters & Grammar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => pick('world')} className="btn-physical-secondary w-full py-3 px-4 text-sm font-bold font-heading flex items-center justify-between">
                  <span className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> Jelajahi World</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-gold' : 'w-1.5 bg-border-subtle'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button type="button" onClick={() => go(index - 1)} className="btn-physical-secondary p-2 rounded-xl" aria-label="Back">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {!isLast && (
              <button type="button" onClick={() => go(index + 1)} className="btn-physical-primary py-2 px-4 text-xs font-bold font-heading flex items-center gap-1.5">
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
