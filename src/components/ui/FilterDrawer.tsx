import React, { useEffect } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
  title?: string;
  children: React.ReactNode;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  onApply,
  onReset,
  title = 'Napredni filteri',
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-200 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prilagodite parametre pretrage i filtriranja
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Form fields body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">{children}</div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-5 py-3">
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Resetuj</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply();
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Primijeni</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
