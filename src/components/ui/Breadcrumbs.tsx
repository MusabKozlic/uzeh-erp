import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  onHomeClick?: () => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  onHomeClick,
}) => {
  return (
    <nav className={`flex items-center space-x-1.5 text-xs text-slate-500 ${className}`}>
      <button
        type="button"
        onClick={onHomeClick}
        className="flex items-center text-slate-400 hover:text-slate-700 transition-colors"
        title="Nadzorna ploča"
      >
        <Home className="h-3.5 w-3.5" />
      </button>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="h-3 w-3 text-slate-300 flex-shrink-0" />
          {item.onClick && !item.active ? (
            <button
              type="button"
              onClick={item.onClick}
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium truncate max-w-[200px]"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={`truncate max-w-[220px] ${
                item.active || idx === items.length - 1
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
