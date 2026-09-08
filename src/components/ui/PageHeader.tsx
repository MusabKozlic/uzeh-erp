import React from 'react';
import { BreadcrumbItem, Breadcrumbs } from './Breadcrumbs';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  onHomeClick?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onHomeClick,
  className = '',
}) => {
  return (
    <div className={`mb-6 space-y-2 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} onHomeClick={onHomeClick} />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
};
