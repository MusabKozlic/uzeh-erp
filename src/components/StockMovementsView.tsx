import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  Boxes,
  Calendar,
  Database,
  Download,
  Filter,
  PackageCheck,
  Search,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { MovementType } from '../types/erp';

export const StockMovementsView: React.FC = () => {
  const { stockMovements, products, warehouses } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('ALL');

  const filteredMovements = useMemo(() => {
    return stockMovements
      .filter((m) => {
        const prod = products.find((p) => p.id === m.product_id);
        const prodName = prod ? prod.name.toLowerCase() : '';
        const prodSku = prod ? prod.sku.toLowerCase() : '';
        const refNum = (m.reference_number || '').toLowerCase();

        const matchesSearch =
          prodName.includes(searchTerm.toLowerCase()) ||
          prodSku.includes(searchTerm.toLowerCase()) ||
          refNum.includes(searchTerm.toLowerCase());

        const matchesType = selectedType === 'ALL' || m.movement_type === selectedType;
        const matchesWarehouse =
          selectedWarehouse === 'ALL' || m.warehouse_id === selectedWarehouse;

        return matchesSearch && matchesType && matchesWarehouse;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [stockMovements, products, searchTerm, selectedType, selectedWarehouse]);

  // Aggregate totals
  const totalIn = filteredMovements
    .filter((m) => m.quantity > 0)
    .reduce((acc, m) => acc + m.quantity, 0);

  const totalOut = filteredMovements
    .filter((m) => m.quantity < 0)
    .reduce((acc, m) => acc + Math.abs(m.quantity), 0);

  return (
    <div className="space-y-6">
      {/* Banner explaining Event Sourcing */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 shadow-xs">
        <div className="flex items-start gap-3">
          <Database className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h2 className="text-base font-bold text-blue-950">
              Dnevnik kretanja zaliha (Stock Movements • Source of Truth)
            </h2>
            <p className="text-xs text-blue-800 mt-1 leading-relaxed">
              U Uzeh ERP arhitekturi, zalihe se <strong>nikada ne mijenjaju ručno</strong> niti se
              čuvaju kao statička istina. Svako trenutno stanje zalihe na skladištu je izračunata
              suma (agregacija) svih proknjiženih događaja u tabeli{' '}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono text-[11px]">
                stock_movements
              </code>{' '}
              (ulazi, prodaje, nivelacije, popisi, otpisi i prenosi).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and stats row */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži po artiklu, šifri ili broju dokumenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Movement Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500"
            >
              <option value="ALL">Sve vrste promjena ({stockMovements.length})</option>
              <option value="PURCHASE">Nabavka (Ulaz kroz kalkulaciju)</option>
              <option value="SALE">Prodaja (Izlaz na kasi)</option>
              <option value="INVENTORY_ADJUSTMENT">Inventura / Popis (Usklađenje)</option>
              <option value="WRITE_OFF">Otpis robe (Oštećenje/Rashod)</option>
              <option value="TRANSFER_IN">Prenos - Prijem na skladište</option>
              <option value="TRANSFER_OUT">Prenos - Otprema sa skladišta</option>
            </select>
          </div>

          {/* Warehouse filter */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500"
            >
              <option value="ALL">Svi skladišni objekti</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick summary numbers */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
          <div className="flex items-center gap-4">
            <span>
              Pronađeno zapisa: <strong className="text-slate-900">{filteredMovements.length}</strong>
            </span>
            <span className="text-emerald-700">
              Ukupan ulaz: <strong className="font-mono">+{totalIn.toLocaleString('bs-BA')} kom</strong>
            </span>
            <span className="text-rose-700">
              Ukupan izlaz: <strong className="font-mono">-{totalOut.toLocaleString('bs-BA')} kom</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Tabela: public.stock_movements • PostgreSQL
          </div>
        </div>
      </div>

      {/* Movements Ledger Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Datum & Vrijeme</th>
                <th className="py-3 px-3 font-semibold">Artikal</th>
                <th className="py-3 px-3 font-semibold">Skladište</th>
                <th className="py-3 px-3 font-semibold">Tip promjene</th>
                <th className="py-3 px-3 font-semibold">Referentni dokument</th>
                <th className="py-3 px-3 font-semibold text-right">Količina</th>
                <th className="py-3 px-3 font-semibold text-right">Jed. cijena / NC</th>
                <th className="py-3 px-3 font-semibold">Kreirao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.slice(0, 50).map((m) => {
                const prod = products.find((p) => p.id === m.product_id);
                const wh = warehouses.find((w) => w.id === m.warehouse_id);
                const isPositive = m.quantity > 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {formatBosnianDate(m.created_at)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900">{prod?.name || 'Artikal'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{prod?.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-[150px] truncate">
                      {wh?.name || m.warehouse_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset'
                            : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 ring-inset'
                        }`}
                      >
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {m.reference_number || m.reference_type}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${m.quantity}` : m.quantity} {prod?.unit_code || 'kom'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {m.unit_cost > 0 ? formatBosnianCurrency(m.unit_cost) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{m.created_by || 'Sistem'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
