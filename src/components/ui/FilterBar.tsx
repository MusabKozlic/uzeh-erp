import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { SearchInput } from './SearchInput';

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: {
    id: string;
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (val: string) => void;
  }[];
  onOpenDrawer?: () => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
  extraActions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Pretraži...',
  filters = [],
  onOpenDrawer,
  onReset,
  hasActiveFilters = false,
  extraActions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="w-full sm:w-64 lg:w-72">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            shortcut="Ctrl+F"
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none shadow-2xs transition-colors"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {onOpenDrawer && (
          <button
            type="button"
            onClick={onOpenDrawer}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors shadow-2xs ${
              hasActiveFilters
                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <span>Filteri</span>
            {hasActiveFilters && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 ml-0.5" />
            )}
          </button>
        )}

        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors px-2 py-1"
            title="Resetuj filtere"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Resetuj</span>
          </button>
        )}
      </div>

      {extraActions && (
        <div className="flex items-center gap-2 flex-wrap justify-end">{extraActions}</div>
      )}
    </div>
  );
};
