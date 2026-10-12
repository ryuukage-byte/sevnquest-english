import React from 'react';
import { BunpouItem } from '../../types/content';

interface FormulaDisplayProps {
  formula: string;
  item?: BunpouItem;
}

/**
 * FormulaDisplay — shows a grammar pattern (e.g. "Subject + base verb") in the Bunpou module.
 * English edition: the formula is shown as written; the Japanese token parser was removed.
 */
export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ formula, item }) => {
  if (!formula) return null;
  return (
    <div className="panel p-4 rounded-2xl border border-border-subtle bg-surface-inset">
      <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-muted mb-1.5">Pattern</p>
      <p className="font-mono text-base sm:text-lg font-bold text-text-primary break-words">{formula}</p>
      {item?.explanation && (
        <p className="text-xs text-text-secondary mt-2 leading-relaxed">{item.explanation}</p>
      )}
    </div>
  );
};
