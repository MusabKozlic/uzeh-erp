import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  rows = 5,
  columns = 6,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse p-4 ${className}`}>
      {/* Header bar */}
      <div className="flex gap-4 pb-2 border-b border-slate-200">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-200 rounded flex-1"
            style={{ maxWidth: i === 0 ? '80px' : i === 1 ? '160px' : 'auto' }}
          />
        ))}
      </div>

      {/* Row items */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 py-2 border-b border-slate-100 items-center">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-3.5 bg-slate-100 rounded flex-1"
              style={{
                maxWidth: c === 0 ? '70px' : c === 1 ? '140px' : 'auto',
                opacity: 0.9 - (c % 3) * 0.15,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
