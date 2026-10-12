import React from 'react';
import { Zap } from 'lucide-react';
import { UserDeck } from '../../types/rpg';
import { ItemMasteryRecord } from '../../types/content';
import { ArcadeHubView } from '../arcade/ArcadeHubView';

// English edition: the World tab hosts the Arena Arcade. The Japanese-only dungeon modes
// (grammar fusion, conjugation, sentence creation, text study, immersion) and the Castle Tower are not ported yet.
export type WorldNavView = 'world_hub' | 'dungeon' | 'arcade' | 'tower';

interface WorldViewProps {
  resetSignal?: number;
  playerLevel?: number;
  playerTierIndex?: number;
  soundEnabled?: boolean;
  navView?: WorldNavView;
  onNavViewChange?: (view: WorldNavView) => void;
  userDecks?: UserDeck[];
  onUpdateDecks?: (decks: UserDeck[]) => void;
  onNavigateTab?: (tab: 'home' | 'maps' | 'daily' | 'weekly' | 'leaderboard' | 'library' | 'deck' | 'settings') => void;
  onRewardPlayer?: (exp: number, gold: number) => void;
  /** Tower mastery hook (kept for the cloud/state contract; the tower is not active in this edition). */
  onTowerMastery?: (masteryGain: Record<string, number>) => void;
  onCompleteStudyItem?: (
    moduleId: 'bunpou' | 'kotoba' | 'kanji' | 'dokkai' | 'choukai' | 'boss' | 'questions' | 'tryOuts',
    expGained: number,
    goldGained: number,
    itemId?: string,
    score?: number,
    total?: number
  ) => void;
  itemMastery?: Record<string, ItemMasteryRecord>;
}

export const WorldView: React.FC<WorldViewProps> = ({
  soundEnabled = true,
  userDecks,
  onRewardPlayer,
  onCompleteStudyItem,
  playerLevel = 1,
  playerTierIndex = 0,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 sm:pb-12 animate-fade-in px-2 sm:px-0">
      {/* HEADER */}
      <div className="panel panel-stitched p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md border border-border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 border-border-subtle border flex items-center justify-center shrink-0 shadow-sm">
            <Zap className="w-6 h-6 fill-amber-400/20" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary font-heading tracking-wide">
              World · Arena Arcade
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary font-body">
              Test your writing speed and reflexes in the arcade games, and chase your best records.
            </p>
          </div>
        </div>
      </div>

      <ArcadeHubView
        soundEnabled={soundEnabled}
        userDecks={userDecks}
        playerLevel={playerLevel}
        playerTierIndex={playerTierIndex}
        onRewardPlayer={onRewardPlayer}
        onCompleteStudyItem={onCompleteStudyItem}
      />
    </div>
  );
};
