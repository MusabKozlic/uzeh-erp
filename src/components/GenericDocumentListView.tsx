import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Printer,
  FileDown,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Boxes,
  Truck,
  Building,
  Layers,
  Percent,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { StatCard } from './ui/StatCard';
import { DataTable } from './ui/DataTable';
import { FilterBar } from './ui/FilterBar';
import { StatusBadge } from './ui/StatusBadge';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { DateDisplay } from './ui/DateDisplay';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { FormDialog } from './ui/FormDialog';

export type DocumentViewType =
  | 'supplier_returns'
  | 'customer_returns'
  | 'transfers'
  | 'write_offs'
  | 'price_list'
  | 'stock_status'
  | 'brands'
  | 'units'
  | 'customers'
  | 'suppliers';

interface GenericDocumentListViewProps {
  type: DocumentViewType;
  onNavigate?: (tab: string) => void;
}

export const GenericDocumentListView: React.FC<GenericDocumentListViewProps> = ({
  type,
  onNavigate,
}) => {
  const {
    products,
    partners,
    warehouses,
    units,
    writeOffs,
    stockTransfers,
  } = useERP();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleExportCsv = () => {
    toast.success('Izvoz u CSV datoteku je uspješno završen.');
  };

  const handlePrint = () => {
    toast.info('Štampanje je pokrenuto...');
  };

  const handleExportPdf = () => {
    toast.success('PDF dokument je uspješno generisan.');
  };

  // 1. POVRAT DOBAVLJAČU
  if (type === 'supplier_returns') {
    const mockReturns = [
      {
        id: 'ret-1',
        document_number: 'POV-DOB-2026/001',
        date: '2026-09-02',
        supplier_name: 'TechTrade d.o.o. Sarajevo',
        reason: 'Oštećena ambalaža pri transportu',
        total_value: 340.5,
        status: 'KNJIŽENO',
      },
      {
        id: 'ret-2',
        document_number: 'POV-DOB-2026/002',
        date: '2026-09-06',
        supplier_name: 'DistriCentar Banja Luka',
        reason: 'Neodgovarajući model',
        total_value: 120.0,
        status: 'NACRT',
      },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Povrati dobavljačima"
          subtitle="Evidencija reklamacija, vraćene robe i odobrenja dobavljača"
          breadcrumbs={[{ label: 'Nabavka' }, { label: 'Povrat dobavljaču', active: true }]}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Novi povrat dobavljaču</span>
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Ukupno povrata" value={mockReturns.length} icon={RotateCcw} />
          <StatCard
            title="Ukupna vrijednost"
            value={<CurrencyDisplay amount={460.5} bold />}
            icon={FileSpreadsheet}
          />
          <StatCard title="U obradi (Nacrt)" value="1 dokument" icon={CheckCircle2} />
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Pretraži broj povrata, dobavljača ili razlog..."
        />

        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Broj povrata',
              accessor: (r) => <span className="font-mono font-bold">{r.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum',
              accessor: (r) => <DateDisplay date={r.date} />,
              sortable: true,
            },
            {
              id: 'supplier',
              header: 'Dobavljač',
              accessor: (r) => <span>{r.supplier_name}</span>,
              sortable: true,
            },
            {
              id: 'reason',
              header: 'Razlog povrata',
              accessor: (r) => <span className="text-slate-600">{r.reason}</span>,
            },
            {
              id: 'val',
              header: 'Iznos povrata',
              align: 'right',
              accessor: (r) => <CurrencyDisplay amount={r.total_value} bold />,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (r) => <StatusBadge status={r.status} />,
            },
          ]}
          data={mockReturns}
          keyExtractor={(r) => r.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Kreiranje povrata robe dobavljaču"
          subtitle="Izaberite dobavljača i artikle za razduženje"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Dobavljač</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-1.5">
                {partners
                  .filter((p) => p.roles.includes('SUPPLIER'))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Razlog reklamacije / povrata</label>
              <input
                type="text"
                placeholder="npr. Neispravan rad uređaja, oštećenje..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Nacrt povrata dobavljaču je kreiran.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Kreiraj nalog
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 2. POVRAT KUPCA
  if (type === 'customer_returns') {
    const mockCustomerReturns = [
      {
        id: 'cret-1',
        document_number: 'POV-KUP-2026/001',
        date: '2026-09-07',
        customer_name: 'Fizičko lice (Kupac)',
        invoice_ref: 'RAC-2026/000142',
        total_value: 39.9,
        status: 'KNJIŽENO',
      },
      {
        id: 'cret-2',
        document_number: 'POV-KUP-2026/002',
        date: '2026-09-08',
        customer_name: 'InfoMedia d.o.o.',
        invoice_ref: 'RAC-2026/000155',
        total_value: 79.9,
        status: 'NACRT',
      },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Povrati kupaca i reklamacije"
          subtitle="Povrat prodate robe, storno računa i povrat novca na kasi"
          breadcrumbs={[{ label: 'Prodaja' }, { label: 'Povrat kupca', active: true }]}
          actions={
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Novi povrat kupca</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Ukupno reklamacija" value={mockCustomerReturns.length} icon={RotateCcw} />
          <StatCard
            title="Iznos storniranog prometa"
            value={<CurrencyDisplay amount={119.8} bold />}
            icon={FileSpreadsheet}
          />
          <StatCard title="Stopa povrata" value="0.8%" subtitle="U granicama normale" icon={Percent} />
        </div>

        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Broj dokumenta',
              accessor: (r) => <span className="font-mono font-bold">{r.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum',
              accessor: (r) => <DateDisplay date={r.date} />,
              sortable: true,
            },
            {
              id: 'customer',
              header: 'Kupac',
              accessor: (r) => <span>{r.customer_name}</span>,
            },
            {
              id: 'invoice',
              header: 'Referenca na račun',
              accessor: (r) => <span className="font-mono text-slate-600">{r.invoice_ref}</span>,
            },
            {
              id: 'val',
              header: 'Iznos povrata',
              align: 'right',
              accessor: (r) => <CurrencyDisplay amount={r.total_value} bold colorCode />,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (r) => <StatusBadge status={r.status} />,
            },
          ]}
          data={mockCustomerReturns}
          keyExtractor={(r) => r.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Novi povrat od kupca"
          subtitle="Unesite broj računa i razlog povrata"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Broj fiskalnog računa</label>
              <input
                type="text"
                placeholder="npr. RAC-2026/000142"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Ime kupca / Napomena</label>
              <input
                type="text"
                placeholder="npr. Reklamacija za artikal ART-001..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Povrat kupca je zabilježen.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Potvrdi povrat
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 3. PRENOS IZMEĐU SKLADIŠTA
  if (type === 'transfers') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Međuskladišni prenos robe"
          subtitle="Otprema i doprema artikala između magacina i maloprodajnih objekata"
          breadcrumbs={[{ label: 'Zaliha' }, { label: 'Prenos između skladišta', active: true }]}
          actions={
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Novi međuskladišni prenos</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Ukupno prenosa" value={stockTransfers.length} icon={Truck} />
          <StatCard title="Status prenosa" value="Svi realizovani" icon={CheckCircle2} />
          <StatCard title="Aktivna skladišta" value={warehouses.length} icon={Boxes} />
        </div>

        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Broj prenosa',
              accessor: (t: any) => <span className="font-mono font-bold">{t.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum',
              accessor: (t: any) => <DateDisplay date={t.date} />,
              sortable: true,
            },
            {
              id: 'source',
              header: 'Izlazno skladište',
              accessor: (t: any) => <span className="font-semibold">{t.source_warehouse_name}</span>,
            },
            {
              id: 'dest',
              header: 'Ulazno skladište',
              accessor: (t: any) => <span className="font-semibold text-emerald-800">{t.destination_warehouse_name}</span>,
            },
            {
              id: 'items',
              header: 'Broj artikala',
              align: 'center',
              accessor: (t: any) => <span className="font-mono">{t.lines?.length || 0}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (t: any) => <StatusBadge status={t.status} />,
            },
          ]}
          data={stockTransfers}
          keyExtractor={(t: any) => t.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Kreiranje međuskladišnice"
          subtitle="Odaberite polazno i odredišno skladište"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Izlazno skladište</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-1.5">
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-600 mb-1">Ulazno skladište</label>
                <select className="w-full rounded-lg border border-slate-200 px-3 py-1.5">
                  {warehouses.slice().reverse().map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Napomena za prenos</label>
              <input
                type="text"
                placeholder="npr. Dopuna zalihe za vikend akciju..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Međuskladišnica je uspješno kreirana.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Kreiraj dokument
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 4. OTPIS ROBE
  if (type === 'write_offs') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Zapisnici o otpisu robe"
          subtitle="Rashodovanje oštećene robe, isteka roka, kala, loma i kvara"
          breadcrumbs={[{ label: 'Zaliha' }, { label: 'Otpis', active: true }]}
          actions={
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Novi zapisnik o otpisu</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Ukupno zapisnika" value={writeOffs.length} icon={Trash2} />
          <StatCard
            title="Ukupna otpisana vrijednost"
            value={<CurrencyDisplay amount={writeOffs.reduce((a, b) => a + b.total_value, 0)} bold />}
            icon={FileSpreadsheet}
          />
          <StatCard title="Komisija" value="Formirana" icon={CheckCircle2} />
        </div>

        <DataTable
          columns={[
            {
              id: 'doc',
              header: 'Broj zapisnika',
              accessor: (w: any) => <span className="font-mono font-bold">{w.document_number}</span>,
              sortable: true,
            },
            {
              id: 'date',
              header: 'Datum',
              accessor: (w: any) => <DateDisplay date={w.date} />,
              sortable: true,
            },
            {
              id: 'reason',
              header: 'Razlog otpisa',
              accessor: (w: any) => (
                <span className="font-semibold text-slate-800">{w.reason}</span>
              ),
            },
            {
              id: 'items',
              header: 'Broj artikala',
              align: 'center',
              accessor: (w: any) => <span className="font-mono">{w.lines?.length || 0}</span>,
            },
            {
              id: 'val',
              header: 'Ukupan iznos otpisa',
              align: 'right',
              accessor: (w: any) => <CurrencyDisplay amount={w.total_value} bold colorCode />,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (w: any) => <StatusBadge status={w.status} />,
            },
          ]}
          data={writeOffs}
          keyExtractor={(w: any) => w.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Novi zapisnik o otpisu robe"
          subtitle="Formirajte komisijski otpis sa razlogom i artiklima"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Razlog otpisa</label>
              <select className="w-full rounded-lg border border-slate-200 px-3 py-1.5">
                <option value="DAMAGED">Oštećenje robe / Lom</option>
                <option value="EXPIRED">Istekao rok trajanja</option>
                <option value="DEFECTIVE">Fabrički neispravan artikal</option>
                <option value="THEFT">Krađa ili nestanak</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Članovi komisije</label>
              <input
                type="text"
                defaultValue="Haris Dedić, Kenan Imamović, Amina Delić"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Zapisnik o otpisu je sačuvan.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Sačuvaj zapisnik
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 5. CJENOVNIK
  if (type === 'price_list') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Zvanični cjenovnik artikala"
          subtitle="Aktivne maloprodajne cijene sa uračunatim porezom (MPC) i trgovačke marže"
          breadcrumbs={[{ label: 'Cijene' }, { label: 'Cjenovnik', active: true }]}
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Štampaj cjenovnik</span>
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Preuzmi PDF cjenovnik</span>
              </button>
            </div>
          }
        />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Pretraži cjenovnik po nazivu, SKU ili barkodu..."
        />

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
              accessor: (p: any) => <span className="font-medium text-slate-900">{p.name}</span>,
              sortable: true,
            },
            {
              id: 'cat',
              header: 'Kategorija',
              accessor: (p: any) => <span className="text-slate-500">{p.category_name}</span>,
            },
            {
              id: 'nc',
              header: 'Fakturna NC',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_purchase_price} />,
            },
            {
              id: 'mpc',
              header: 'Maloprodajna cijena (MPC)',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.current_price} bold colorCode />,
              sortable: true,
            },
            {
              id: 'ruc',
              header: 'RUC (Marža)',
              align: 'right',
              accessor: (p: any) => {
                const diff = p.current_price - p.current_purchase_price;
                return <CurrencyDisplay amount={diff} className="font-mono text-emerald-800" />;
              },
            },
          ]}
          data={products}
          keyExtractor={(p: any) => p.id}
        />
      </div>
    );
  }

  // 6. STANJE ZALIHE
  if (type === 'stock_status') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Stanje zalihe robe"
          subtitle="Pregled raspoloživih količina, minimalnih nivoa i finansijske procjene zaliha"
          breadcrumbs={[{ label: 'Zaliha' }, { label: 'Stanje zalihe', active: true }]}
          actions={
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>Izvezi stanje (CSV)</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            title="Ukupno artikala"
            value={products.length}
            icon={Boxes}
          />
          <StatCard
            title="Ukupna količina"
            value={`${products.reduce((a, p) => a + p.stock_quantity, 0)} kom`}
            icon={Layers}
          />
          <StatCard
            title="Ukupna vrijednost (MPC)"
            value={<CurrencyDisplay amount={products.reduce((a, p) => a + p.stock_value, 0)} bold />}
            icon={FileSpreadsheet}
          />
          <StatCard
            title="Ispod minimuma"
            value={products.filter((p) => p.stock_quantity <= 5).length}
            subtitle="Potrebna narudžba"
            icon={Truck}
            trend={{ value: 'Kritično', isPositive: false }}
          />
        </div>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Pretraži zalihe po artiklu, šifri ili barkodu..."
        />

        <DataTable
          columns={[
            {
              id: 'sku',
              header: 'SKU',
              accessor: (p: any) => <span className="font-mono font-bold">{p.sku}</span>,
              sortable: true,
            },
            {
              id: 'barcode',
              header: 'Barkod',
              accessor: (p: any) => <span className="font-mono text-slate-500">{p.barcode}</span>,
            },
            {
              id: 'name',
              header: 'Naziv artikla',
              accessor: (p: any) => <span className="font-semibold text-slate-900">{p.name}</span>,
              sortable: true,
            },
            {
              id: 'stock',
              header: 'Raspoloživo',
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
              header: 'Vrijednost zalihe',
              align: 'right',
              accessor: (p: any) => <CurrencyDisplay amount={p.stock_value} bold colorCode />,
              sortable: true,
            },
          ]}
          data={products}
          keyExtractor={(p: any) => p.id}
        />
      </div>
    );
  }

  // 7. BRANDOVI
  if (type === 'brands') {
    const mockBrands = [
      { id: 'b-1', name: 'Uzeh Originals', description: 'Vlastiti brend dekorativne rasvjete', active: true, count: 18 },
      { id: 'b-2', name: 'SoundMax Audio', description: 'Audio oprema i bežične slušalice', active: true, count: 12 },
      { id: 'b-3', name: 'GamerGear Pro', description: 'Gaming periferija i LED podloge', active: true, count: 9 },
      { id: 'b-4', name: 'AromaZen', description: 'Aroma difuzeri i esencijalna ulja', active: true, count: 15 },
    ];

    return (
      <div className="space-y-6">
        <PageHeader
          title="Brendovi i robne marke"
          subtitle="Šifarnik proizvođača i robnih marki artikala"
          breadcrumbs={[{ label: 'Artikli' }, { label: 'Brendovi', active: true }]}
          actions={
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Novi brend</span>
            </button>
          }
        />

        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Naziv brenda',
              accessor: (b) => <span className="font-bold text-slate-900">{b.name}</span>,
              sortable: true,
            },
            {
              id: 'desc',
              header: 'Opis robne marke',
              accessor: (b) => <span className="text-slate-600">{b.description}</span>,
            },
            {
              id: 'count',
              header: 'Broj artikala',
              align: 'center',
              accessor: (b) => <span className="font-mono font-semibold">{b.count}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (b) => <StatusBadge status={b.active ? 'AKTIVAN' : 'NEAKTIVAN'} />,
            },
          ]}
          data={mockBrands}
          keyExtractor={(b) => b.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Kreiranje novog brenda"
          subtitle="Unesite naziv proizvođača ili trgovačke marke"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Naziv brenda *</label>
              <input
                type="text"
                placeholder="npr. Anker, Xiaomi, Baseus..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Kratak opis</label>
              <input
                type="text"
                placeholder="Opis asortimana..."
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Brend je uspješno kreiran.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Sačuvaj brend
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 8. JEDINICE MJERE
  if (type === 'units') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Jedinice mjere (JM)"
          subtitle="Standardni šifarnik mjernih jedinica za artikle i materijale"
          breadcrumbs={[{ label: 'Artikli' }, { label: 'Jedinice mjere', active: true }]}
          actions={
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Nova jedinica mjere</span>
            </button>
          }
        />

        <DataTable
          columns={[
            {
              id: 'code',
              header: 'Oznaka (Kod)',
              accessor: (u: any) => <span className="font-mono font-bold text-slate-900">{u.code}</span>,
              sortable: true,
            },
            {
              id: 'name',
              header: 'Puni naziv',
              accessor: (u: any) => <span className="font-semibold text-slate-800">{u.name}</span>,
              sortable: true,
            },
            {
              id: 'decimal',
              header: 'Dozvoljene decimale',
              accessor: (u: any) => (
                <span className="font-mono text-xs text-slate-600">
                  {u.decimal_allowed ? 'DA (npr. 1.250)' : 'NE (samo cijeli brojevi)'}
                </span>
              ),
            },
          ]}
          data={units}
          keyExtractor={(u: any) => u.id}
        />

        <FormDialog
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Nova jedinica mjere"
          subtitle="Unesite oznaku i naziv nove mjerne jedinice"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Oznaka (Kod) *</label>
              <input
                type="text"
                placeholder="npr. m, lit, pak, set"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1">Puni naziv *</label>
              <input
                type="text"
                placeholder="npr. Metar dužni, Litar, Pakovanje"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewModalOpen(false);
                  toast.success('Jedinica mjere je sačuvana.');
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                Sačuvaj
              </button>
            </div>
          </div>
        </FormDialog>
      </div>
    );
  }

  // 9. DOBAVLJAČI
  if (type === 'suppliers') {
    const suppliers = partners.filter((p) => p.roles.includes('SUPPLIER'));
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dobavljači robe i usluga"
          subtitle="Katalog poslovnih partnera od kojih se nabavlja roba"
          breadcrumbs={[{ label: 'Nabavka' }, { label: 'Dobavljači', active: true }]}
        />
        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Naziv dobavljača',
              accessor: (p: any) => <span className="font-bold text-slate-900">{p.name}</span>,
              sortable: true,
            },
            {
              id: 'jib',
              header: 'JIB',
              accessor: (p: any) => <span className="font-mono text-slate-500">{p.jib || '-'}</span>,
            },
            {
              id: 'city',
              header: 'Grad i adresa',
              accessor: (p: any) => <span>{p.city}, {p.address}</span>,
            },
            {
              id: 'contact',
              header: 'Kontakt',
              accessor: (p: any) => (
                <div className="text-[11px]">
                  <div>{p.phone}</div>
                  <div className="text-slate-400 font-mono">{p.email}</div>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (p: any) => <StatusBadge status={p.active ? 'AKTIVAN' : 'NEAKTIVAN'} />,
            },
          ]}
          data={suppliers}
          keyExtractor={(p: any) => p.id}
        />
      </div>
    );
  }

  // 10. KUPCI
  if (type === 'customers') {
    const customers = partners.filter((p) => p.roles.includes('CUSTOMER'));
    return (
      <div className="space-y-6">
        <PageHeader
          title="Kupci i komitenti"
          subtitle="Baza kupaca, ugovora, kreditnih limita i otvorenih stavki"
          breadcrumbs={[{ label: 'Prodaja' }, { label: 'Kupci', active: true }]}
        />
        <DataTable
          columns={[
            {
              id: 'name',
              header: 'Naziv kupca',
              accessor: (p: any) => <span className="font-bold text-slate-900">{p.name}</span>,
              sortable: true,
            },
            {
              id: 'type',
              header: 'Tip lica',
              accessor: (p: any) => (
                <span className="font-mono text-xs rounded bg-slate-100 px-2 py-0.5">
                  {p.type === 'LEGAL' ? 'Pravno lice' : 'Fizičko lice'}
                </span>
              ),
            },
            {
              id: 'city',
              header: 'Grad',
              accessor: (p: any) => <span>{p.city}</span>,
            },
            {
              id: 'contact',
              header: 'Telefon i E-mail',
              accessor: (p: any) => (
                <div className="text-[11px]">
                  <div>{p.phone}</div>
                  <div className="text-slate-400 font-mono">{p.email}</div>
                </div>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              accessor: (p: any) => <StatusBadge status={p.active ? 'AKTIVAN' : 'NEAKTIVAN'} />,
            },
          ]}
          data={customers}
          keyExtractor={(p: any) => p.id}
        />
      </div>
    );
  }

  return null;
};
