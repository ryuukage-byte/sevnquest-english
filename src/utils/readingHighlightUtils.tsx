import React from 'react';
import { KanjiItem } from '../types/content';

/**
 * English edition: a "reading" is the IPA pronunciation of a word. These helpers keep their old names
 * and return plain values so the writing and flashcard views render English text without kana alignment.
 */
export function alignWordReading(_word: string, reading: string): string[] {
  return reading ? [reading] : [];
}

export const parseReadingVariations = (reading?: string): string[] => {
  return reading && reading.trim() ? [reading.trim()] : [];
};

export const normalizeWordAndReading = (word: string, reading?: string) => {
  return { displayWord: word, displayReading: reading ? reading.trim() : '' };
};

export const getHighlightedYomikata = (word: string, _reading: string, _kanji: KanjiItem) => word;

export const getHighlightedKotobaYomikata = (word: string, _reading: string, activeCharIndex: number) => (
  <>
    {Array.from(word).map((c, i) => (
      <span key={i} className={i === activeCharIndex ? 'text-wine-accent font-bold' : undefined}>{c}</span>
    ))}
  </>
);
