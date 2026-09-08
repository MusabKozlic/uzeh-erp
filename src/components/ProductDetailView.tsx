import React, { useState } from 'react';
import {
  ArrowLeft,
  Barcode,
  Boxes,
  Calendar,
  ChevronRight,
  DollarSign,
  Edit,
  FileSpreadsheet,
  History,
  Layers,
  Percent,
  Printer,
  Receipt,
  ShoppingCart,
  Tag,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Product } from '../types/erp';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { formatKM } from '../lib/formatters';
import { PageHeader } from './ui/PageHeader';
import { StatCard } from './ui/StatCard';
import { StatusBadge } from './ui/StatusBadge';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { DateDisplay } from './ui/DateDisplay';
import { DataTable, Column } from './ui/DataTable';

interface ProductDetailViewProps {
  product: Product;
  onBack: () => void;
  onEdit?: (product: Product) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  onBack,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'pregled'
    | 'cijene'
    | 'zaliha'
    | 'promet'
    | 'nabavke'
    | 'prodaje'
    | 'kalkulacije'
    | 'nivelacije'
    | 'dokumenti'
    | 'identifikatori'
  >('pregled');

  const {
    stockMovements,
    articlePrices,
    retailCalculations,
    priceAdjustments,
    sales,
    warehouses,
  } = useERP();

  const toast = useToast();

  // Filter relevant records for this product
  const productMovements = stockMovements.filter((m) => m.product_id === product.id);
  const productPrices = articlePrices.filter((p) => p.product_id === product.id);
  const productCalculations = retailCalculations.filter((c) =>
    c.lines.some((l) => l.product_id === product.id)
  );
  const productAdjustments = priceAdjustments.filter((a) =>
    a.lines.some((l) => l.product_id === product.id)
  );
  const productSales = sales.filter((s) =>
    s.lines.some((l) => l.product_id === product.id)
  );

  const tabs = [
    { id: 'pregled', label: 'Pregled' },
    { id: 'cijene', label: 'Cijene', badge: productPrices.length },
    { id: 'zaliha', label: 'Zaliha' },
    { id: 'promet', label: 'Promet', badge: productMovements.length },
    { id: 'nabavke', label: 'Nabavke' },
    { id: 'prodaje', label: 'Prodaje', badge: productSales.length },
    { id: 'kalkulacije', label: 'Kalkulacije', badge: productCalculations.length },
    { id: 'nivelacije', label: 'Nivelacije', badge: productAdjustments.length },
    { id: 'dokumenti', label: 'Dokumenti' },
    { id: 'identifikatori', label: 'Identifikatori' },
  ] as const;

  const handlePrintBarcode = () => {
    toast.success(`Nalog za štampu barkod naljepnice za artikal ${product.sku} je poslan.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Breadcrumbs and Actions */}
      <PageHeader
        title={product.name}
        subtitle={`SKU: ${product.sku} • Barkod: ${product.barcode} • Kategorija: ${product.category_name || 'Nekategorisano'}`}
        breadcrumbs={[
          { label: 'Artikli', onClick: onBack },
          { label: 'Svi artikli', onClick: onBack },
          { label: product.name, active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Nazad na listu</span>
            </button>
            <button
              type="button"
              onClick={handlePrintBarcode}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Štampaj barkod</span>
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Uredi artikal</span>
              </button>
            )}
          </div>
        }
      />

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stanje na zalihi"
          value={`${product.stock_quantity} ${product.unit_code || 'kom'}`}
          subtitle={
            product.stock_quantity <= 5
              ? 'Kritična zaliha ispod minimuma!'
              : 'Optimalno stanje u magacinu'
          }
          icon={Boxes}
          trend={{
            value: product.stock_quantity > 0 ? 'Dostupno' : 'Nema zalihe',
            isPositive: product.stock_quantity > 5,
          }}
        />

        <StatCard
          title="Nabavna cijena (NC)"
          value={<CurrencyDisplay amount={product.current_purchase_price} bold />}
          subtitle="Posljednja fakturna cijena"
          icon={Truck}
        />

        <StatCard
          title="Prodajna cijena (MPC)"
          value={<CurrencyDisplay amount={product.current_price} bold colorCode />}
          subtitle="Maloprodajna cijena sa PDV"
          icon={Tag}
          trend={{
            value: `RUC: ${Math.round(((product.current_price - product.current_purchase_price) / (product.current_purchase_price || 1)) * 100)}%`,
            isPositive: true,
          }}
        />

        <StatCard
          title="Vrijednost zalihe"
          value={<CurrencyDisplay amount={product.stock_value} bold />}
          subtitle={`NC: ${product.stock_quantity * product.current_purchase_price} KM`}
          icon={TrendingUp}
        />
      </div>

      {/* Main Content Tabs */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto no-scrollbar px-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <span>{tab.label}</span>
              {'badge' in tab && tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === tab.id
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {/* TAB 1: PREGLED */}
          {activeTab === 'pregled' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-lg border border-slate-200 p-4 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                    Osnovni identifikacijski podaci
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">SKU Šifra:</span>
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {product.sku}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Glavni barkod:</span>
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {product.barcode}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Kategorija:</span>
                      <span className="font-medium text-slate-800">
                        {product.category_name || 'Nekategorisano'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Jedinica mjere:</span>
                      <span className="font-medium text-slate-800">
                        {product.unit_code || 'kom'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">PDV Stopa:</span>
                      <span className="font-medium text-slate-800 font-mono">17% (Standardna)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Status artikla:</span>
                      <StatusBadge status={product.active ? 'AKTIVAN' : 'NEAKTIVAN'} />
                    </div>
                  </div>

                  {product.description && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-slate-400 block text-xs mb-1">Opis artikla:</span>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {product.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Posljednji promet na skladištu
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('promet')}
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Pregledaj sav promet</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  {productMovements.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      Nema zabilježenog prometa za ovaj artikal.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {productMovements.slice(0, 4).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                m.quantity > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {m.movement_type}
                            </span>
                            <span className="text-slate-400">
                              ({m.reference_number || m.reference_type})
                            </span>
                          </div>
                          <DateDisplay date={m.created_at} showTime />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar card */}
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">Raspodjela po skladištima</h3>
                  <div className="space-y-2 text-xs">
                    {warehouses.map((w, idx) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{w.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{w.code}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">
                            {idx === 0 ? product.stock_quantity : 0} kom
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-2 text-xs">
                  <h3 className="text-sm font-bold text-slate-900">Historija unosa</h3>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Kreirano:</span>
                    <DateDisplay date={product.created_at} showTime />
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Ažurirano:</span>
                    <DateDisplay date={product.updated_at} showTime />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CIJENE */}
          {activeTab === 'cijene' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">
                  Historija i cjenovnik artikla (Article Prices Ledger)
                </h3>
                <span className="text-xs text-slate-500">
                  Ukupno zapisa cijena: {productPrices.length}
                </span>
              </div>
              <DataTable
                columns={[
                  {
                    id: 'price',
                    header: 'Cijena (MPC)',
                    accessor: (item: any) => <CurrencyDisplay amount={item.price} bold colorCode />,
                    sortable: true,
                  },
                  {
                    id: 'price_type',
                    header: 'Tip cijene',
                    accessor: (item: any) => (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-700">
                        {item.price_type}
                      </span>
                    ),
                  },
                  {
                    id: 'valid_from',
                    header: 'Važi od',
                    accessor: (item: any) => <DateDisplay date={item.valid_from} showTime />,
                  },
                  {
                    id: 'valid_to',
                    header: 'Važi do',
                    accessor: (item: any) =>
                      item.valid_to ? (
                        <DateDisplay date={item.valid_to} showTime />
                      ) : (
                        <span className="text-emerald-700 font-semibold font-mono text-[11px]">
                          Trenutno važeća
                        </span>
                      ),
                  },
                  {
                    id: 'reason',
                    header: 'Razlog / Izvor',
                    accessor: (item: any) => (
                      <span className="text-slate-600 truncate max-w-xs block">
                        {item.reason || 'Početni unos'}
                      </span>
                    ),
                  },
                ]}
                data={productPrices}
                keyExtractor={(item: any) => item.id}
                emptyTitle="Nema historije cijena"
              />
            </div>
          )}

          {/* TAB 3: ZALIHA */}
          {activeTab === 'zaliha' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Stanje zalihe po magacinima i zonama
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warehouses.map((w, idx) => (
                  <div
                    key={w.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{w.name}</div>
                        <div className="text-xs text-slate-500 font-mono">Kod: {w.code}</div>
                      </div>
                      <StatusBadge status={idx === 0 ? 'AKTIVAN' : 'U TOKU'} />
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs text-slate-500">Raspoloživa količina:</span>
                      <span className="text-lg font-mono font-bold text-slate-900">
                        {idx === 0 ? product.stock_quantity : 0} {product.unit_code || 'kom'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs text-slate-500">
                      <span>Ukupna vrijednost po NC:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {idx === 0 ? formatKM(product.stock_quantity * product.current_purchase_price) : '0,00 KM'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROMET */}
          {activeTab === 'promet' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">
                  Sve kartice prometa (Stock Ledger)
                </h3>
                <span className="text-xs text-slate-500">
                  Ukupno kretanja: {productMovements.length}
                </span>
              </div>
              <DataTable
                columns={[
                  {
                    id: 'created_at',
                    header: 'Datum i vrijeme',
                    accessor: (item: any) => <DateDisplay date={item.created_at} showTime />,
                  },
                  {
                    id: 'movement_type',
                    header: 'Tip kretanja',
                    accessor: (item: any) => (
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {item.movement_type}
                      </span>
                    ),
                  },
                  {
                    id: 'reference',
                    header: 'Dokument / Referenca',
                    accessor: (item: any) => (
                      <span className="font-mono text-xs text-slate-600">
                        {item.reference_number || item.reference_id}
                      </span>
                    ),
                  },
                  {
                    id: 'quantity',
                    header: 'Količina',
                    align: 'right',
                    accessor: (item: any) => (
                      <span
                        className={`font-mono font-bold ${
                          item.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                      </span>
                    ),
                  },
                  {
                    id: 'unit_cost',
                    header: 'Cijena troška',
                    align: 'right',
                    accessor: (item: any) => <CurrencyDisplay amount={item.unit_cost} />,
                  },
                ]}
                data={productMovements}
                keyExtractor={(item: any) => item.id}
                emptyTitle="Nema prometa zalihe"
              />
            </div>
          )}

          {/* TAB 5: NABAVKE */}
          {activeTab === 'nabavke' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Ulazi robe i nabavni nalozi</h3>
              <DataTable
                columns={[
                  {
                    id: 'doc',
                    header: 'Broj kalkulacije',
                    accessor: (c: any) => <span className="font-mono font-bold">{c.document_number}</span>,
                  },
                  {
                    id: 'date',
                    header: 'Datum ulaza',
                    accessor: (c: any) => <DateDisplay date={c.date} />,
                  },
                  {
                    id: 'supplier',
                    header: 'Dobavljač',
                    accessor: (c: any) => <span>{c.supplier_name}</span>,
                  },
                  {
                    id: 'qty',
                    header: 'Nabavljena kol.',
                    align: 'right',
                    accessor: (c: any) => {
                      const line = c.lines?.find((l: any) => l.product_id === product.id);
                      return <span className="font-mono font-semibold">{line?.quantity || 0}</span>;
                    },
                  },
                  {
                    id: 'price',
                    header: 'Fakturna NC',
                    align: 'right',
                    accessor: (c: any) => {
                      const line = c.lines?.find((l: any) => l.product_id === product.id);
                      return <CurrencyDisplay amount={line?.purchase_price} />;
                    },
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (c: any) => <StatusBadge status={c.status} />,
                  },
                ]}
                data={productCalculations}
                keyExtractor={(c: any) => c.id}
                emptyTitle="Nema zabilježenih nabavki"
              />
            </div>
          )}

          {/* TAB 6: PRODAJE */}
          {activeTab === 'prodaje' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Evidencija maloprodaje i računa (POS)
              </h3>
              <DataTable
                columns={[
                  {
                    id: 'doc',
                    header: 'Broj računa',
                    accessor: (s: any) => <span className="font-mono font-bold">{s.document_number}</span>,
                  },
                  {
                    id: 'date',
                    header: 'Datum i vrijeme',
                    accessor: (s: any) => <DateDisplay date={s.date} showTime />,
                  },
                  {
                    id: 'payment',
                    header: 'Način plaćanja',
                    accessor: (s: any) => (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-mono">
                        {s.payment_method}
                      </span>
                    ),
                  },
                  {
                    id: 'qty',
                    header: 'Količina',
                    align: 'right',
                    accessor: (s: any) => {
                      const line = s.lines?.find((l: any) => l.product_id === product.id);
                      return <span className="font-mono font-semibold">{line?.quantity || 0}</span>;
                    },
                  },
                  {
                    id: 'price',
                    header: 'Prodajna cijena',
                    align: 'right',
                    accessor: (s: any) => {
                      const line = s.lines?.find((l: any) => l.product_id === product.id);
                      return <CurrencyDisplay amount={line?.unit_price} />;
                    },
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (s: any) => <StatusBadge status={s.status} />,
                  },
                ]}
                data={productSales}
                keyExtractor={(s: any) => s.id}
                emptyTitle="Nema evidentiranih prodaja"
              />
            </div>
          )}

          {/* TAB 7: KALKULACIJE */}
          {activeTab === 'kalkulacije' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Vezane maloprodajne kalkulacije
              </h3>
              <DataTable
                columns={[
                  {
                    id: 'document_number',
                    header: 'Broj kalkulacije',
                    accessor: (item: any) => (
                      <span className="font-mono font-bold text-slate-800">
                        {item.document_number}
                      </span>
                    ),
                  },
                  {
                    id: 'date',
                    header: 'Datum',
                    accessor: (item: any) => <DateDisplay date={item.date} />,
                  },
                  {
                    id: 'supplier',
                    header: 'Dobavljač',
                    accessor: (item: any) => item.supplier_name || 'Dobavljač',
                  },
                  {
                    id: 'total',
                    header: 'Ukupan iznos kalkulacije',
                    align: 'right',
                    accessor: (item: any) => <CurrencyDisplay amount={item.total_retail_value} bold />,
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (item: any) => <StatusBadge status={item.status} />,
                  },
                ]}
                data={productCalculations}
                keyExtractor={(item: any) => item.id}
                emptyTitle="Nema kalkulacija za ovaj artikal"
              />
            </div>
          )}

          {/* TAB 8: NIVELACIJE */}
          {activeTab === 'nivelacije' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Vezane nivelacije cijena</h3>
              <DataTable
                columns={[
                  {
                    id: 'document_number',
                    header: 'Broj nivelacije',
                    accessor: (item: any) => (
                      <span className="font-mono font-bold text-slate-800">
                        {item.document_number}
                      </span>
                    ),
                  },
                  {
                    id: 'date',
                    header: 'Datum',
                    accessor: (item: any) => <DateDisplay date={item.date} />,
                  },
                  {
                    id: 'reason',
                    header: 'Razlog nivelacije',
                    accessor: (item: any) => item.reason,
                  },
                  {
                    id: 'diff',
                    header: 'Razlika vrijednosti',
                    align: 'right',
                    accessor: (item: any) => (
                      <CurrencyDisplay amount={item.total_difference} bold colorCode />
                    ),
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (item: any) => <StatusBadge status={item.status} />,
                  },
                ]}
                data={productAdjustments}
                keyExtractor={(item: any) => item.id}
                emptyTitle="Nema nivelacija za ovaj artikal"
              />
            </div>
          )}

          {/* TAB 9: DOKUMENTI */}
          {activeTab === 'dokumenti' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Svi povezani dokumenti i nalozi
              </h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Ukupno kalkulacija:</span>
                  <span className="font-mono font-bold">{productCalculations.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Ukupno nivelacija:</span>
                  <span className="font-mono font-bold">{productAdjustments.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Ukupno POS računa:</span>
                  <span className="font-mono font-bold">{productSales.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Skladišnih kretanja:</span>
                  <span className="font-mono font-bold">{productMovements.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: IDENTIFIKATORI */}
          {activeTab === 'identifikatori' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Dodatni barkodovi i dobavljački kodovi
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-slate-200 p-3.5 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">Glavni EAN-13 Barkod</span>
                    <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-semibold">
                      Primarni
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                    {product.barcode}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3.5 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">Interni SKU Kod</span>
                    <span className="rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[10px] font-semibold">
                      Kataloški
                    </span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-200">
                    {product.sku}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
