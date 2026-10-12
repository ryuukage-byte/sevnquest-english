import { BunpouItem, BunpouMixedSet, Question } from '../types/content';
import bunpouJson from './db/bunpou.json';
import { BUNPOU_QUESTION_BANK as questionsJson } from './questionBank';

// English grammar points (CEFR A1–B2). Each raw entry carries its own level and example sentences.

interface RawExample {
  jp: string; // English example sentence (the field name is kept from the data model)
  en?: string; // plain-English translation
  id?: string;
  reading?: string;
}

interface RawBunpou {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  title: string;
  formula: string;
  meaning_en: string;
  meaning_id: string;
  explanation_note?: string;
  examples: RawExample[];
  question_ids: string[];
}

interface RawQuestion {
  id: string;
  material_id: string;
  type: string;
  prompt: string;
  ruby?: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

// Group questions by material_id
const questionsByMaterial = new Map<string, Question[]>();
(questionsJson as RawQuestion[]).forEach(q => {
  if (!questionsByMaterial.has(q.material_id)) {
    questionsByMaterial.set(q.material_id, []);
  }
  questionsByMaterial.get(q.material_id)!.push({
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correct_answer,
    explanation: q.explanation
  });
});

export const BUNPOU_DATABASE: Record<string, BunpouItem> = {};

(bunpouJson as RawBunpou[]).forEach(item => {
  const questions = questionsByMaterial.get(item.id) || [];

  const examples = (item.examples || []).map(ex => ({
    japanese: ex.jp,
    reading: ex.reading || ex.jp,
    meaningId: ex.id || ex.en || '',
    meaningEn: ex.en || ex.jp
  }));

  const bunpouItem: BunpouItem = {
    id: item.id,
    title: item.title,
    reading: item.formula || item.title,
    meaningId: item.meaning_en,
    meaningEn: item.meaning_en,
    level: item.level,
    explanation: item.explanation_note || item.meaning_en,
    formula: item.formula || '',
    examples,
    questions: questions.length > 0 ? questions : [
      {
        id: `${item.id}_default_q1`,
        prompt: `Which meaning best matches the pattern "${item.title}"?`,
        options: [item.meaning_en, 'A strong prohibition', 'A past possibility', 'A speculative guess'],
        correctIndex: 0,
        explanation: `${item.title}: ${item.meaning_en}`
      }
    ]
  };

  BUNPOU_DATABASE[item.id] = bunpouItem;
});

// Collect questions from all grammar points in a given level
function collectLevelQuestions(level: string): Question[] {
  const allQuestions: Question[] = [];
  for (const item of Object.values(BUNPOU_DATABASE)) {
    if (item.level === level && item.questions) {
      // Take 1 random question from each grammar point for variety
      const randomQ = item.questions[Math.floor(Math.random() * item.questions.length)];
      if (randomQ) allQuestions.push(randomQ);
    }
  }
  // Shuffle using Fisher-Yates
  for (let i = allQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
  }
  return allQuestions;
}

// Generate a mixed test for each CEFR level
function buildMixedSets(): Record<string, BunpouMixedSet> {
  const sets: Record<string, BunpouMixedSet> = {};
  for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
    const levelQuestions = collectLevelQuestions(level);
    const id = `bunpou_mixed_${level.toLowerCase()}`;
    sets[id] = {
      id,
      title: `${level} Grammar Mixed Test`,
      description: `A challenge of 7 random questions from all ${level} grammar points.`,
      questions: levelQuestions.slice(0, 7),
      baseLevel: level as BunpouMixedSet['baseLevel'],
      level
    };
    sets[`set_${level.toLowerCase()}_boss`] = {
      id: `set_${level.toLowerCase()}_boss`,
      title: `${level} Boss Grammar Test`,
      description: `Boss test: 7 mixed questions from all ${level} grammar points.`,
      questions: levelQuestions.slice(0, 7),
      baseLevel: level as BunpouMixedSet['baseLevel'],
      level
    };
  }
  return sets;
}

export const BUNPOU_MIXED_DATABASE = buildMixedSets();
