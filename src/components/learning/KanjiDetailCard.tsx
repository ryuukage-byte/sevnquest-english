import React, { useState, useEffect, useMemo } from 'react';
import { Edit3, Volume2, ArrowLeft, HelpCircle, Zap } from 'lucide-react';
import { KanjiItem, ItemMasteryRecord } from '../../types/content';
import { KanjiWritingCanvas, preloadStrokeData } from './KanjiWritingCanvas';
import { RubyText } from './RubyText';
import { getEnrichedKanjiRelatedWords } from '../../utils/kanjiVocabularyEnricher';
import { ErrorBoundary } from '../ErrorBoundary';
import { speakJapanese, playSound } from '../../utils/audio';
import { WritingRewardResult } from '../../utils/rewards';


export interface KanjiDetailCardProps {
  item: KanjiItem;
  masteryRecord?: ItemMasteryRecord;
  soundEnabled?: boolean;
  furiganaEnabled?: boolean;
  initialTab?: 'detail' | 'writing';
  onCompleteSheet?: (sheetNumber: number, score: number, reward?: WritingRewardResult) => void;
  onFinish?: (reward?: WritingRewardResult) => void;
  onBack?: () => void;
  backButtonLabel?: string;
  showQuestions?: boolean;
  onSelectKotoba?: (word: string) => void;
}

export const KanjiDetailCard: React.FC<KanjiDetailCardProps> = ({
  item,
  masteryRecord,
  soundEnabled = true,
  furiganaEnabled = true,
  initialTab = 'detail',
  onCompleteSheet,
  onFinish,
  onBack,
  backButtonLabel = 'Back to the letter list',
  showQuestions = true,
  onSelectKotoba,
}) => {
  const [detailSubTab, setDetailSubTab] = useState<'detail' | 'writing'>(initialTab);

  // Preload stroke data in the background immediately
  useEffect(() => {
    if (item?.character) {
      preloadStrokeData(item.character);
    }
  }, [item?.character]);

  const isHiragana = item.radical === 'Hiragana' || (item.jlpt === 'ALPHABET' && item.character >= 'ぁ' && item.character <= 'ん');
  const isKatakana = item.radical === 'Katakana' || (item.jlpt === 'ALPHABET' && item.character >= 'ァ' && item.character <= 'ン');
  const isKana = isHiragana || isKatakana;
  const isSuuji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '百', '千', '万', '零'].includes(item.character);
  const onyomiList = item.onyomi || [];
  const kunyomiList = item.kunyomi || [];
  const totalKanjiReadings = onyomiList.length + kunyomiList.length;
  const hasMultipleReadings = !isKana && totalKanjiReadings > 1;

  const enrichedRelatedWords = useMemo(() => {
    if (isKana || !item.character) {
      return item.relatedWords || [];
    }
    return getEnrichedKanjiRelatedWords(item.character, item.relatedWords, 8);
  }, [item.character, item.relatedWords, isKana]);

  const levelBadgeLabel = isHiragana
    ? 'Hiragana'
    : isKatakana
      ? 'Katakana'
      : isSuuji
        ? 'Angka / Sūji'
        : `${item.jlpt || 'A1'} letter`;

  const levelBadgeClass = isHiragana
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-border-subtle'
    : isKatakana
      ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-border-subtle'
      : isSuuji
        ? 'bg-indigo/15 text-indigo dark:text-indigo-soft border-border-subtle'
        : 'bg-surface-inset text-wine-accent border-border-subtle';

  return (
    <div className="space-y-4 w-full">
      {/* Navigation & Sub-tab Switcher */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {onBack ? (
          <button
            onClick={() => {
              onBack();
              playSound('click', soundEnabled);
            }}
            className="btn btn-pill text-xs gap-1.5"
          >
            <ArrowLeft className="w-4 h-4 text-wine-accent" />
            <span>{backButtonLabel}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${levelBadgeClass}`}>
              {levelBadgeLabel}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-surface-inset border border-border-subtle text-text-secondary">
              {item.strokeCount} strokes
            </span>
            {hasMultipleReadings && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border border-border-subtle text-red-700 dark:text-amber-400 bg-surface-inset shadow-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-red-700 dark:text-amber-400 fill-red-700/20 dark:fill-amber-400/25 shrink-0" />
                <span>{totalKanjiReadings} sounds &amp; words</span>
              </span>
            )}
            {masteryRecord && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-inset border border-border-subtle text-text-secondary">
                <span title="Writing practice">Written: {masteryRecord.writingCount || 0}x</span>
                <span className="opacity-40">|</span>
                <span title="Dilihat di flashcard">Kartu: {masteryRecord.flashcardCount || 0}x</span>
                <span className="opacity-40">|</span>
                <span className="text-gold" title="Mastery">Lv.{masteryRecord.masteryLevel || 1} ({masteryRecord.masteryPercentage || 0}%)</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setDetailSubTab('detail');
              playSound('click', soundEnabled);
            }}
            className={`btn btn-pill text-xs ${
              detailSubTab === 'detail'
                ? 'bg-surface-elevated text-wine-accent font-bold border border-border-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.2)]'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Details & meaning
          </button>
          <button
            onClick={() => {
              setDetailSubTab('writing');
              playSound('click', soundEnabled);
            }}
            className={`btn btn-pill text-xs flex items-center gap-1.5 ${
              detailSubTab === 'writing'
                ? 'bg-surface-elevated text-wine-accent font-bold border border-border-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_4px_rgba(0,0,0,0.2)]'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-wine-accent" />
            <span>Writing practice</span>
          </button>
        </div>
      </div>

      {detailSubTab === 'detail' ? (
        /* Kanji Detail View */
        <div className="panel panel-stitched p-6 space-y-6 shadow-xl">
          {/* Giant Character & Hero Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-border-subtle">
            {/* Giant Kanji Character Frame - Hanko Red stamp motif */}
            <div className="relative group w-32 h-32 rounded-3xl bg-surface-inset border border-border-subtle flex items-center justify-center text-7xl font-bold text-wine-accent font-jp shadow-inner shrink-0 select-none">
              {item.character}
              <button
                onClick={() => {
                  const readingToSpeak =
                    item.kunyomi?.[0]?.replace(/[.-]/g, '') || item.onyomi?.[0] || item.character;
                  speakJapanese(readingToSpeak);
                }}
                className="btn-physical-secondary absolute -bottom-2 -right-2 p-2.5 rounded-full hover:text-wine-accent transition-all"
                title="Hear the pronunciation"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono ${levelBadgeClass}`}>
                  {levelBadgeLabel}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-inset text-text-secondary border border-border-subtle text-xs font-mono">
                  {item.strokeCount} strokes
                </span>
                {item.radical && (
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-inset text-text-secondary border border-border-subtle text-xs font-jp">
                    {'Shape: '}{item.radical}
                  </span>
                )}
                {hasMultipleReadings && (
                  <span className="px-2.5 py-0.5 rounded-full border border-border-subtle text-red-700 dark:text-amber-400 bg-surface-inset text-xs font-mono font-bold flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-red-700 dark:text-amber-400 fill-red-700/20 dark:fill-amber-400/25 shrink-0" />
                    <span>{totalKanjiReadings} readings ({onyomiList.length} sound • {kunyomiList.length} example words)</span>
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold font-heading text-text-primary">
                {item.meaningId}
              </h3>
              {item.radicalName && (
                <p className="text-xs text-text-secondary">
                  Shape: {item.radicalName}
                </p>
              )}
            </div>
          </div>

          {/* Readings Section: Kana uses Romaji & Pronunciation, Kanji/Suuji uses Onyomi & Kunyomi */}
          {isKana ? (
            <div className="p-4 rounded-2xl bg-surface-inset border border-border-subtle space-y-2">
              <span className="text-[11px] font-bold text-wine-accent uppercase tracking-wider font-mono">
                Sound (IPA)
              </span>
              <div className="flex items-center gap-3 pt-1">
                <div className="text-xl font-bold text-text-primary font-mono px-3 py-1 rounded-xl bg-surface-card border border-border-subtle">
                  {item.kunyomi?.[0] || item.onyomi?.[0] || item.character}
                </div>
                <button
                  onClick={() => speakJapanese(item.character)}
                  className="btn-physical-secondary px-3 py-1.5 rounded-xl text-wine-accent font-bold flex items-center gap-2 transition-colors text-xs font-mono"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play sound</span>
                </button>
                <span className="text-xs text-text-secondary">
                  {isHiragana ? 'Aksara Fonetik Hiragana (Seion)' : 'Aksara Fonetik Katakana (Seion)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Onyomi */}
                <div className="p-4 rounded-2xl bg-surface-inset border border-border-subtle space-y-1">
                  <span className="text-[11px] font-bold text-wine-accent uppercase tracking-wider font-mono">
                    Sound (letter name)
                  </span>
                  <div className="text-base font-bold text-text-primary font-mono flex flex-wrap gap-2 pt-1">
                    {(item.onyomi || []).length > 0 ? (
                      item.onyomi.map((on, i) => (
                        <button
                          key={i}
                          onClick={() => speakJapanese(on.split(' ')[0])}
                          className="px-2.5 py-1 rounded-lg bg-surface-card text-wine-accent border border-border-subtle font-bold hover:border-border-primary flex items-center gap-1.5 transition-colors text-xs font-jp"
                          title="Tap to hear"
                        >
                          <span>{on}</span>
                          <Volume2 className="w-3 h-3 text-wine-accent/60" />
                        </button>
                      ))
                    ) : (
                      <span className="text-text-muted text-xs italic">-</span>
                    )}
                  </div>
                </div>

                {/* Kunyomi */}
                <div className="p-4 rounded-2xl bg-surface-inset border border-border-subtle space-y-1">
                  <span className="text-[11px] font-bold text-state-success uppercase tracking-wider font-mono">
                    Example words
                  </span>
                  <div className="text-base font-bold text-text-primary font-mono flex flex-wrap gap-2 pt-1">
                    {(item.kunyomi || []).length > 0 ? (
                      item.kunyomi.map((kun, i) => (
                        <button
                          key={i}
                          onClick={() => speakJapanese(kun.split(' ')[0].replace(/[.-]/g, ''))}
                          className="px-2.5 py-1 rounded-lg bg-surface-card text-state-success border border-border-subtle font-bold hover:border-border-primary flex items-center gap-1.5 transition-colors text-xs font-jp"
                          title="Tap to hear"
                        >
                          <span>{kun}</span>
                          <Volume2 className="w-3 h-3 text-state-success/60" />
                        </button>
                      ))
                    ) : (
                      <span className="text-text-muted text-xs italic">-</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tips Edukasi Cara Baca Kanji */}
              {hasMultipleReadings && (
                <div className="p-3.5 rounded-2xl bg-surface-inset border border-border-subtle space-y-1.5 text-xs text-left shadow-inner">
                  <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-amber-400 font-heading text-[11.5px]">
                    <HelpCircle className="w-3.5 h-3.5 text-red-700 dark:text-amber-400 shrink-0" />
                    <span>SOUND TIPS ({totalKanjiReadings} READINGS):</span>
                  </div>
                  <p className="text-[11.5px] text-text-secondary leading-relaxed">
                    This letter has <strong>{totalKanjiReadings} readings</strong> ({onyomiList.length} sound &amp; {kunyomiList.length} example words). <em>Learn each example word on its own, in context!</em>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-secondary space-y-0.5">
                      <span className="font-bold text-wine-accent flex items-center gap-1 font-mono">
                        <span>♪</span> Letter name:
                      </span>
                      <p className="text-[10.5px]">Used when the letter appears inside a word, as in most English spelling.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-card border border-border-subtle text-text-secondary space-y-0.5">
                      <span className="font-bold text-state-success flex items-center gap-1 font-mono">
                        <span>✎</span> Example words:
                      </span>
                      <p className="text-[10.5px]">Used for example words where the letter stands out in the word.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Vocabulary Words */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
              <span>{`Words containing the letter 「${item.character}」`}</span>
            </div>
            {enrichedRelatedWords && enrichedRelatedWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {enrichedRelatedWords.map((rw, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (onSelectKotoba) {
                        playSound('click', soundEnabled);
                        onSelectKotoba(rw.word);
                      }
                    }}
                    className={`p-3 rounded-2xl bg-surface-inset border border-border-subtle flex items-center justify-between gap-2 transition-all ${
                      onSelectKotoba
                        ? 'cursor-pointer hover:border-border-primary hover:bg-surface-elevated active:scale-[0.99] group/rw'
                        : 'hover:border-border-muted'
                    }`}
                    title={onSelectKotoba ? `View the word 「${rw.word}」 in the library` : undefined}
                  >
                    <div>
                      {furiganaEnabled ? (
                        <p className={`text-base font-bold text-text-primary ${onSelectKotoba ? 'group-hover/rw:text-wine-accent transition-colors' : ''}`}>
                          <RubyText
                            japanese={rw.word}
                            reading={rw.reading}
                            showFurigana={furiganaEnabled}
                            highlightKanji={item.character}
                          />
                        </p>
                      ) : (
                        <>
                          <p className="text-[11px] text-wine-accent font-mono">{rw.reading}</p>
                          <p className={`text-base font-bold text-text-primary font-jp ${onSelectKotoba ? 'group-hover/rw:text-wine-accent transition-colors' : ''}`}>{rw.word}</p>
                        </>
                      )}
                      <p className="text-xs text-text-secondary mt-0.5">{rw.meaningId}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(rw.reading || rw.word);
                      }}
                      className="btn-physical-secondary p-2 rounded-xl text-wine-accent transition-colors shrink-0"
                      title="Hear the pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-inset border border-border-subtle text-xs text-text-secondary text-center">
                This letter focuses on its shape, stroke order and basic sound.
              </div>
            )}
          </div>

          {/* Attached Practice Questions */}
          {showQuestions && item.questions && item.questions.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase font-mono">
                <HelpCircle className="w-3.5 h-3.5 text-text-muted" />
                <span>{`Example question for 「${item.character}」`} ({item.questions.length} Soal)</span>
              </div>
              <div className="space-y-2">
                {item.questions.slice(0, 3).map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-surface-card border border-border-subtle space-y-1.5 text-xs"
                  >
                    <p className="font-medium text-text-primary">{q.prompt}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <span
                          key={oIdx}
                          className={`px-2 py-0.5 rounded-md font-jp text-[11px] ${
                            oIdx === q.correctIndex
                              ? 'bg-surface-inset border border-border-subtle text-text-primary font-bold'
                              : 'bg-surface-inset text-text-muted opacity-75'
                          }`}
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Switch to Writing Practice CTA */}
          <button
            onClick={() => {
              setDetailSubTab('writing');
              playSound('click', soundEnabled);
            }}
            className="w-full py-3.5 rounded-2xl btn-cta font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Open the writing canvas</span>
          </button>
        </div>
      ) : (
        /* Kanji Writing Practice Canvas */
        <div className="panel panel-stitched p-5 sm:p-6 space-y-4 text-center">
          <ErrorBoundary>
            <KanjiWritingCanvas
              kanjiChar={item.character}
              totalSheets={1}
              strokeCount={item.strokeCount}
              meaning={item.meaningId}
              kunyomi={item.kunyomi}
              onyomi={item.onyomi}
              relatedWords={enrichedRelatedWords}
              soundEnabled={soundEnabled}
              level={item.jlpt}
              nextButtonLabel="Back to letter details"
              onCancel={() => setDetailSubTab('detail')}
              onCompleteSheet={onCompleteSheet}
              onFinish={(reward) => {
                onFinish?.(reward);
                setDetailSubTab('detail');
              }}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};
