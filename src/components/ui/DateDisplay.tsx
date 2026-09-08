import React from 'react';
import { formatDate, formatDateTime } from '../../lib/formatters';

interface DateDisplayProps {
  date: string | Date | null | undefined;
  showTime?: boolean;
  className?: string;
}

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  showTime = false,
  className = '',
}) => {
  if (!date) return <span className="text-slate-400 font-mono text-xs">-</span>;

  const formatted = showTime ? formatDateTime(date) : formatDate(date);

  return (
    <span className={`font-mono text-xs tabular-nums text-slate-700 ${className}`}>
      {formatted}
    </span>
  );
};
