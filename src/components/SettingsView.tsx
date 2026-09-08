import React, { useState } from 'react';
import {
  Settings,
  Building,
  Coins,
  Hash,
  Store,
  Bell,
  Globe,
  Cpu,
  Save,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';

export const SettingsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    | 'general'
    | 'company'
    | 'currency'
    | 'numbering'
    | 'warehouses'
    | 'notifications'
    | 'webshop'
    | 'system'
  >('general');

  const toast = useToast();

  // Settings State Form
  const [companyName, setCompanyName] = useState('TR "Uzeh" Sarajevo');
  const [companyJib, setCompanyJib] = useState('4303314560007');
  const [companyPib, setCompanyPib] = useState('303314560007');
  const [companyAddress, setCompanyAddress] = useState('Ferhadija br. 14, 71000 Sarajevo');
  const [companyCity, setCompanyCity] = useState('Sarajevo, Bosna i Hercegovina');
  const [companyPhone, setCompanyPhone] = useState('+387 33 214 567');
  const [companyEmail, setCompanyEmail] = useState('info@uzeh.ba');

  // Currency & Formats
  const [baseCurrency, setBaseCurrency] = useState('BAM (KM)');
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [dateFormat, setDateFormat] = useState('DD.MM.YYYY.');

  // Document numbering
  const [calcPrefix, setCalcPrefix] = useState('KAL-{YYYY}-');
  const [priceAdjPrefix, setPriceAdjPrefix] = useState('NIV-{YYYY}-');
  const [posReceiptPrefix, setPosReceiptPrefix] = useState('RAC-{YYYY}-');
  const [inventoryPrefix, setInventoryPrefix] = useState('INV-{YYYY}-');

  // Notifications
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyPriceChanges, setNotifyPriceChanges] = useState(true);
  const [notifySyncFailures, setNotifySyncFailures] = useState(true);

  // Webshop
  const [webshopUrl, setWebshopUrl] = useState('https://uzeh.ba');
  const [webshopApiKey, setWebshopApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [autoSyncInterval, setAutoSyncInterval] = useState('15 min');

  const handleSave = () => {
    toast.success('Konfiguracijske postavke ERP sistema su uspješno sačuvane.');
  };

  const handleResetDefaults = () => {
    toast.info('Postavke su vraćene na standardne fabričke parametre.');
  };

  const navItems = [
    { id: 'general', label: 'Općenito (General)', icon: Settings },
    { id: 'company', label: 'Podaci o firmi (Company)', icon: Building },
    { id: 'currency', label: 'Valute i formati (Currency)', icon: Coins },
    { id: 'numbering', label: 'Brojanje dokumenata (Numbering)', icon: Hash },
    { id: 'warehouses', label: 'Skladišta i lokacije', icon: Store },
    { id: 'notifications', label: 'Notifikacije i upozorenja', icon: Bell },
    { id: 'webshop', label: 'Webshop integracija', icon: Globe },
    { id: 'system', label: 'Sistem i performanse', icon: Cpu },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Postavke ERP sistema"
        subtitle="Globalna konfiguracija poslovanja, fiskalnih parametara i sistemskih modula"
        breadcrumbs={[
          { label: 'Sistem' },
          { label: 'Postavke', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Vrati na izvorno</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Sačuvaj izmjene</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-2 shadow-2xs space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Form Body */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200/90 bg-white p-6 shadow-2xs text-xs">
          {activeSection === 'general' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Općenite postavke sistema
              </h2>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Naziv instance</label>
                <input
                  type="text"
                  defaultValue="Uzeh ERP Produkcija - BiH Maloprodaja"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Podrazumijevani jezik</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-1.5">
                  <option>Bosanski (BiH)</option>
                  <option>Hrvatski</option>
                  <option>Srpski</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vremenska zona</label>
                <input
                  type="text"
                  readOnly
                  value="Europe/Sarajevo (GMT+1 / CEST)"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-500"
                />
              </div>
            </div>
          )}

          {activeSection === 'company' && (
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Podaci o privrednom subjektu (Pravno lice)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Puni naziv firme *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">JIB (Jedinstveni ID broj)</label>
                  <input
                    type="text"
                    value={companyJib}
                    onChange={(e) => setCompanyJib(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PIB / PDV Broj</label>
                  <input
                    type="text"
                    value={companyPib}
                    onChange={(e) => setCompanyPib(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Sjedište i adresa</label>
                  <input
                    type="text"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Grad</label>
                  <input
                    type="text"
                    value={companyCity}
                    onChange={(e) => setCompanyCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Kontakt telefon</label>
                  <input
                    type="text"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'currency' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Valute, decimale i formati ispisa
              </h2>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Osnovna obračunska valuta</label>
                <input
                  type="text"
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Broj decimalnih mjesta za cijene</label>
                <select
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                >
                  <option value="2">2 decimale (npr. 12,50 KM - standard)</option>
                  <option value="3">3 decimale</option>
                  <option value="4">4 decimale (za visoko-preciznu veleprodaju)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Format datuma</label>
                <input
                  type="text"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
            </div>
          )}

          {activeSection === 'numbering' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Formati numerisanja dokumenata (Prefixi)
              </h2>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Ulazne kalkulacije</label>
                <input
                  type="text"
                  value={calcPrefix}
                  onChange={(e) => setCalcPrefix(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Nivelacije cijena</label>
                <input
                  type="text"
                  value={priceAdjPrefix}
                  onChange={(e) => setPriceAdjPrefix(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">POS Fiskalni računi</label>
                <input
                  type="text"
                  value={posReceiptPrefix}
                  onChange={(e) => setPosReceiptPrefix(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Notifikacije i automatizirana upozorenja
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyLowStock}
                    onChange={(e) => setNotifyLowStock(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Upozori kada zaliha artikla padne ispod minimalne količine</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyPriceChanges}
                    onChange={(e) => setNotifyPriceChanges(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Pošalji obavještenje kod svake promjene maloprodajne cijene</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySyncFailures}
                    onChange={(e) => setNotifySyncFailures(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-600"
                  />
                  <span>Upozori kod neuspjele sinhronizacije sa webshopom</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'webshop' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Integracija sa Uzeh.ba Webshopom
              </h2>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Webshop Endpoint URL</label>
                <input
                  type="text"
                  value={webshopUrl}
                  onChange={(e) => setWebshopUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">API Sigurnosni ključ</label>
                <input
                  type="password"
                  value={webshopApiKey}
                  onChange={(e) => setWebshopApiKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Automatski interval sinhronizacije</label>
                <select
                  value={autoSyncInterval}
                  onChange={(e) => setAutoSyncInterval(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
                >
                  <option value="5 min">Svakih 5 minuta</option>
                  <option value="15 min">Svakih 15 minuta (Preporučeno)</option>
                  <option value="60 min">Svaki sat</option>
                  <option value="manual">Samo ručno pokretanje</option>
                </select>
              </div>
            </div>
          )}

          {activeSection === 'system' && (
            <div className="space-y-4 max-w-xl">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Sistemske informacije i dijagnostika
              </h2>
              <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Frontend verzija:</span>
                  <span className="font-bold text-slate-900">v2.4.0-desktop-erp</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Baza podataka:</span>
                  <span className="text-slate-900">PostgreSQL (DML Ready)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Okruženje:</span>
                  <span className="text-emerald-700 font-semibold">Production Ready UI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lokalni storage:</span>
                  <span className="text-slate-900">Aktivan (localStorage mirror)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
