import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Key,
  Layers,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { StatusBadge } from './ui/StatusBadge';
import { DataTable } from './ui/DataTable';
import { DateDisplay } from './ui/DateDisplay';

interface SyncLogItem {
  id: string;
  timestamp: string;
  direction: 'ERP -> Webshop' | 'Webshop -> ERP';
  entity: 'Cijene (MPC)' | 'Zaliha (Stock)' | 'Katalog' | 'Narudžba';
  status: 'Success' | 'Failed' | 'Pending';
  records_processed: number;
  message: string;
}

interface ConflictItem {
  id: string;
  timestamp: string;
  sku: string;
  name: string;
  erp_value: string;
  webshop_value: string;
  resolution: string;
  status: 'Riješeno' | 'Čeka pregled';
}

export const WebshopSyncView: React.FC = () => {
  const { products, activeWarehouse, createSale, triggerWebshopSync } = useERP();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'sync' | 'logs' | 'conflicts'>('sync');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('08.09.2026. 14:15:30');

  // Sync Log data
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([
    {
      id: 'log-1',
      timestamp: '2026-09-08T14:15:30Z',
      direction: 'ERP -> Webshop',
      entity: 'Zaliha (Stock)',
      status: 'Success',
      records_processed: products.length,
      message: 'Sva raspoloživa stanja centralnog skladišta su ažurirana na Uzeh.ba.',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-08T14:10:00Z',
      direction: 'ERP -> Webshop',
      entity: 'Cijene (MPC)',
      status: 'Success',
      records_processed: products.length,
      message: 'Nivelisane cijene i akcije uspješno prenesene na storefront.',
    },
    {
      id: 'log-3',
      timestamp: '2026-09-08T13:45:12Z',
      direction: 'Webshop -> ERP',
      entity: 'Narudžba',
      status: 'Success',
      records_processed: 1,
      message: 'Dolazna web narudžba #WEB-8491 evidentirana i rezervisan lager.',
    },
    {
      id: 'log-4',
      timestamp: '2026-09-08T12:00:00Z',
      direction: 'ERP -> Webshop',
      entity: 'Katalog',
      status: 'Success',
      records_processed: 25,
      message: 'Sinhronizacija novih artikala i opisa.',
    },
    {
      id: 'log-5',
      timestamp: '2026-09-08T09:30:15Z',
      direction: 'ERP -> Webshop',
      entity: 'Zaliha (Stock)',
      status: 'Failed',
      records_processed: 0,
      message: 'Timeout prilikom odgovora Webshop API gateway-a (Automatski retry uspio).',
    },
  ]);

  // Conflict log data
  const [conflicts] = useState<ConflictItem[]>([
    {
      id: 'conf-1',
      timestamp: '2026-09-08T11:20:00Z',
      sku: 'ART-002',
      name: 'Bežične Bluetooth Slušalice Pro',
      erp_value: 'Cijena: 79,90 KM',
      webshop_value: 'Cijena: 75,00 KM (Zastarijela keš memorija)',
      resolution: 'ERP prebrisao Webshop (ERP je izvor istine)',
      status: 'Riješeno',
    },
    {
      id: 'conf-2',
      timestamp: '2026-09-07T18:40:00Z',
      sku: 'ART-005',
      name: 'Pametna Wi-Fi Utičnica sa Mjeračem',
      erp_value: 'Zaliha: 0 kom (Rasprodato u radnji)',
      webshop_value: 'Zaliha: 1 kom (U korpi kupca)',
      resolution: 'Narudžba stornirana, zaliha postavljena na 0',
      status: 'Riješeno',
    },
  ]);

  const handleRunSync = (type: 'prices' | 'stock' | 'full') => {
    setIsSyncing(true);
    const label =
      type === 'prices' ? 'Cijene (MPC)' : type === 'stock' ? 'Zaliha (Stock)' : 'Katalog';

    setTimeout(() => {
      setIsSyncing(false);
      const nowStr = new Date().toISOString();
      setLastSyncTime(new Date().toLocaleString('bs-BA'));

      const newLog: SyncLogItem = {
        id: `log-${Date.now()}`,
        timestamp: nowStr,
        direction: 'ERP -> Webshop',
        entity: label as any,
        status: 'Success',
        records_processed: products.length,
        message: `Uspješno izvršena operacija sinhronizacije [${label}] za web prodavnicu Uzeh.ba.`,
      };

      setSyncLogs((prev) => [newLog, ...prev]);
      triggerWebshopSync();
      toast.success(`Sinhronizacija [${label}] je uspješno završena!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uzeh.ba Webshop Sinhronizacija"
        subtitle="API komunikacijski most između ERP baze (izvor istine) i vanjske baze web prodavnice"
        breadcrumbs={[{ label: 'Integracije' }, { label: 'Webshop Sync', active: true }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRunSync('full')}
              disabled={isSyncing}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sinhronizacija u toku...' : 'Full Sync (Kompletna)'}</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-3 pt-2 gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'sync'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Status & Akcije sinhronizacije</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Dnevnik sinhronizacije (Sync Log - {syncLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'conflicts'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Konflikti i neslaganja ({conflicts.length})</span>
        </button>
      </div>

      {/* 1. SYNC STATUS & ACTIONS TAB */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Architectural Rule Card */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-2xs">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-emerald-950 space-y-1">
                <div className="font-bold text-sm">
                  Arhitektonski princip: ERP je jedini izvor istine (Source of Truth)
                </div>
                <p className="leading-relaxed">
                  Baza webshopa <strong>uzeh.ba</strong> je potpuno nezavisna i ne posjeduje direktnu
                  vezu sa bazom ERP-a. ERP periodično šalje ažurirane cijene (iz kalkulacija i
                  nivelacija) i raspoložive zalihe preko sigurnog REST API-ja.
                </p>
              </div>
            </div>
          </div>

          {/* Connection status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Status API veze</span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">POVEZANO (LIVE)</div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                https://api.uzeh.ba/v1/sync
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Zadnja sinhronizacija</span>
                <Clock className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">{lastSyncTime}</div>
              <div className="mt-1 text-[11px] text-slate-400">Automatski ciklus na 15 min</div>
            </div>

            <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Mapirano artikala</span>
                <Globe className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-sm font-bold text-slate-900">{products.length} artikala</div>
              <div className="mt-1 text-[11px] text-slate-400">100% sinhronizovano</div>
            </div>
          </div>

          {/* Targeted Sync Actions */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ručno pokretanje sinhronizacijskih akcija
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-semibold text-slate-900 text-xs">Ažuriraj stanje zaliha</div>
                <p className="text-[11px] text-slate-500">
                  Šalje trenutne skladišne količine svih artikala u magacinu.
                </p>
                <button
                  type="button"
                  onClick={() => handleRunSync('stock')}
                  disabled={isSyncing}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 w-full"
                >
                  Sync Stock (Zalihe)
                </button>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="font-semibold text-slate-900 text-xs">Ažuriraj cijene (MPC)</div>
                <p className="text-[11px] text-slate-500">
                  Šalje aktuelne maloprodajne cijene i nivelacije na storefront.
                </p>
                <button
                  type="button"
                  onClick={() => handleRunSync('prices')}
                  disabled={isSyncing}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 w-full"
                >
                  Sync Prices (Cijene)
                </button>
              </div>

              <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 space-y-2">
                <div className="font-semibold text-emerald-950 text-xs">Potpuna sinhronizacija</div>
                <p className="text-[11px] text-slate-500">
                  Usklađuje cijene, zalihe, nazive, SKU šifre i barkodove odjednom.
                </p>
                <button
                  type="button"
                  onClick={() => handleRunSync('full')}
                  disabled={isSyncing}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 w-full"
                >
                  Full Sync
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SYNC LOG TABLE TAB */}
      {activeTab === 'logs' && (
        <DataTable
          columns={[
            {
              id: 'time',
              header: 'Datum i vrijeme',
              accessor: (l: any) => <DateDisplay date={l.timestamp} showTime />,
              sortable: true,
            },
            {
              id: 'direction',
              header: 'Smjer sinhronizacije',
              accessor: (l: any) => (
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {l.direction}
                </span>
              ),
            },
            {
              id: 'entity',
              header: 'Entitet',
              accessor: (l: any) => <span className="font-medium text-slate-800">{l.entity}</span>,
            },
            {
              id: 'records',
              header: 'Broj zapisa',
              align: 'center',
              accessor: (l: any) => <span className="font-mono">{l.records_processed}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (l: any) => (
                <StatusBadge
                  status={
                    l.status === 'Success'
                      ? 'USPJEŠNO'
                      : l.status === 'Failed'
                      ? 'GREŠKA'
                      : 'U OBRADI'
                  }
                />
              ),
            },
            {
              id: 'message',
              header: 'Poruka odgovora gateway-a',
              accessor: (l: any) => <span className="text-slate-600 text-[11px]">{l.message}</span>,
            },
          ]}
          data={syncLogs}
          keyExtractor={(l: any) => l.id}
        />
      )}

      {/* 3. CONFLICT LOG TAB */}
      {activeTab === 'conflicts' && (
        <DataTable
          columns={[
            {
              id: 'time',
              header: 'Vrijeme',
              accessor: (c: any) => <DateDisplay date={c.timestamp} showTime />,
            },
            {
              id: 'item',
              header: 'Artikal (SKU)',
              accessor: (c: any) => (
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="font-mono text-[10px] text-slate-400">{c.sku}</div>
                </div>
              ),
            },
            {
              id: 'erp',
              header: 'Vrijednost u ERP-u (Izvor)',
              accessor: (c: any) => <span className="font-mono font-semibold text-emerald-800">{c.erp_value}</span>,
            },
            {
              id: 'web',
              header: 'Vrijednost na Webshopu',
              accessor: (c: any) => <span className="font-mono text-rose-700">{c.webshop_value}</span>,
            },
            {
              id: 'res',
              header: 'Rješenje (ERP Pravilo)',
              accessor: (c: any) => <span className="text-slate-700 font-medium">{c.resolution}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (c: any) => <StatusBadge status={c.status} />,
            },
          ]}
          data={conflicts}
          keyExtractor={(c: any) => c.id}
        />
      )}
    </div>
  );
};
