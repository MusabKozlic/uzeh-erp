import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export type DialogVariant = 'post' | 'cancel' | 'delete' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Potvrdi',
  cancelLabel = 'Nazad',
  variant = 'post',
  loading = false,
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

  let icon = <AlertTriangle className="h-5 w-5 text-amber-600" />;
  let iconBg = 'bg-amber-100';
  let confirmBtnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';

  if (variant === 'post') {
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    iconBg = 'bg-emerald-100';
    confirmBtnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
  } else if (variant === 'cancel' || variant === 'delete') {
    icon = <AlertTriangle className="h-5 w-5 text-rose-600" />;
    iconBg = 'bg-rose-100';
    confirmBtnClass = 'bg-rose-600 hover:bg-rose-700 text-white';
  } else if (variant === 'warning') {
    icon = <AlertTriangle className="h-5 w-5 text-amber-600" />;
    iconBg = 'bg-amber-100';
    confirmBtnClass = 'bg-amber-600 hover:bg-amber-700 text-white';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition-all">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug">{title}</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={loading}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
