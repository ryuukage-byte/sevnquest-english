import { Mission } from '../../types/rpg';

export const INITIAL_DAILY_MISSIONS: Mission[] = [
  {
    id: 'dm_01',
    title: 'Penguasaan Bunpou',
    description: 'Finish 1 grammar practice session today.',
    progress: 0,
    target: 1,
    rewardExp: 80,
    rewardGold: 60,
    completed: false,
    claimed: false,
    type: 'daily',
    category: 'bunpou'
  },
  {
    id: 'dm_02',
    title: 'Vocabulary hunter',
    description: 'Open or memorise 5 new vocabulary cards in Flashcards.',
    progress: 0,
    target: 5,
    rewardExp: 75,
    rewardGold: 50,
    completed: false,
    claimed: false,
    type: 'daily',
    category: 'kotoba'
  },
  {
    id: 'dm_03',
    title: 'Perfect strokes',
    description: 'Latih menulis 3 lembar kanji pada kanvas penulisan.',
    progress: 0,
    target: 3,
    rewardExp: 100,
    rewardGold: 70,
    completed: false,
    claimed: false,
    type: 'daily',
    category: 'kanji'
  },
  {
    id: 'dm_04',
    title: 'Telinga Emas Choukai',
    description: 'Listen to 1 dialogue and answer its questions.',
    progress: 0,
    target: 1,
    rewardExp: 90,
    rewardGold: 60,
    completed: false,
    claimed: false,
    type: 'daily',
    category: 'choukai'
  },
  {
    id: 'dm_05',
    title: 'Quick quiz, no mistakes',
    description: 'Answer 5 quiz questions correctly in a row.',
    progress: 0,
    target: 5,
    rewardExp: 120,
    rewardGold: 100,
    completed: false,
    claimed: false,
    type: 'daily',
    category: 'general'
  }
];

export const INITIAL_WEEKLY_MISSIONS: Mission[] = [
  {
    id: 'wm_01',
    title: 'Penjelajah Dunia (Weekly)',
    description: 'Taklukkan minimal 5 Stage di peta perjalanan.',
    progress: 1,
    target: 5,
    rewardExp: 400,
    rewardGold: 350,
    completed: false,
    claimed: false,
    type: 'weekly',
    category: 'general'
  },
  {
    id: 'wm_02',
    title: 'Disiplin Samurai 5 Hari',
    description: 'Keep your daily study streak going for 5 days in a row.',
    progress: 1,
    target: 5,
    rewardExp: 500,
    rewardGold: 450,
    completed: false,
    claimed: false,
    type: 'weekly',
    category: 'streak'
  },
  {
    id: 'wm_03',
    title: 'Master Pembaca Dokkai',
    description: 'Finish 3 reading passages with a perfect score.',
    progress: 0,
    target: 3,
    rewardExp: 450,
    rewardGold: 400,
    completed: false,
    claimed: false,
    type: 'weekly',
    category: 'dokkai'
  },
  {
    id: 'wm_04',
    title: 'Penebas Boss Wilayah',
    description: 'Kalahkan minimal 1 Boss Stage pada Map.',
    progress: 0,
    target: 1,
    rewardExp: 600,
    rewardGold: 500,
    completed: false,
    claimed: false,
    type: 'weekly',
    category: 'general'
  }
];
