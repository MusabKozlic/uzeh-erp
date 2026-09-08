import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Activity, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useToast } from '../../context/ToastContext';

interface UserMenuProps {
  onOpenSettings?: () => void;
  onOpenAuditLog?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenSettings, onOpenAuditLog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useERP();
  const toast = useToast();

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

  const initials = currentUser?.full_name
    ? currentUser.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD';

  const handleLogout = () => {
    setIsOpen(false);
    toast.info('Odjava sa demo sistema Uzeh ERP.');
  };

  const handleProfile = () => {
    setIsOpen(false);
    toast.info(`Profil korisnika: ${currentUser.full_name} (${currentUser.role})`);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg border border-slate-200/80 bg-white p-1.5 sm:px-3 sm:py-1.5 shadow-2xs hover:bg-slate-50 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-700 text-white font-mono text-xs font-semibold shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-800 leading-tight">
            {currentUser?.full_name || 'Admin Korisnik'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
            {currentUser?.role || 'ADMIN'}
          </span>
        </div>
        <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1.5 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-slate-100 mb-1">
            <p className="text-xs font-bold text-slate-900">{currentUser?.full_name}</p>
            <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'admin@uzeh.ba'}</p>
            <span className="mt-1 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200/60 font-mono">
              Uloga: {currentUser?.role || 'ADMIN'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleProfile}
            className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
          >
            <User className="h-4 w-4 text-slate-400" />
            <span>Moj profil</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenSettings?.();
            }}
            className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Postavke</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenAuditLog?.();
            }}
            className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 transition-colors text-left"
          >
            <Activity className="h-4 w-4 text-slate-400" />
            <span>Aktivnost (Audit log)</span>
          </button>

          <div className="my-1 border-t border-slate-100" />

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Odjava</span>
          </button>
        </div>
      )}
    </div>
  );
};
