import { TierInfo } from '../../types/rpg';

export const RPG_TIERS: TierInfo[] = [
  {
    tier: 1,
    name: 'Villager (A1)',
    titleName: 'Peasant Explorer (A1)',
    description: 'Beginner adventurer clothes, ready for the first steps of the A1 curriculum.',
    visualAssetDesc: 'Simple linen tunic, wooden walking stick, humble starting adventurer.',
    baseColor: 'to-stone-600',
    glowColor: 'shadow-slate-800/40',
    requiredExpTotal: 0,
    perks: 'Fondasi dasar bahasa Jepang. Regenerasi stamina standar.',
    iconName: 'User'
  },
  {
    tier: 2,
    name: 'Novice (A1)',
    titleName: 'Novice Adventurer (A1)',
    description: 'Simple leather armour and a headband, worn by A1 graduates.',
    visualAssetDesc: 'Sturdy leather armor, reinforced boots, bronze buckle, small dagger.',
    baseColor: 'to-teal-800',
    glowColor: 'shadow-emerald-500/30',
    requiredExpTotal: 1200,
    perks: '+5% Gold bonus from quizzes. Unlocks Flashcard speed mode.',
    iconName: 'Shield'
  },
  {
    tier: 3,
    name: 'Apprentice (A2)',
    titleName: 'Iron Apprentice (A2)',
    description: 'Carrying an iron sword and a sturdy wooden shield, crossing the Adventurer Valley (A2).',
    visualAssetDesc: 'Hardened iron short sword, carved wooden round shield, padded gambeson.',
    baseColor: 'to-cyan-800',
    glowColor: 'shadow-blue-500/30',
    requiredExpTotal: 4000,
    perks: '+10% EXP on letter practice. 50/50 quiz hint unlocked.',
    iconName: 'Sword'
  },
  {
    tier: 4,
    name: 'Squire (A2)',
    titleName: 'Valiant Squire (A2)',
    description: 'Chainmail and a steel sword that begin to shine through the A2 exams.',
    visualAssetDesc: 'Polished steel chainmail, steel broadsword with faint glow, heraldic crest.',
    baseColor: 'to-blue-800',
    glowColor: 'shadow-blue-500/40',
    requiredExpTotal: 10000,
    perks: '+10 Max MP. Kontrol kecepatan audio Choukai terbuka.',
    iconName: 'Zap'
  },
  {
    tier: 5,
    name: 'Knight (B1)',
    titleName: 'Honorable Knight (B1)',
    description: 'Armor besi penuh (full plate), memancarkan aura ketekunan mengarungi Kurikulum Soumatome B1.',
    visualAssetDesc: 'Full steel plate armor, visor helmet with plume, glowing knight blade.',
    baseColor: 'to-purple-900',
    glowColor: 'shadow-purple-500/40',
    requiredExpTotal: 22000,
    perks: '+15% boss battle damage. +20% EXP bonus on daily quests.',
    iconName: 'Award'
  },
  {
    tier: 6,
    name: 'Elite Knight (B1)',
    titleName: 'Royal Elite Knight (B1)',
    description: 'Wearing a noble cloak and a pure sword, mastering all of the B1 curriculum.',
    visualAssetDesc: 'Royal velvet cape with gold trims, engraved runic plate, luminous longsword.',
    baseColor: 'to-red-800',
    glowColor: 'shadow-rose-500/50',
    requiredExpTotal: 45000,
    perks: '+1 Perisai Pembeku Streak harian. +25% Gold dari Dokkai.',
    iconName: 'Crown'
  },
  {
    tier: 7,
    name: 'Paladin (B2)',
    titleName: 'Grand Paladin Master (B2)',
    description: 'Armor emas perak mewah, tameng suci penjaga ilmu wacana tinggi Ranah B2.',
    visualAssetDesc: 'Gilded gold-and-silver heavy armor, radiant holy shield, sun-etched claymore.',
    baseColor: 'to-amber-600',
    glowColor: 'shadow-amber-400/50',
    requiredExpTotal: 80000,
    perks: '+20% Critical Study EXP boost. Gratis 1 MP Potion setiap login harian.',
    iconName: 'Sun'
  },
  {
    tier: 8,
    name: 'Hero (B2)',
    titleName: 'Legendary Hero (B2)',
    description: 'Aura kosmik berputar di tubuh, menggenggam pusaka legendaris penguasa B2.',
    visualAssetDesc: 'Cosmic glowing energy aura, floating celestial relic, legendary glowing excalibur.',
    baseColor: 'to-indigo-900',
    glowColor: 'shadow-sky-400/60',
    requiredExpTotal: 135000,
    perks: 'Unlimited letter practice sheets with automatic checking. +30% all EXP.',
    iconName: 'Flame'
  },
  {
    tier: 9,
    name: 'Champion (C1)',
    titleName: 'Elemental Champion (C1)',
    description: 'Floating in the air with lightning and holy fire, reaching the hardest peak (C1).',
    visualAssetDesc: 'Levitating avatar, elemental vortex of thunder & flames, divine twin blades.',
    baseColor: 'to-purple-800',
    glowColor: 'shadow-fuchsia-500/60',
    requiredExpTotal: 210000,
    perks: 'Kemampuan Super Boss Slayer: Kerusakan 2x lipat terhadap semua Stage Boss.',
    iconName: 'Swords'
  },
  {
    tier: 10,
    name: 'Mythic Deity (C1)',
    titleName: 'Mythic Deity of Knowledge (C1)',
    description: 'The true peak of a learner, radiating wisdom and full mastery of English (A1 to C1).',
    visualAssetDesc: 'Transcendent deity form, luminous halo crown, 6 wings of pure radiant light.',
    baseColor: 'to-amber-500',
    glowColor: 'shadow-amber-300/80',
    requiredExpTotal: 320000,
    perks: 'Penguasaan Penuh Seluruh Kurikulum Jepang (A1-C1). RPG Stats & Study Boost Maksimal.',
    iconName: 'Star'
  }
];

export function calculateMaxHp(level: number, vit: number): number {
  return 100 + (level * 10) + (vit * 15);
}

export function calculateMaxMp(level: number, int: number): number {
  return 40 + (level * 5) + (int * 8);
}

export function calculateLevelFromExp(totalExp: number): number {
  const safeExp = Math.max(0, totalExp);
  const calculated = Math.floor((-1 + Math.sqrt(9 + 0.16 * safeExp)) / 2);
  return Math.max(1, calculated);
}

export function getLevelInfo(totalExp: number): {
  level: number;
  currentLevelExp: number;
  expNeededForNextLevel: number;
  progressPercent: number;
  currentLevelStartExp: number;
  nextLevelStartExp: number;
} {
  const safeExp = Math.max(0, totalExp);
  const level = calculateLevelFromExp(safeExp);

  // Total exp needed to start this level
  const currentLevelStartExp = 25 * level * level + 25 * level - 50;
  // Total exp needed to reach next level
  const nextLevelStartExp = 25 * (level + 1) * (level + 1) + 25 * (level + 1) - 50;

  const currentLevelExp = safeExp - currentLevelStartExp;
  const expNeededForNextLevel = nextLevelStartExp - currentLevelStartExp;
  const progressPercent = Math.min(100, Math.max(0, (currentLevelExp / expNeededForNextLevel) * 100));

  return {
    level,
    currentLevelExp,
    expNeededForNextLevel,
    progressPercent,
    currentLevelStartExp,
    nextLevelStartExp
  };
}

interface TierGateRequirement {
  requiredWorldId: string;
  requiredWorldName: string;
  requiredJlpt: string;
  minStageCompletionPct: number; // 77
}

const TIER_GATE_REQUIREMENTS: Record<number, TierGateRequirement> = {
  2: { // Entering Tier 3 (Apprentice - A2)
    requiredWorldId: 'world_a1',
    requiredWorldName: 'World A1 (Dunia Permulaan)',
    requiredJlpt: 'A1',
    minStageCompletionPct: 77
  },
  4: { // Entering Tier 5 (Knight - B1)
    requiredWorldId: 'world_a2',
    requiredWorldName: 'World A2 (Langkah Petualang)',
    requiredJlpt: 'A2',
    minStageCompletionPct: 77
  },
  6: { // Entering Tier 7 (Paladin - B2)
    requiredWorldId: 'world_b1',
    requiredWorldName: 'World B1 (Peta Soumatome B1)',
    requiredJlpt: 'B1',
    minStageCompletionPct: 77
  },
  8: { // Entering Tier 9 (Champion - C1)
    requiredWorldId: 'world_b2',
    requiredWorldName: 'World B2 (Ranah Mahir)',
    requiredJlpt: 'B2',
    minStageCompletionPct: 77
  }
};

export interface TierGateCheckResult {
  isGated: boolean;
  effectiveTierIndex: number;
  potentialTierIndex: number;
  gatedReason?: string;
  gateRequirement?: TierGateRequirement;
  worldClearedCount?: number;
  worldTotalCount?: number;
  currentPercentage?: number;
}

function checkTierGate(
  potentialTierIndex: number,
  _stageProgress: Record<string, import('../../types/rpg').StageClearData> = {},
  _worldStagesMap: Record<string, string[]> = {}
): TierGateCheckResult {
  return {
    isGated: false,
    effectiveTierIndex: potentialTierIndex,
    potentialTierIndex
  };
}

export function getTierForExp(
  totalExp: number,
  stageProgress?: Record<string, import('../../types/rpg').StageClearData>,
  worldStagesMap?: Record<string, string[]>
): {
  tierIndex: number;
  potentialTierIndex: number;
  isGated: boolean;
  gateResult?: TierGateCheckResult;
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  expInCurrentTier: number;
  expForNextTier: number;
  progressPercent: number;
  remainingExpToNextTier: number;
} {
  const safeExp = Math.max(0, totalExp);
  let potentialTierIndex = 0;
  for (let i = RPG_TIERS.length - 1; i >= 0; i--) {
    if (safeExp >= RPG_TIERS[i].requiredExpTotal) {
      potentialTierIndex = i;
      break;
    }
  }

  let tierIndex = potentialTierIndex;
  let gateResult: TierGateCheckResult = { isGated: false, effectiveTierIndex: potentialTierIndex, potentialTierIndex };

  if (stageProgress && worldStagesMap) {
    gateResult = checkTierGate(potentialTierIndex, stageProgress, worldStagesMap);
    tierIndex = gateResult.effectiveTierIndex;
  }

  const currentTier = RPG_TIERS[tierIndex];
  const nextTier = tierIndex < RPG_TIERS.length - 1 ? RPG_TIERS[tierIndex + 1] : null;

  if (!nextTier) {
    return {
      tierIndex,
      potentialTierIndex,
      isGated: gateResult.isGated,
      gateResult,
      currentTier,
      nextTier: null,
      expInCurrentTier: safeExp - currentTier.requiredExpTotal,
      expForNextTier: 0,
      progressPercent: 100,
      remainingExpToNextTier: 0
    };
  }

  const expInCurrentTier = safeExp - currentTier.requiredExpTotal;
  const expForNextTier = nextTier.requiredExpTotal - currentTier.requiredExpTotal;
  const progressPercent = Math.min(100, Math.max(0, (expInCurrentTier / expForNextTier) * 100));
  const remainingExpToNextTier = Math.max(0, nextTier.requiredExpTotal - safeExp);

  return {
    tierIndex,
    potentialTierIndex,
    isGated: gateResult.isGated,
    gateResult,
    currentTier,
    nextTier,
    expInCurrentTier,
    expForNextTier,
    progressPercent,
    remainingExpToNextTier
  };
}

/** Poin atribut (STR/AGI/INT/VIT) yang didapat setiap naik 1 level. */
export const ATTRIBUTE_POINTS_PER_LEVEL = 3;
