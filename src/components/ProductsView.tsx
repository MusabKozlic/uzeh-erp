import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Barcode,
  Boxes,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tag,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { Product } from '../types/erp';

interface ProductsViewProps {
  onOpenProductDetail?: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ onOpenProductDetail }) => {
  const {
    products,
    categories,
    units,
    taxRates,
    articlePrices,
    stockMovements,
    externalMappings,
    createProduct,
    triggerWebshopSync,
  } = useERP();

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK'>(
    'ALL'
  );
  const [sortBy, setSortBy] = useState<'sku' | 'name' | 'stock' | 'price' | 'value'>('sku');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdBarcode, setNewProdBarcode] = useState('');
  const [newProdCat, setNewProdCat] = useState(categories[0]?.id || '');
  const [newProdUnit, setNewProdUnit] = useState('unit-kom');
  const [newProdPurchasePrice, setNewProdPurchasePrice] = useState('0.00');
  const [newProdPrice, setNewProdPrice] = useState('0.00');
  const [formError, setFormError] = useState('');

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCat = selectedCategory === 'ALL' || p.category_id === selectedCategory;

        let matchesStock = true;
        if (stockFilter === 'IN_STOCK') matchesStock = p.stock_quantity > 0;
        if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.stock_quantity === 0;
        if (stockFilter === 'LOW_STOCK') matchesStock = p.stock_quantity > 0 && p.stock_quantity <= 2;

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortBy === 'sku') {
          compare = a.sku.localeCompare(b.sku, undefined, { numeric: true });
        } else if (sortBy === 'name') {
          compare = a.name.localeCompare(b.name);
        } else if (sortBy === 'stock') {
          compare = a.stock_quantity - b.stock_quantity;
        } else if (sortBy === 'price') {
          compare = a.current_price - b.current_price;
        } else if (sortBy === 'value') {
          compare = a.stock_value - b.stock_value;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      setFormError('Naziv artikla je obavezan.');
      return;
    }

    const purchase = parseFloat(newProdPurchasePrice) || 0;
    const price = parseFloat(newProdPrice) || 0;

    createProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim() || undefined,
      barcode: newProdBarcode.trim() || undefined,
      category_id: newProdCat,
      unit_id: newProdUnit,
      current_purchase_price: purchase,
      current_price: price,
    });

    setIsCreateOpen(false);
    setNewProdName('');
    setNewProdSku('');
    setNewProdBarcode('');
    setNewProdPurchasePrice('0.00');
    setNewProdPrice('0.00');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Katalog artikala (Master Data)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Prikaz {products.length} artikala iz baze TR "Uzeh". Zalihe se automatski računaju iz
            dnevnika promjena.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Novi artikal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži po nazivu, SKU šifri (npr. 130.) ili barkodu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Sve robne kategorije ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock filter */}
          <div>
            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">Svi statusi zaliha</option>
              <option value="IN_STOCK">Na stanju (&gt; 0)</option>
              <option value="LOW_STOCK">Kritično stanje (1 - 2 kom)</option>
              <option value="OUT_OF_STOCK">Nema na stanju (0 kom)</option>
            </select>
          </div>
        </div>

        {/* Sorting row */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Pronađeno rezultata:</span>
            <span className="font-semibold text-slate-800">{filteredProducts.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sortiraj po:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="sku">Šifra / SKU</option>
              <option value="name">Naziv artikla</option>
              <option value="stock">Stanje zalihe</option>
              <option value="price">MPC Cijena</option>
              <option value="value">Ukupna vrijednost</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="rounded p-1 text-slate-600 hover:bg-slate-100 font-bold"
              title="Promijeni smjer sortiranja"
            >
              {sortOrder === 'asc' ? '↑ Rast' : '↓ Pad'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold w-16">Šifra</th>
                <th className="py-3 px-4 font-semibold">Naziv artikla</th>
                <th className="py-3 px-3 font-semibold">Kategorija</th>
                <th className="py-3 px-3 font-semibold">Barkod</th>
                <th className="py-3 px-3 font-semibold text-center w-24">Stanje</th>
                <th className="py-3 px-3 font-semibold text-right">MPC Cijena</th>
                <th className="py-3 px-3 font-semibold text-right">Vrijednost zalihe</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Akcija</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nema artikala koji odgovaraju odabranim kriterijima pretrage.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const hasWebshop = externalMappings.some((m) => m.product_id === p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        if (onOpenProductDetail) {
                          onOpenProductDetail(p);
                        } else {
                          setSelectedProduct(p);
                        }
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{p.sku}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-slate-900">{p.name}</div>
                        {hasWebshop && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Uzeh.ba Webshop
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="inline-block max-w-[140px] truncate" title={p.category_name}>
                          {p.category_name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {p.barcode || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                            p.stock_quantity === 0
                              ? 'bg-rose-100 text-rose-700'
                              : p.stock_quantity <= 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset'
                          }`}
                        >
                          {p.stock_quantity} {p.unit_code || 'kom'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatBosnianCurrency(p.current_price)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatBosnianCurrency(p.stock_value)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(p);
                          }}
                          className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                          title="Detalji artikla i kartica"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div>
            Prikazano <span className="font-semibold">{paginatedProducts.length}</span> od{' '}
            <span className="font-semibold">{filteredProducts.length}</span> artikala
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Prethodna</span>
            </button>
            <span className="font-mono font-medium text-slate-700">
              Stranica {currentPage} od {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              <span>Sljedeća</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCT DETAILS DRAWER / MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {selectedProduct.sku}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedProduct.name}</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kategorija: <span className="font-medium text-slate-700">{selectedProduct.category_name}</span> •
                  Jedinica mjere: <span className="font-medium text-slate-700">{selectedProduct.unit_code}</span> •
                  PDV: 17%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="text-[11px] text-slate-500">Stanje zaliha</span>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedProduct.stock_quantity} kom
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="text-[11px] text-slate-500">Trenutna MPC</span>
                <div className="text-lg font-bold text-emerald-600 mt-0.5">
                  {formatBosnianCurrency(selectedProduct.current_price)}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
                <span className="text-[11px] text-slate-500">Nabavna cijena</span>
                <div className="text-lg font-bold text-slate-700 mt-0.5">
                  {formatBosnianCurrency(selectedProduct.current_purchase_price)}
                </div>
              </div>
            </div>

            {/* Webshop Sync Button */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 my-4">
              <div className="flex items-center gap-2 text-xs text-emerald-900">
                <RefreshCw className="h-4 w-4 text-emerald-600" />
                <span>
                  ERP je primarni izvor istine za cijene i stanje na Uzeh.ba webshopu.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerWebshopSync(selectedProduct.id);
                  alert(`Artikal "${selectedProduct.name}" uspješno sinhronizovan na Uzeh.ba webshop!`);
                }}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
              >
                <span>Pošalji na Webshop</span>
              </button>
            </div>

            {/* Price History */}
            <div className="my-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Istorija i nivelacije cijena artikla (ArticlePrice)
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Cijena (KM)</th>
                      <th className="py-2 px-3">Tip cijene</th>
                      <th className="py-2 px-3">Važi od</th>
                      <th className="py-2 px-3">Razlog / Izvor</th>
                      <th className="py-2 px-3">Kreirao</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {articlePrices
                      .filter((ap) => ap.product_id === selectedProduct.id)
                      .map((ap) => (
                        <tr key={ap.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {formatBosnianCurrency(ap.price)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                ap.price_type === 'ACTION'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ap.price_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono">{formatBosnianDate(ap.valid_from)}</td>
                          <td className="py-2 px-3 text-slate-600">{ap.reason || '—'}</td>
                          <td className="py-2 px-3 text-slate-500">{ap.created_by || 'Sistem'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Movement Log for this product */}
            <div className="my-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Boxes className="h-3.5 w-3.5" /> Dnevnik promjena zalihe (Stock Movements)
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Datum</th>
                      <th className="py-2 px-3">Tip kretanja</th>
                      <th className="py-2 px-3">Dokument</th>
                      <th className="py-2 px-3 text-right">Količina</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockMovements
                      .filter((m) => m.product_id === selectedProduct.id)
                      .map((m) => (
                        <tr key={m.id}>
                          <td className="py-2 px-3 font-mono text-slate-500">
                            {formatBosnianDate(m.created_at)}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                m.quantity > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-800">
                            {m.reference_number || m.reference_type}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono font-bold ${
                              m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity} kom
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PRODUCT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Kreiranje novog artikla u ERP-u</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-md bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Naziv artikla *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Sat Curren Chrono Crni"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Šifra / SKU</label>
                  <input
                    type="text"
                    placeholder="npr. 302."
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Barkod (EAN-13)</label>
                  <input
                    type="text"
                    placeholder="387000100302"
                    value={newProdBarcode}
                    onChange={(e) => setNewProdBarcode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Robna kategorija</label>
                  <select
                    value={newProdCat}
                    onChange={(e) => setNewProdCat(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jedinica mjere</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Fakturna / Nabavna cijena (KM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPurchasePrice}
                    onChange={(e) => setNewProdPurchasePrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Maloprodajna cijena MPC (KM)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Sačuvaj artikal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
