import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode,
  Key,
  Layers,
  Lock,
  Server,
  ShieldAlert,
  Table,
} from 'lucide-react';
import { fullSqlSchema } from '../data/sqlSchema';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'rls' | 'functions'>('tables');

  const handleCopySql = () => {
    navigator.clipboard.writeText(fullSqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([fullSqlSchema], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'uzeh_erp_supabase_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tablesList = [
    {
      name: 'users',
      role: 'Korisnici i uloge (ADMIN, MANAGER, WAREHOUSE, SALES, ACCOUNTING)',
      columns: 'id, email, full_name, role, is_active, created_at',
    },
    {
      name: 'warehouses',
      role: 'Skladišta i prodajni objekti (npr. TR Uzeh Prodavnica)',
      columns: 'id, code, name, address, city, is_active, created_at',
    },
    {
      name: 'tax_rates',
      role: 'Poreske stope u BiH (PDV 17%, E tarifa)',
      columns: 'id, code, rate, description, is_active',
    },
    {
      name: 'units_of_measure',
      role: 'Jedinice mjere (kom, kg, lit, pak, par)',
      columns: 'code, name, is_fractional',
    },
    {
      name: 'categories',
      role: 'Hijerarhijske kategorije proizvoda (self-referential parent_id)',
      columns: 'id, code, name, parent_id, is_active',
    },
    {
      name: 'partners',
      role: 'Dobavljači i kupci (JIB, PIB/PDV broj, adresa, kontakt)',
      columns: 'id, type, name, jib, pdv_number, address, city, phone, email',
    },
    {
      name: 'products',
      role: 'Centralni master artikala (Šifra, Naziv, Barkod, MPC, JM, PDV)',
      columns: 'id, sku, barcode, name, unit_code, category_id, tax_rate_id, is_active',
    },
    {
      name: 'article_prices',
      role: 'Verzionirana historija nabavnih i maloprodajnih cijena',
      columns: 'id, product_id, purchase_price, retail_price, valid_from, valid_to',
    },
    {
      name: 'stock_movements',
      role: 'Event Sourcing dnevnik kretanja zaliha (nemutabilno)',
      columns: 'id, product_id, warehouse_id, movement_type, quantity, unit_cost, reference_id',
    },
    {
      name: 'retail_calculations',
      role: 'Kalkulacije maloprodajnih cijena (Zaduženje robe/ulaz)',
      columns: 'id, document_number, supplier_id, warehouse_id, invoice_number, status, totals',
    },
    {
      name: 'retail_calculation_lines',
      role: 'Stavke kalkulacije (Fakturna cijena, Marža/RUC, MPC, PDV)',
      columns: 'id, calculation_id, product_id, quantity, purchase_price, margin_pct, selling_price',
    },
    {
      name: 'price_adjustments',
      role: 'Nivelacije cijena (promjena MPC na zalihama)',
      columns: 'id, document_number, reason, status, total_difference, created_by',
    },
    {
      name: 'price_adjustment_lines',
      role: 'Stavke nivelacije (Stara MPC, Nova MPC, Razlika)',
      columns: 'id, price_adjustment_id, product_id, quantity, old_price, new_price, difference',
    },
    {
      name: 'sales',
      role: 'Maloprodajni računi i prodaja sa kase',
      columns: 'id, document_number, warehouse_id, customer_id, total_amount, status, created_by',
    },
    {
      name: 'audit_logs',
      role: 'Neizmjenjivi revizijski trag svih sistemskih akcija i knjiženja',
      columns: 'id, user_id, action, entity_name, entity_id, details, ip_address, created_at',
    },
    {
      name: 'external_mappings',
      role: 'Mapiranje ERP šifara sa Uzeh.ba webshop katalogom',
      columns: 'id, product_id, external_source, external_id, last_synced_at',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Supabase PostgreSQL Baza podataka & DDL Šema
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kompletna relaciono-analitička šema za Uzeh ERP sa RLS sigurnosnim polisama i stored
            funkcijama za atomarno knjiženje.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSql}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Preuzmi .sql skript</span>
          </button>

          <button
            type="button"
            onClick={handleCopySql}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Kopirano!' : 'Kopiraj SQL šemu'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'tables'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Table className="h-4 w-4" />
          <span>Pregled tabela ({tablesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sql')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Kompletan SQL DDL (Ready for Supabase)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rls')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'rls'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Sigurnost & RLS Polise</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('functions')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'functions'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="h-4 w-4" />
          <span>Stored Procedure (Knjiženje)</span>
        </button>
      </div>

      {/* TAB: TABLES */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tablesList.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-600" />
                  <span className="font-mono font-bold text-slate-900 text-sm">{t.name}</span>
                </div>
                <span className="text-[10px] rounded bg-slate-100 px-2 py-0.5 text-slate-600 font-mono">
                  PostgreSQL
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{t.role}</p>
              <div className="mt-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ključne kolone:
                </span>
                <p className="font-mono text-[11px] text-slate-500 truncate mt-0.5">{t.columns}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: SQL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 shadow-xs text-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-mono text-emerald-400 font-bold">schema.sql • Supabase Migration</span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1 text-slate-400 hover:text-white"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Kopiraj sve</span>
            </button>
          </div>
          <pre className="mt-4 text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed text-slate-300">
            {fullSqlSchema}
          </pre>
        </div>
      )}

      {/* TAB: RLS */}
      {activeTab === 'rls' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Row Level Security (RLS) Arhitektura
            </h3>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Svaka tabela u šemi ima aktiviran <code>ALTER TABLE ... ENABLE ROW LEVEL SECURITY;</code>.
            Dozvole za pristup i izmjene se automatski provjeravaju na nivou svakog SQL upita na
            osnovu korisnikove uloge (<code>role</code>):
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900 mb-1">
                ADMIN & MANAGER (Potpuna kontrola)
              </div>
              <p className="text-slate-600">
                Imaju pravo kreiranja, pregleda i knjiženja svih dokumenata, kao i pristup
                revizijskom tragu (<code>audit_logs</code>).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900 mb-1">WAREHOUSE (Skladištar)</div>
              <p className="text-slate-600">
                Pristup kreiranju kalkulacija (ulaz robe), inventurnih popisa i naloga za otpis. Nema
                pravo mijenjanja prodajnih cijena niti brisanja proknjiženih dokumenata.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
              <div className="font-bold text-slate-900 mb-1">SALES (Kasa / Trgovac)</div>
              <p className="text-slate-600">
                Ima pravo izdavanja maloprodajnih računa (<code>sales</code>), pregleda artikala i
                provjere trenutnog stanja zaliha na svom skladištu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FUNCTIONS */}
      {activeTab === 'functions' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              PostgreSQL Stored Funkcije (Transakcije)
            </h3>
          </div>
          <p className="text-slate-600">
            Sve poslovne operacije knjiženja se izvršavaju unutar jedne atomične bazične transakcije
            kako bi se spriječila nekonzistentnost podataka.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 font-mono text-[11px]">
              <div className="font-bold text-slate-900 text-xs mb-1 font-sans">
                1. post_retail_calculation(calc_id UUID, user_id UUID)
              </div>
              <p className="text-slate-600 font-sans text-xs mb-2">
                Provjerava da li je kalkulacija u statusu DRAFT, zaključava je u POSTED, ubacuje
                odgovarajuće <code>stock_movements</code> za svaki artikal (vrsta PURCHASE) i ažurira
                verzionirani cjenovnik <code>article_prices</code>.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 font-mono text-[11px]">
              <div className="font-bold text-slate-900 text-xs mb-1 font-sans">
                2. post_price_adjustment(adjustment_id UUID, user_id UUID)
              </div>
              <p className="text-slate-600 font-sans text-xs mb-2">
                Zatvara prethodno važeće zapise u <code>article_prices</code> postavljanjem{' '}
                <code>valid_to = NOW()</code> i ubacuje nove važeće zapise sa novom cijenom.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
