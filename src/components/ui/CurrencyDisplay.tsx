import React from 'react';
import { formatKM, formatDecimal } from '../../lib/formatters';

interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  currency?: string;
  className?: string;
  bold?: boolean;
  colorCode?: boolean; // Green for positive, red for negative
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency = 'KM',
  className = '',
  bold = false,
  colorCode = false,
}) => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const safeNum = isNaN(num) ? 0 : num;

  const formatted = formatKM(safeNum);

  let color = 'text-slate-800';
  if (colorCode) {
    if (safeNum > 0) color = 'text-emerald-700';
    else if (safeNum < 0) color = 'text-rose-700';
  }

  return (
    <span
      className={`font-mono tracking-tight tabular-nums ${bold ? 'font-semibold' : 'font-normal'} ${color} ${className}`}
    >
      {formatted}
    </span>
  );
};
