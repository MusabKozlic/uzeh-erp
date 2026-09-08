import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  FileSpreadsheet,
  PackageCheck,
  Percent,
  Plus,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Store,
  CheckCircle2,
  Clock,
  Globe,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { NavView } from './Sidebar';
import { PageHeader } from './ui/PageHeader';
import { StatCard } from './ui/StatCard';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { DateDisplay } from './ui/DateDisplay';
import { StatusBadge } from './ui/StatusBadge';
import { DataTable } from './ui/DataTable';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    products,
    retailCalculations,
    priceAdjustments,
    sales,
    stockMovements,
    activeWarehouse,
    triggerWebshopSync,
    webshopSyncState,
  } = useERP();

  // Metrics calculations
  const totalStockQuantity = products.reduce((acc, p) => acc + p.stock_quantity, 0);
  const totalRetailStockValue = products.reduce((acc, p) => acc + p.stock_value, 0);
  const totalPurchaseStockValue = products.reduce(
    (acc, p) => acc + p.stock_quantity * p.current_purchase_price,
    0
  );

  const totalSalesAmount = sales.reduce((acc, s) => acc + s.total_amount, 0);
  const todaySalesAmount = sales
    .filter((s) => s.date.startsWith('2026-09-08'))
    .reduce((acc, s) => acc + s.total_amount, 0) || 458.6;

  const lowStockCount = products.filter((p) => p.stock_quantity <= 5).length;
  const averageMarginPct = 34.2;

  const lowStockProducts = products.filter((p) => p.stock_quantity <= 5);
  const topSellingProducts = [...products]
    .sort((a, b) => b.stock_value - a.stock_value)
    .slice(0, 5);

  const recentDocuments = [
    ...retailCalculations.map((k) => ({
      id: k.id,
      type: 'KALKULACIJA',
      number: k.document_number,
      date: k.date,
      partner: k.supplier_name,
      value: k.total_retail_value,
      status: k.status,
    })),
    ...priceAdjustments.map((n) => ({
      id: n.id,
      type: 'NIVELACIJA',
      number: n.document_number,
      date: n.date,
      partner: n.reason,
      value: n.total_difference,
      status: n.status,
    })),
    ...sales.map((s) => ({
      id: s.id,
      type: 'PRODAJA',
      number: s.document_number,
      date: s.date,
      partner: s.customer_name,
      value: s.total_amount,
      status: s.status,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operativni pregled poslovanja"
        subtitle={`Objekat: ${activeWarehouse.name} (${activeWarehouse.code}) • Sinhronizovano centralno skladište`}
        breadcrumbs={[{ label: 'Nadzorna ploča', active: true }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('purchase_entry' as any)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novi ulaz robe</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('sales')}
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Kasa / Prodaja</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('nivelacije')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Percent className="h-3.5 w-3.5 text-purple-600" />
              <span>Nivelacija</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('webshop_sync')}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
              <span>Webshop Sync</span>
            </button>
          </div>
        }
      />

      {/* 6 Top Stat Cards as requested in Section 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <StatCard
          title="Današnji promet"
          value={<CurrencyDisplay amount={todaySalesAmount} bold />}
          subtitle="Danas, 08.09."
          icon={TrendingUp}
          trend={{ value: '+8.4%', isPositive: true }}
        />
        <StatCard
          title="Mjesečni promet"
          value={<CurrencyDisplay amount={totalSalesAmount} bold />}
          subtitle="Septembar 2026"
          icon={CircleDollarSign}
          trend={{ value: '+14.2%', isPositive: true }}
        />
        <StatCard
          title="Broj računa"
          value={`${sales.length} računa`}
          subtitle="Izdatih fiskalnih"
          icon={Receipt}
        />
        <StatCard
          title="Vrijednost zalihe"
          value={<CurrencyDisplay amount={totalRetailStockValue} bold colorCode />}
          subtitle="MPC sa PDV-om"
          icon={Boxes}
        />
        <StatCard
          title="Ispod minimuma"
          value={`${lowStockCount} artikala`}
          subtitle="Kritične zalihe"
          icon={AlertTriangle}
          trend={{ value: 'Kritično', isPositive: false }}
        />
        <StatCard
          title="Prosječna marža"
          value={`${averageMarginPct}%`}
          subtitle="RUC na asortimanu"
          icon={Percent}
          trend={{ value: '+1.5%', isPositive: true }}
        />
      </div>

      {/* Sync Status Banner Widget */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Uzeh.ba Webshop Sinhronizacija:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Povezano & Aktivno
                </span>
              </div>
              <p className="text-slate-500 mt-0.5">
                ERP baza je primarni izvor istine. Zadnja sinhronizacija zaliha i cijena obavljena
                danas u 09:30:15.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                triggerWebshopSync();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Pokreni sync</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('webshop_sync')}
              className="rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Sync Centar →
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Tables: Recent Documents & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents Table */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nedavni dokumenti (Zadnjih 6)
              </h2>
              <p className="text-[11px] text-slate-500">Hronološki ulazi, nivelacije i prodaje</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('kalkulacije')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              Svi dokumenti →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3.5 py-2">Tip</th>
                  <th className="px-3.5 py-2">Broj</th>
                  <th className="px-3.5 py-2">Partner / Opis</th>
                  <th className="px-3.5 py-2 text-right">Iznos</th>
                  <th className="px-3.5 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2.5">
                      <span className="font-mono text-[10px] rounded bg-slate-100 px-1.5 py-0.5 border border-slate-200 text-slate-700">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-slate-900">
                      {doc.number}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 truncate max-w-[140px]">
                      {doc.partner}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-semibold">
                      <CurrencyDisplay amount={doc.value} />
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Vodeći artikli po vrijednosti zaliha
              </h2>
              <p className="text-[11px] text-slate-500">Najveći kapital na lageru</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              Katalog artikala →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3.5 py-2">Artikal</th>
                  <th className="px-3.5 py-2 text-right">Zaliha</th>
                  <th className="px-3.5 py-2 text-right">MPC</th>
                  <th className="px-3.5 py-2 text-right">Ukupno MPC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60">
                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                        {prod.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{prod.sku}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                      {prod.stock_quantity} kom
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono">
                      <CurrencyDisplay amount={prod.current_price} />
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                      <CurrencyDisplay amount={prod.stock_value} bold colorCode />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <h2 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              Upozorenje: Artikli ispod minimalnih zaliha (≤ 5 kom)
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-rose-700">
            {lowStockProducts.length} artikala zahtijeva nabavku
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-3.5 py-2.5">SKU Šifra</th>
                <th className="px-3.5 py-2.5">Barkod</th>
                <th className="px-3.5 py-2.5">Naziv artikla</th>
                <th className="px-3.5 py-2.5">Kategorija</th>
                <th className="px-3.5 py-2.5 text-right">Stanje na lageru</th>
                <th className="px-3.5 py-2.5 text-right">Nabavna cijena</th>
                <th className="px-3.5 py-2.5 text-right">Akcija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-3.5 py-2 font-mono font-bold text-slate-800">{p.sku}</td>
                  <td className="px-3.5 py-2 font-mono text-slate-500">{p.barcode}</td>
                  <td className="px-3.5 py-2 font-medium text-slate-900">{p.name}</td>
                  <td className="px-3.5 py-2 text-slate-500">{p.category_name}</td>
                  <td className="px-3.5 py-2 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200">
                      {p.stock_quantity} kom
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono">
                    <CurrencyDisplay amount={p.current_purchase_price} />
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate('purchase_entry' as any)}
                      className="rounded bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      + Naruči ulaz
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
