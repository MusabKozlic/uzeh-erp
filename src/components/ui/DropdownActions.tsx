import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface DropdownActionsProps {
  items: ActionMenuItem[];
  triggerClassName?: string;
}

export const DropdownActions: React.FC<DropdownActionsProps> = ({
  items,
  triggerClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ${triggerClassName}`}
        title="Akcije"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-1 w-44 origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100">
          {items.map((item, idx) => {
            const Icon = item.icon;
            let textClass = 'text-slate-700 hover:bg-slate-50';
            if (item.variant === 'danger') textClass = 'text-rose-600 hover:bg-rose-50';
            if (item.variant === 'success') textClass = 'text-emerald-700 hover:bg-emerald-50';
            if (item.disabled) textClass = 'text-slate-300 cursor-not-allowed';

            return (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors ${textClass}`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
