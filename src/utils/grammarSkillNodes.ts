import { BunpouItem, GrammarSkillNodes, TieredExampleSentence } from '../types/content';

/**
 * English edition: builds the grammar "skill nodes" (concept, pattern, examples, training questions)
 * straight from a grammar item. This replaces the Japanese-only skill adapter.
 */
export function getGrammarSkillNodes(item: BunpouItem): GrammarSkillNodes {
  const tiers: Array<TieredExampleSentence['tier']> = ['basic', 'daily', 'natural'];
  const tierLabels: Record<TieredExampleSentence['tier'], string> = {
    basic: 'Basic',
    daily: 'Everyday',
    natural: 'Natural',
  };
  const examples: TieredExampleSentence[] = item.examples.map((ex, i) => {
    const tier = tiers[Math.min(i, tiers.length - 1)];
    return {
      tier,
      tierLabel: tierLabels[tier],
      japanese: ex.japanese,
      reading: ex.reading,
      meaningId: ex.meaningEn || ex.meaningId,
    };
  });

  return {
    concept: {
      summary: item.meaningEn || item.explanation,
      beforeState: item.beforeState,
      afterState: item.afterState,
      starterExample: examples[0]
        ? { japanese: examples[0].japanese, reading: examples[0].reading, meaningId: examples[0].meaningId }
        : undefined,
      keyTakeaway: item.keyTakeaway,
    },
    functions: (item.functions || []).map((label, i) => ({ number: i + 1, label, description: label })),
    formulas: item.formula ? [{ title: item.title, breakdown: [item.formula] }] : [],
    wordIdentities: [],
    nuances: [],
    examples,
    trainingQuestions: item.questions,
  };
}

/** Tags shown on a grammar card: its CEFR level and category. */
export function getBunpouCategoryTags(item: BunpouItem): string[] {
  return [item.level, item.categoryType].filter((t): t is string => Boolean(t));
}
