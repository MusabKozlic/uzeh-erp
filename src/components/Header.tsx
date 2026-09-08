import React from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Database,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  User,
  Bell,
  Command,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { INITIAL_USERS } from '../data/seedDatabase';
import { UserMenu } from './ui/UserMenu';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  currentViewTitle?: string;
  onToggleMobileMenu?: () => void;
  onOpenCommandPalette?: () => void;
  onNavigateSettings?: () => void;
  onNavigateAuditLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle = 'Nadzorna ploča',
  onToggleMobileMenu,
  onOpenCommandPalette,
  onNavigateSettings,
  onNavigateAuditLogs,
}) => {
  const {
    activeWarehouse,
    setActiveWarehouse,
    warehouses,
    currentUser,
    setCurrentUser,
    syncLogs,
    resetToDefaultData,
  } = useERP();
  const toast = useToast();

  const handleResetData = () => {
    if (
      confirm(
        'Da li sigurno želite vratiti sve podatke na fabrički izvor (301 artikal, kalkulacije, nivelacije)?'
      )
    ) {
      resetToDefaultData();
      toast.success('Baza podataka je uspješno resetovana na početno stanje.');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-2xs">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Otvori navigaciju"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {currentViewTitle}
            </h1>
            <span className="hidden sm:inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 ring-inset">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktivan
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden md:block">
            TR "Uzeh" Sarajevo • ID: 4303314560007 • Šifra djelatnosti: 47.78 • Valuta: BAM (KM)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search Bar trigger (Ctrl + K) */}
        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span>Brza pretraga i komande...</span>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>
        )}

        {/* Skladište selector */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
          <Store className="mr-2 h-4 w-4 text-slate-500 flex-shrink-0" />
          <span className="mr-1.5 text-slate-500 font-medium hidden sm:inline">Objekat:</span>
          <select
            value={activeWarehouse.id}
            onChange={(e) => {
              const wh = warehouses.find((w) => w.id === e.target.value);
              if (wh) {
                setActiveWarehouse(wh);
                toast.info(`Aktivno skladište promijenjeno na: ${wh.name}`);
              }
            }}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        {/* Reset Database Button */}
        <button
          type="button"
          onClick={handleResetData}
          title="Resetuj podatke na početno stanje iz uzeh.ba kataloga"
          className="hidden xl:flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset baze</span>
        </button>

        {/* User Menu & Role */}
        <UserMenu
          user={currentUser}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            toast.info(`Prebačeni ste na profil: ${user.full_name} (${user.role})`);
          }}
          onOpenSettings={onNavigateSettings}
          onOpenAuditLog={onNavigateAuditLogs}
        />
      </div>
    </header>
  );
};
