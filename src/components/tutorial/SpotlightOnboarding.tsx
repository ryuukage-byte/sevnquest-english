import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Swords, 
  Compass, 
  BookOpen, 
  Bookmark, 
  Scroll, 
  Trophy, 
  Cloud, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { playSound } from '../../utils/audio';

export interface SpotlightOnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onOpenAuth: () => void;
  soundEnabled?: boolean;
}

interface TourStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetSelector: string | null;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  highlightPadding?: number;
  highlightRadius?: number;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'hero',
    title: 'Your character & status',
    subtitle: 'Your hero sanctuary',
    description: 'This is your hero status panel! Your total EXP, level, HP and MP grow as you study and finish English lessons.',
    targetSelector: '[data-tour="hero-card"]',
    icon: Swords,
    accentColor: 'text-gold',
    highlightPadding: 10,
    highlightRadius: 20,
    tip: 'Tap your character at any time to spend stat points (STR, AGI, INT, VIT)!'
  },
  {
    id: 'maps',
    title: 'World',
    subtitle: 'Arena Arcade games',
    description: 'Enter World to play the Arena Arcade games. Test your spelling, vocabulary and reflexes, and chase your best records.',
    targetSelector: '[data-tour="nav-maps"]',
    icon: Compass,
    accentColor: 'text-emerald-400',
    highlightPadding: 8,
    highlightRadius: 16,
    tip: 'Pick the game that suits your mood!'
  },
  {
    id: 'library',
    title: 'Library',
    subtitle: 'Dictionary & grammar',
    description: 'A full dictionary of vocabulary (A1–B2), a letter library, grammar points and the question bank, with search and level filters.',
    targetSelector: '[data-tour="nav-library"]',
    icon: BookOpen,
    accentColor: 'text-sky-400',
    highlightPadding: 8,
    highlightRadius: 16,
    tip: 'Search by word, meaning or example to find things quickly.'
  },
  {
    id: 'deck',
    title: 'Bookshelf (Curriculum & Notebook)',
    subtitle: 'Curriculum books & study decks',
    description: 'Open the Notebook to browse the official level books (A1–B2) or manage your own decks for flashcards and writing practice.',
    targetSelector: '[data-tour="nav-deck"]',
    icon: Bookmark,
    accentColor: 'text-amber-400',
    highlightPadding: 8,
    highlightRadius: 16,
    tip: 'Make custom decks such as "B1 exam prep" or "Travel phrases".'
  },
  {
    id: 'daily',
    title: 'Quests & streaks',
    subtitle: 'Daily & weekly quests',
    description: 'Finish quests every day to earn Gold and extra EXP, and keep your study streak going.',
    targetSelector: '[data-tour="nav-daily"]',
    icon: Scroll,
    accentColor: 'text-indigo-400',
    highlightPadding: 8,
    highlightRadius: 16,
    tip: 'Reset harian terjadi setiap tengah malam waktu lokalmu.'
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard (Rank)',
    subtitle: 'Kompetisi Global Petualang',
    description: 'Compare your EXP with other learners on the weekly and all-time leaderboards!',
    targetSelector: '[data-tour="nav-leaderboard"]',
    icon: Trophy,
    accentColor: 'text-amber-300',
    highlightPadding: 8,
    highlightRadius: 16,
    tip: 'Climb the ranks by studying every day and beating the arcade games.'
  },
  {
    id: 'cloud_cta',
    title: 'Save your adventure',
    subtitle: 'Cloud save',
    description: 'Your learning journey is valuable. Log in or create an account now, so your EXP, character level and progress are kept safe.',
    targetSelector: null, // Modal Center
    icon: Cloud,
    accentColor: 'text-gold',
    highlightPadding: 0,
    highlightRadius: 24,
    tip: 'You can log in with Google or email. Your progress is kept when you switch devices!'
  }
];

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

interface TooltipLayout {
  placement: 'below' | 'above' | 'right';
  style: React.CSSProperties;
  arrowStyle: string;
}

export const SpotlightOnboarding: React.FC<SpotlightOnboardingProps> = ({
  isOpen,
  onComplete,
  onOpenAuth,
  soundEnabled = true,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<ElementRect | null>(null);

  const currentStep = useMemo(() => TOUR_STEPS[currentStepIndex], [currentStepIndex]);
  const isFinalStep = currentStepIndex === TOUR_STEPS.length - 1;

  // Measure target bounding rect
  const updateRect = useCallback(() => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      // If hero card, ensure top of page is visible so space below is maximized
      if (currentStep.id === 'hero') {
        if (typeof window !== 'undefined' && window.scrollY > 0) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        const rect = element.getBoundingClientRect();
        const inViewport = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );

        if (!inViewport) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      const updated = element.getBoundingClientRect();
      setTargetRect({
        top: updated.top,
        left: updated.left,
        width: updated.width,
        height: updated.height,
        bottom: updated.bottom,
        right: updated.right,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    // Initial measure with slight delay for view stability
    const timer = setTimeout(updateRect, 50);

    const handleResizeOrScroll = () => {
      updateRect();
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, updateRect, currentStepIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (!isFinalStep) {
          handleNext();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handlePrev();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, isFinalStep]);

  const handleNext = () => {
    playSound('click', soundEnabled);
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    playSound('click', soundEnabled);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    playSound('click', soundEnabled);
    onComplete();
  };

  const handleFinish = () => {
    playSound('level_up', soundEnabled);
    onComplete();
  };

  const handleAuthCTA = () => {
    playSound('click', soundEnabled);
    onComplete();
    onOpenAuth();
  };

  // Dynamic layout calculation to GUARANTEE the tooltip NEVER covers the highlighted target
  const tooltipLayout = useMemo<TooltipLayout | null>(() => {
    if (!targetRect) return null;

    const padding = currentStep.highlightPadding ?? 8;
    const tTop = Math.max(0, targetRect.top - padding);
    const tBottom = Math.min(window.innerHeight, targetRect.bottom + padding);
    const tLeft = Math.max(0, targetRect.left - padding);
    const tRight = Math.min(window.innerWidth, targetRect.right + padding);

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const spaceBelow = winHeight - tBottom;
    const spaceAbove = tTop;
    const spaceRight = winWidth - tRight;

    // 1. Desktop Left Sidebar Navigation target (e.g. World, Library, Deck, Daily, Rank on md: screens)
    if (winWidth >= 768 && tLeft < 140 && spaceRight >= 360) {
      const targetCenterY = (tTop + tBottom) / 2;
      const idealTop = targetCenterY - 110;
      const clampedTop = Math.max(16, Math.min(winHeight - 260, idealTop));

      return {
        placement: 'right',
        style: {
          position: 'fixed',
          left: `${tRight + 18}px`,
          top: `${clampedTop}px`,
          width: 'min(380px, calc(100vw - 32px))',
          maxHeight: `${winHeight - 32}px`,
        },
        arrowStyle: 'absolute -left-1.5 top-8 w-3.5 h-3.5 rotate-45 bg-surface-card border-b border-l border-border-subtle shadow-sm'
      };
    }

    // 2. Horizontal placement: center aligned relative to the screen
    const cardMaxWidth = 440;
    const horizontalStyle: React.CSSProperties = {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      width: `min(${cardMaxWidth}px, calc(100vw - 32px))`,
    };

    // 3. Vertical placement: Choose below or above, GUARANTEEING zero overlap
    // If space below is at least 210px, or space below is greater than space above:
    if (spaceBelow >= 210 || spaceBelow >= spaceAbove) {
      return {
        placement: 'below',
        style: {
          ...horizontalStyle,
          top: `${tBottom + 16}px`,
          bottom: 'auto',
          maxHeight: `${Math.max(160, spaceBelow - 24)}px`,
        },
        arrowStyle: 'absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-surface-card border-t border-l border-border-subtle shadow-sm'
      };
    } else {
      return {
        placement: 'above',
        style: {
          ...horizontalStyle,
          bottom: `${(winHeight - tTop) + 16}px`,
          top: 'auto',
          maxHeight: `${Math.max(160, spaceAbove - 24)}px`,
        },
        arrowStyle: 'absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-surface-card border-b border-r border-border-subtle shadow-sm'
      };
    }
  }, [targetRect, currentStep]);

  if (!isOpen) return null;

  const padding = currentStep.highlightPadding ?? 8;
  const radius = currentStep.highlightRadius ?? 16;
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden select-none">
      {/* 1. Backdrop overlay with cut-out spotlight */}
      {targetRect && (
        <motion.div
          key={`spotlight-${currentStep.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: Math.max(0, targetRect.top - padding),
            left: Math.max(0, targetRect.left - padding),
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            borderRadius: radius,
            boxShadow: '0 0 0 9999px rgba(8, 12, 24, 0.84)',
            zIndex: 9992,
          }}
        >
          {/* Cincin sorot (tanpa glow neon) */}
          <div 
            className="absolute -inset-1 rounded-[inherit] border-2 border-border-subtle pointer-events-none animate-pulse"
          />
        </motion.div>
      )}

      {/* When no target or final center modal, show dark translucent backdrop */}
      {!targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/85 z-[9991]"
          onClick={handleSkip}
        />
      )}

      {/* Transparent Click-catcher to prevent accidental UI interaction behind */}
      <div 
        className="fixed inset-0 z-[9993] bg-transparent"
        onClick={(e) => {
          e.stopPropagation();
        }}
      />

      {/* 2. Tooltip / Modal Card (Interactive layer) */}
      <AnimatePresence mode="wait">
        {/* FINAL STEP: Cloud Save CTA Center Modal */}
        {isFinalStep ? (
          <div className="fixed inset-0 z-[9995] pointer-events-auto flex items-center justify-center p-4">
            <motion.div
              key="final-cta"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md panel panel-stitched p-6 sm:p-7 shadow-md border border-border-subtle text-center space-y-4 relative overflow-hidden bg-surface-card"
            >

              {/* Top Badge & Close button */}
              <div className="flex items-center justify-between relative z-10">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-inset border border-border-subtle text-gold text-[11px] font-bold tracking-wider font-mono">
                  LANGKAH TERAKHIR
                </span>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-inset transition-colors"
                  title="Lewati"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Hero Icon */}
              <div className="flex justify-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-surface-inset border border-border-subtle flex items-center justify-center text-gold shadow-inner relative">
                  <Cloud className="w-8 h-8 animate-pulse text-gold" />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-state-success text-white shadow">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Texts */}
              <div className="space-y-1 relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-text-primary">
                  {currentStep.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed px-1">
                  {currentStep.description}
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left text-xs bg-surface-inset/70 p-3 rounded-xl border border-border-subtle relative z-10">
                <div className="flex items-center gap-2 text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sinkronisasi otomatis</span>
                </div>
                <div className="flex items-center gap-2 text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Leaderboard global</span>
                </div>
                <div className="flex items-center gap-2 text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bebas ganti HP/Laptop</span>
                </div>
                <div className="flex items-center gap-2 text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Gratis & Aman</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 relative z-10">
                <button
                  type="button"
                  onClick={handleAuthCTA}
                  className="btn-physical-primary w-full py-3 px-4 rounded-xl font-heading font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <Swords className="w-4 h-4 fill-current" />
                  <span>Log in / sign up now</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-inset transition-colors"
                >
                  Later, I want to explore now
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* STANDARD STEP TOOLTIP: Non-overlapping positioning */
          tooltipLayout && (
            <div 
              style={tooltipLayout.style}
              className="z-[9995] pointer-events-auto transition-all duration-200"
            >
              <motion.div
                key={`step-${currentStep.id}`}
                initial={{ 
                  opacity: 0, 
                  y: tooltipLayout.placement === 'below' ? 12 : tooltipLayout.placement === 'above' ? -12 : 0,
                  x: tooltipLayout.placement === 'right' ? 12 : 0,
                  scale: 0.97 
                }}
                animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="panel panel-stitched p-4 sm:p-5 shadow-2xl border border-border-subtle space-y-3 bg-surface-card relative overflow-visible flex flex-col"
              >
                {/* Visual Arrow Pointer pointing directly at the target */}
                <div className={tooltipLayout.arrowStyle} />

                {/* Top header row */}
                <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-surface-inset border border-border-subtle flex items-center justify-center shrink-0">
                      <StepIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${currentStep.accentColor}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary block">
                        {currentStep.subtitle}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold font-heading text-text-primary truncate">
                        {currentStep.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-[11px] font-medium text-text-muted hover:text-gold transition-colors shrink-0 px-2 py-1 rounded hover:bg-surface-inset"
                  >
                    Lewati
                  </button>
                </div>

                {/* Description & Tip with auto-scroll container if screen is compact */}
                <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1">
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-body">
                    {currentStep.description}
                  </p>

                  {/* Pro-Tip Pill if available */}
                  {currentStep.tip && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-surface-inset/80 border border-border-subtle/80 text-[11px] text-text-muted">
                      <Bookmark className="w-3.5 h-3.5 text-indigo shrink-0 mt-0.5" />
                      <span>{currentStep.tip}</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 gap-2 border-t border-border-subtle/60">
                  {/* Step dots */}
                  <div className="flex items-center gap-1.5">
                    {TOUR_STEPS.map((step, idx) => (
                      <span
                        key={step.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentStepIndex
                            ? 'w-5 bg-gold'
                            : idx < currentStepIndex
                            ? 'w-1.5 bg-gold/40'
                            : 'w-1.5 bg-border-subtle'
                        }`}
                      />
                    ))}
                    <span className="text-[10px] font-mono font-bold text-text-secondary ml-1">
                      {currentStepIndex + 1}/{TOUR_STEPS.length}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {currentStepIndex > 0 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="btn-physical-secondary p-1.5 sm:p-2 rounded-xl transition-all text-xs flex items-center justify-center"
                        title="Back"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-physical-primary py-1.5 sm:py-2 px-3 sm:px-3.5 rounded-xl font-heading font-bold text-xs tracking-wide transition-all flex items-center gap-1.5"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )
        )}
      </AnimatePresence>
    </div>
  );
};
