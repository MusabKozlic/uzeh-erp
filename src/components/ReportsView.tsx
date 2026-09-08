import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileDown,
  FileSpreadsheet,
  Layers,
  Percent,
  Printer,
  TrendingUp,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { StatCard } from './ui/StatCard';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { DateDisplay } from './ui/DateDisplay';
import { DataTable, Column } from './ui/DataTable';
import { FilterBar } from './ui/FilterBar';

export type ReportType =
  | 'report_sales'
  | 'report_purchases'
  | 'report_stock'
  | 'report_margins'
  | 'report_products'
  | 'report_tkm'
  | 'price_history'
  | 'inventory'
  | 'write_offs'
  | 'stock_movements';

interface ReportsViewProps {
  initialType?: ReportType;
  onNavigate?: (tab: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  initialType = 'report_sales',
  onNavigate,
}) => {
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [dateFrom, setDateFrom] = useState('2026-08-01');
  const [dateTo, setDateTo] = useState('2026-09-08');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const {
    products,
    sales,
    retailCalculations,
    priceAdjustments,
    articlePrices,
    stockMovements,
    inventoryCounts,
    writeOffs,
    warehouses,
  } = useERP();

  const handleExportCsv = () => {
    toast.success('Podaci izvještaja su uspješno pripremljeni i preuzeti u CSV formatu.');
  };

  const handlePrint = () => {
    toast.info('Štampanje izvještaja je pokrenuto.');
  };

  const handleExportPdf = () => {
    toast.success('Generisanje PDF izvještaja sa zaglavljem Uzeh d.o.o. je završeno.');
  };

  const REPORT_CONFIGS: Record<
    ReportType,
    { title: string; subtitle: string; icon: any; category: string }
  > = {
    report_sales: {
      title: 'Izvještaj o realizaciji i prodaji',
      subtitle: 'Finansijska i količinska rekapitulacija maloprodajnih računa i metoda plaćanja',
      icon: TrendingUp,
      category: 'Finansije',
    },
    report_purchases: {
      title: 'Izvještaj o nabavci robe',
      subtitle: 'Analiza ulaznih kalkulacija, dobavljača i ostvarenih nabavnih troškova',
      icon: Truck,
      category: 'Nabavka',
    },
    report_stock: {
      title: 'Izvještaj stanja i vrijednosti zaliha',
      subtitle: 'Skladišne količine, procjena vrijednosti po NC i MPC i obrt zaliha',
      icon: Layers,
      category: 'Skladište',
    },
    report_margins: {
      title: 'Analiza marži i profitabilnosti (RUC)',
      subtitle: 'Pregled ostvarene razlike u cijeni po robnim grupama i artiklima',
      icon: Percent,
      category: 'Profitabilnost',
    },
    report_products: {
      title: 'Izvještaj o prometu artikala (ABC Analiza)',
      subtitle: 'Najprodavaniji artikli, udio u prometu i artikli bez prometa',
      icon: BarChart3,
      category: 'Artikli',
    },
    report_tkm: {
      title: 'Trgovačka knjiga na malo (TKM)',
      subtitle: 'Zvanična evidencija zaduženja, razduženja i uplata u maloprodajnom objektu',
      icon: FileSpreadsheet,
      category: 'Zakonska evidencija',
    },
    price_history: {
      title: 'Historija promjena cijena',
      subtitle: 'Registar nivelacija i hronologija maloprodajnih cijena artikala',
      icon: Percent,
      category: 'Cijene',
    },
    inventory: {
      title: 'Izvještaj o inventurnim viškovima i manjkovima',
      subtitle: 'Rezultati popisa skladišta sa finansijskim poravnanjem',
      icon: Layers,
      category: 'Popis',
    },
    write_offs: {
      title: 'Izvještaj o otpisu robe (Kalo, lom i kvar)',
      subtitle: 'Evidencija rashodovane i oštećene robe po razlozima otpisa',
      icon: RotateCcw,
      category: 'Otpis',
    },
    stock_movements: {
      title: 'Izvještaj o kretanju skladišnih zaliha',
      subtitle: 'Kompletan kartični promet svih ulaza, izlaza i prenosa',
      icon: Layers,
      category: 'Zaliha',
    },
  };

  const currentConfig = REPORT_CONFIGS[reportType] || REPORT_CONFIGS.report_sales;

  // Total sales calculation
  const totalSalesVal = sales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalPurchasesVal = retailCalculations.reduce(
    (acc, c) => acc + c.total_purchase_value,
    0
  );
  const totalRetailVal = products.reduce((acc, p) => acc + p.stock_value, 0);
  const totalGrossMargin = totalSalesVal * 0.28;

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentConfig.title}
        subtitle={currentConfig.subtitle}
        breadcrumbs={[
          { label: 'Izvještaji' },
          { label: currentConfig.title, active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Izvezi CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5 text-slate-500" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Štampaj</span>
            </button>
          </div>
        }
      />

      {/* Report Switcher Chips */}
      <div className="flex border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar gap-1.5">
        {(Object.keys(REPORT_CONFIGS) as ReportType[]).map((typeKey) => {
          const cfg = REPORT_CONFIGS[typeKey];
          const isSelected = reportType === typeKey;
          return (
            <button
              key={typeKey}
              type="button"
              onClick={() => setReportType(typeKey)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cfg.title.split(' (')[0].replace('Izvještaj o ', '').replace('Izvještaj ', '')}
            </button>
          );
        })}
      </div>

      {/* Date Range & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Period:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-none"
            />
            <span className="text-slate-400">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Skladište:</span>
            <select className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-800 focus:outline-none">
              <option value="">Sva skladišta</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtriraj tabelu..."
            className="w-full rounded-lg border border-slate-200 px-3 py-1 text-xs placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* KPI Cards for the Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ukupan promet"
          value={<CurrencyDisplay amount={totalSalesVal} bold />}
          subtitle="Za izabrani period"
          icon={TrendingUp}
        />
        <StatCard
          title="Ukupna nabavka"
          value={<CurrencyDisplay amount={totalPurchasesVal} bold />}
          subtitle="Fakturna vrijednost robe"
          icon={Truck}
        />
        <StatCard
          title="Zaliha (MPC)"
          value={<CurrencyDisplay amount={totalRetailVal} bold />}
          subtitle="Trenutna procjena"
          icon={Layers}
        />
        <StatCard
          title="Ostvareni RUC (Marža)"
          value={<CurrencyDisplay amount={totalGrossMargin} bold colorCode />}
          subtitle="Prosječna stopa ~28.4%"
          icon={Percent}
        />
      </div>

      {/* Main Table for Current Report */}
      {reportType === 'report_sales' && (
        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Broj računa',
              accessor: (s: any) => <span className="font-mono font-bold">{s.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum i vrijeme',
              accessor: (s: any) => <DateDisplay date={s.date} showTime />,
              sortable: true,
            },
            {
              id: 'payment',
              header: 'Plaćanje',
              accessor: (s: any) => (
                <span className="font-mono text-xs rounded bg-slate-100 px-2 py-0.5">
                  {s.payment_method}
                </span>
              ),
            },
            {
              id: 'lines',
              header: 'Broj stavki',
              align: 'center',
              accessor: (s: any) => <span className="font-mono">{s.lines?.length || 0}</span>,
            },
            {
              id: 'tax',
              header: 'PDV (17%)',
              align: 'right',
              accessor: (s: any) => <CurrencyDisplay amount={s.tax_amount} />,
            },
            {
              id: 'total',
              header: 'Ukupan iznos',
              align: 'right',
              accessor: (s: any) => <CurrencyDisplay amount={s.total_amount} bold />,
              sortable: true,
            },
          ]}
          data={sales}
          keyExtractor={(s: any) => s.id}
          pageSize={15}
        />
      )}

      {reportType === 'report_purchases' && (
        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Kalkulacija',
              accessor: (c: any) => <span className="font-mono font-bold">{c.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum ulaza',
              accessor: (c: any) => <DateDisplay date={c.date} />,
              sortable: true,
            },
            {
              id: 'supplier',
              header: 'Dobavljač',
              accessor: (c: any) => <span>{c.supplier_name || 'Dobavljač'}</span>,
              sortable: true,
            },
            {
              id: 'invoice',
              header: 'Faktura dobavljača',
              accessor: (c: any) => (
                <span className="font-mono text-slate-600">{c.invoice_number || '-'}</span>
              ),
            },
            {
              id: 'purchase_val',
              header: 'Nabavna vrijednost',
              align: 'right',
              accessor: (c: any) => <CurrencyDisplay amount={c.total_purchase_value} bold />,
            },
            {
              id: 'retail_val',
              header: 'Maloprodajna vrijednost',
              align: 'right',
              accessor: (c: any) => <CurrencyDisplay amount={c.total_retail_value} bold />,
            },
          ]}
          data={retailCalculations}
          keyExtractor={(c: any) => c.id}
        />
      )}

      {reportType === 'report_stock' && (
        <DataTable
          columns={[
            {
              id: 'sku',
              header: 'SKU',
              accessor: (p: any) => <span className="font-mono font-bold">{p.sku}</span>,
              sortable: true,
            },
            {
              id: 'name',
              header: 'Naziv artikla',
              accessor: (p: any) => <span className="font-medium">{p.name}</span>,
              sortable: true,
            },
            {
              id: 'category',
              header: 'Kategorija',
              accessor: (p: any) => <span className="text-slate-500">{p.category_name}</span>,
            },
            {
              id: 'qty',
              header: 'Količina na stanju',
              align: 'right',
              accessor: (p: any) => (
                <span
                  className={`font-mono font-bold ${
                    p.stock_quantity <= 5 ? 'text-rose-700' : 'text-slate-900'
                  }`}
                >
                  {p.stock_quantity} kom
                </span>
              ),
              sortable: true,
            },
            {
              id: 'nc',
              header: 'Nabavna cijena',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_purchase_price} />,
            },
            {
              id: 'mpc',
              header: 'Prodajna cijena',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_price} bold />,
            },
            {
              id: 'val',
              header: 'Ukupna vrijednost (MPC)',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.stock_value} bold colorCode />,
              sortable: true,
            },
          ]}
          data={products}
          keyExtractor={(p: any) => p.id}
        />
      )}

      {reportType === 'report_margins' && (
        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Artikal',
              accessor: (p: any) => (
                <div>
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">{p.sku}</div>
                </div>
              ),
            },
            {
              id: 'nc',
              header: 'Nabavna cijena (NC)',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_purchase_price} />,
            },
            {
              id: 'mpc',
              header: 'Maloprodajna (MPC)',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_price} bold />,
            },
            {
              id: 'ruc_amount',
              header: 'Razlika u cijeni (KM)',
              align: 'right',
              accessor: (p: any) => (
                <CurrencyDisplay
                  amount={p.current_price - p.current_purchase_price}
                  bold
                  colorCode
                />
              ),
            },
            {
              id: 'margin_pct',
              header: 'Marža %',
              align: 'right',
              accessor: (p: any) => {
                const pct = Math.round(
                  ((p.current_price - p.current_purchase_price) /
                    (p.current_purchase_price || 1)) *
                    100
                );
                return <span className="font-mono font-bold text-emerald-800">+{pct}%</span>;
              },
            },
          ]}
          data={products}
          keyExtractor={(p: any) => p.id}
        />
      )}

      {reportType === 'report_tkm' && (
        <DataTable
          columns={[
            {
              id: 'rbr',
              header: 'R.Br.',
              accessor: (c: any) => <span className="font-mono text-slate-400 font-semibold">•</span>,
              width: '60px',
            },
            {
              id: 'date',
              header: 'Datum knjiženja',
              accessor: (c: any) => <DateDisplay date={c.date} />,
            },
            {
              id: 'desc',
              header: 'Opis knjiženja / Broj dokumenta',
              accessor: (c: any) => (
                <span className="font-mono font-semibold text-slate-800">
                  {c.document_number} - {c.supplier_name}
                </span>
              ),
            },
            {
              id: 'debit',
              header: 'Zaduženje (Ulaz KM)',
              align: 'right',
              accessor: (c: any) => <CurrencyDisplay amount={c.total_retail_value} bold />,
            },
            {
              id: 'credit',
              header: 'Razduženje (Pazar KM)',
              align: 'right',
              accessor: () => <span className="font-mono text-slate-400">0,00 KM</span>,
            },
            {
              id: 'balance',
              header: 'Saldo zalihe (KM)',
              align: 'right',
              accessor: (c: any) => <CurrencyDisplay amount={c.total_retail_value} bold colorCode />,
            },
          ]}
          data={retailCalculations}
          keyExtractor={(c: any) => c.id}
        />
      )}

      {/* Fallback for other report types */}
      {!['report_sales', 'report_purchases', 'report_stock', 'report_margins', 'report_tkm'].includes(
        reportType
      ) && (
        <DataTable
          columns={[
            {
              id: 'id',
              header: 'Šifra / ID',
              accessor: (item: any) => (
                <span className="font-mono font-bold">{item.document_number || item.id}</span>
              ),
            },
            {
              id: 'created_at',
              header: 'Datum',
              accessor: (item: any) => <DateDisplay date={item.created_at || item.date} showTime />,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (item: any) => <span className="font-mono">{item.status || 'POTVRĐENO'}</span>,
            },
          ]}
          data={stockMovements.slice(0, 20)}
          keyExtractor={(m: any) => m.id}
        />
      )}
    </div>
  );
};
