import React from 'react';

export type UnifiedStatus =
  | 'NACRT'
  | 'KNJIŽENO'
  | 'OTKAZANO'
  | 'U TOKU'
  | 'POTVRĐENO'
  | 'DRAFT'
  | 'POSTED'
  | 'CANCELLED'
  | 'COUNTING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING';

interface StatusBadgeProps {
  status: UnifiedStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const norm = (status || '').toUpperCase();

  let label = norm;
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm === 'NACRT' || norm === 'DRAFT') {
    label = 'NACRT';
    style = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (norm === 'KNJIŽENO' || norm === 'POSTED') {
    label = 'KNJIŽENO';
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'OTKAZANO' || norm === 'CANCELLED') {
    label = 'OTKAZANO';
    style = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
  } else if (norm === 'U TOKU' || norm === 'COUNTING' || norm === 'PENDING') {
    label = 'U TOKU';
    style = 'bg-blue-50 text-blue-800 border-blue-200/80';
    dotColor = 'bg-blue-500';
  } else if (norm === 'POTVRĐENO' || norm === 'CONFIRMED') {
    label = 'POTVRĐENO';
    style = 'bg-teal-50 text-teal-800 border-teal-200/80';
    dotColor = 'bg-teal-500';
  } else if (norm === 'AKTIVAN' || norm === 'ACTIVE') {
    label = 'AKTIVAN';
    style = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (norm === 'NEAKTIVAN' || norm === 'INACTIVE') {
    label = 'NEAKTIVAN';
    style = 'bg-slate-100 text-slate-500 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] font-medium tracking-wide'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-mono uppercase transition-colors ${sizeClasses} ${style} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};

export const DocumentStatus = StatusBadge;
