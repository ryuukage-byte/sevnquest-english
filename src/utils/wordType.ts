import type { KotobaItem } from '../types/content';

export type WordType = KotobaItem['wordType'];

/** Label tampilan (Indonesia + istilah Jepang) untuk tiap jenis kata hasil klasifikasi JMdict. */
const WORD_TYPE_LABELS: Record<WordType, { id: string; jp: string }> = {
  noun: { id: 'Noun', jp: 'Noun' },
  verb: { id: 'Verb', jp: 'Verb' },
  'adjective-i': { id: 'Adjective', jp: 'Adjective' },
  'adjective-na': { id: 'Adjective', jp: 'Adjective' },
  'adjective-pn': { id: 'Determiner', jp: 'Determiner' },
  adverb: { id: 'Adverb', jp: 'Adverb' },
  conjunction: { id: 'Conjunction', jp: 'Conjunction' },
  particle: { id: 'Preposition', jp: 'Preposition' },
  pronoun: { id: 'Pronoun', jp: 'Pronoun' },
  counter: { id: 'Determiner', jp: 'Determiner' },
  numeral: { id: 'Number', jp: 'Number' },
  interjection: { id: 'Interjection', jp: 'Interjection' },
  expression: { id: 'Expression', jp: 'Expression' },
  prefix: { id: 'Prefix', jp: 'Prefix' },
  suffix: { id: 'Suffix', jp: 'Suffix' },
  auxiliary: { id: 'Auxiliary verb', jp: 'Auxiliary verb' },
};

export function getWordTypeLabel(type?: string | null): string {
  if (!type) return '';
  return WORD_TYPE_LABELS[type as WordType]?.id ?? type;
}

export function getWordTypeLabelJp(type?: string | null): string {
  if (!type) return '';
  return WORD_TYPE_LABELS[type as WordType]?.jp ?? '';
}
