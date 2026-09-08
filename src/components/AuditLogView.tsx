import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Database,
  Filter,
  History,
  Lock,
  Search,
  Shield,
  UserCheck,
  X,
  FileCode,
  ArrowRight,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { StatusBadge } from './ui/StatusBadge';
import { DateDisplay } from './ui/DateDisplay';
import { DataTable } from './ui/DataTable';
import { FilterBar } from './ui/FilterBar';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useERP();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Enhanced audit logs with IP and mock old/new states for the drawer
  const enrichedLogs = React.useMemo(() => {
    return auditLogs.map((log, index) => {
      const isPost = log.action === 'POST' || log.action === 'CREATE';
      const ip = `192.168.1.${10 + (index % 15)}`;
      const oldValues =
        log.action === 'CREATE'
          ? null
          : {
              status: 'NACRT',
              updated_at: '2026-09-07T14:10:00Z',
              total: 250.0,
              posted: false,
            };
      const newValues = {
        ...log.details,
        status: isPost ? 'KNJIŽENO' : 'IZMIJENJENO',
        posted: isPost,
      };

      return {
        ...log,
        ip_address: ip,
        summary: `Korisnik ${log.user_name} izvršio radnju [${log.action}] nad ${log.entity_name}`,
        old_values: oldValues,
        new_values: newValues,
      };
    });
  }, [auditLogs]);

  const filteredLogs = enrichedLogs.filter((log) => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ip_address.includes(searchTerm);

    const matchesEntity = selectedEntity === 'ALL' || log.entity_name === selectedEntity;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revizijski trag & Dnevnik aktivnosti (Audit Log)"
        subtitle="Strogi zakonski revizijski trag svih operacija: knjiženja, promjene cijena, nivelacije i sinhronizacije"
        breadcrumbs={[{ label: 'Sistem' }, { label: 'Audit Log', active: true }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.success('Revizijski izvještaj je izvezen u CSV.')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Izvezi log (CSV)</span>
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20 ring-inset">
              <Lock className="h-3.5 w-3.5" />
              <span>Neizmjenjiv zapis (WORM)</span>
            </span>
          </div>
        }
      />

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Pretraži po korisniku, tabeli, radnji, IP adresi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Entitet:</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-800 focus:outline-none"
            >
              <option value="ALL">Svi entiteti</option>
              <option value="retail_calculations">Kalkulacije</option>
              <option value="price_adjustments">Nivelacije</option>
              <option value="sales">Prodaja (Kasa)</option>
              <option value="stock_movements">Zalihe</option>
              <option value="inventory_counts">Inventura</option>
              <option value="products">Artikli</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-500 font-medium">Akcija:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-800 focus:outline-none"
            >
              <option value="ALL">Sve akcije</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="POST">POST</option>
              <option value="CANCEL">CANCEL</option>
              <option value="SYNC">SYNC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <DataTable
        columns={[
          {
            id: 'created_at',
            header: 'Datum i vrijeme',
            accessor: (log) => <DateDisplay date={log.created_at} showTime />,
            sortable: true,
          },
          {
            id: 'user_name',
            header: 'Korisnik',
            accessor: (log) => (
              <div>
                <div className="font-semibold text-slate-900">{log.user_name}</div>
                <div className="text-[10px] font-mono text-slate-400">IP: {log.ip_address}</div>
              </div>
            ),
            sortable: true,
          },
          {
            id: 'action',
            header: 'Akcija',
            accessor: (log) => {
              const isPost = log.action === 'POST' || log.action === 'CREATE';
              return (
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold font-mono ${
                    isPost
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20'
                      : log.action === 'CANCEL'
                      ? 'bg-rose-50 text-rose-800 ring-1 ring-rose-600/20'
                      : 'bg-blue-50 text-blue-800 ring-1 ring-blue-600/20'
                  }`}
                >
                  {log.action}
                </span>
              );
            },
            sortable: true,
          },
          {
            id: 'entity_name',
            header: 'Entitet / Tabela',
            accessor: (log) => (
              <span className="font-mono text-slate-800 font-semibold">{log.entity_name}</span>
            ),
            sortable: true,
          },
          {
            id: 'entity_id',
            header: 'ID Zapisa / Dokument',
            accessor: (log) => (
              <span className="font-mono text-slate-600 truncate max-w-[160px] block">
                {log.entity_id || '-'}
              </span>
            ),
          },
          {
            id: 'details',
            header: 'Pregled promjene',
            accessor: (log) => (
              <span className="text-slate-600 truncate block max-w-xs">{log.summary}</span>
            ),
          },
          {
            id: 'actions',
            header: '',
            align: 'right',
            accessor: (log) => (
              <button
                type="button"
                onClick={() => setSelectedLog(log)}
                className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>Detalji</span>
                <ChevronRight className="h-3 w-3 text-slate-400" />
              </button>
            ),
          },
        ]}
        data={filteredLogs}
        keyExtractor={(log: any) => log.id}
        pageSize={12}
      />

      {/* DETAIL DRAWER FOR AUDIT LOG (Old vs New Values, JSON Diff) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs">
          <div className="w-full max-w-xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Revizijski detalji aktivnosti #{selectedLog.id.slice(0, 8)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Vrijeme akcije:</span>
                  <span className="font-mono font-bold text-slate-800">
                    <DateDisplay date={selectedLog.created_at} showTime />
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Korisnički nalog:</span>
                  <span className="font-semibold text-slate-800">{selectedLog.user_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">IP Adresa stanice:</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip_address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tip operacije:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {selectedLog.action}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Ciljna tabela / Dokument:</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    public.{selectedLog.entity_name} ({selectedLog.entity_id})
                  </span>
                </div>
              </div>

              {/* Old vs New Values Comparison */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Usporedba stanja (Prethodno vs Novo)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Previous State */}
                  <div className="rounded-lg border border-slate-200 p-3 bg-rose-50/20">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-2">
                      Prethodno stanje (Old Values)
                    </span>
                    {selectedLog.old_values ? (
                      <pre className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.old_values, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic py-4 text-center">
                        Nema prethodnog stanja (Novi zapis)
                      </div>
                    )}
                  </div>

                  {/* New State */}
                  <div className="rounded-lg border border-slate-200 p-3 bg-emerald-50/20">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-2">
                      Novo stanje (New Values)
                    </span>
                    <pre className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.new_values, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Complete JSON Diff Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Kompletan JSON revizijski paket
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                      toast.success('JSON je kopiran u međuspremnik.');
                    }}
                    className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    Kopiraj JSON
                  </button>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-900 p-3 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-52">
                  <pre>{JSON.stringify(selectedLog, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Zatvori pregled
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
