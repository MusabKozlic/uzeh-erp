import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  onClick,
  className = '',
  badge,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
              {badge}
            </span>
          )}
          {Icon && (
            <div className="rounded-lg bg-slate-50 p-2 text-slate-600 border border-slate-100">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isNeutral
                ? 'text-slate-500'
                : trend.isPositive
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 leading-tight">{subtitle}</p>}
    </div>
  );
};
