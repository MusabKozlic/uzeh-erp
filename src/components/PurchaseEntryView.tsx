import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  Building,
  Store,
  Calendar,
  FileText,
  Printer,
  FileDown,
  CheckCircle2,
  Search,
  Package,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from './ui/PageHeader';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { CurrencyDisplay } from './ui/CurrencyDisplay';
import { FormDialog } from './ui/FormDialog';

interface PurchaseLine {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  barcode: string;
  quantity: number;
  purchase_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
}

export const PurchaseEntryView: React.FC = () => {
  const { partners, warehouses, products, activeWarehouse } = useERP();
  const toast = useToast();

  const suppliers = partners.filter((p) => p.roles.includes('SUPPLIER'));

  // Header State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('FAK-2026/0891');
  const [invoiceDate, setInvoiceDate] = useState('2026-09-08');
  const [entryDate, setEntryDate] = useState('2026-09-08');
  const [warehouseId, setWarehouseId] = useState(activeWarehouse.id);
  const [notes, setNotes] = useState('Isporuka po ugovoru br. 12/2026');

  // Lines State
  const [lines, setLines] = useState<PurchaseLine[]>([
    {
      id: 'pl-1',
      product_id: products[0]?.id || 'p-1',
      product_name: products[0]?.name || '3D LED Noćna Lampa Medo',
      sku: products[0]?.sku || 'ART-001',
      barcode: products[0]?.barcode || '3871234567890',
      quantity: 20,
      purchase_price: 12.5,
      discount_percent: 5,
      tax_rate: 17,
      total: 277.88,
    },
    {
      id: 'pl-2',
      product_id: products[1]?.id || 'p-2',
      product_name: products[1]?.name || 'Bežične Bluetooth Slušalice Pro',
      sku: products[1]?.sku || 'ART-002',
      barcode: products[1]?.barcode || '3871234567891',
      quantity: 15,
      purchase_price: 32.0,
      discount_percent: 0,
      tax_rate: 17,
      total: 561.6,
    },
  ]);

  // Dialogs
  const [isConfirmPostOpen, setIsConfirmPostOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productSelectionMode, setProductSelectionMode] = useState<'existing' | 'new'>('existing');

  // New Product Modal Fields
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductBarcode, setNewProductBarcode] = useState('');
  const [newProductPrice, setNewProductPrice] = useState(25.0);
  const [newProductPurchasePrice, setNewProductPurchasePrice] = useState(15.0);

  // Line calculations
  const calculateLineTotal = (qty: number, price: number, discount: number, tax: number) => {
    const discountedPrice = price * (1 - discount / 100);
    const subtotal = qty * discountedPrice;
    const withTax = subtotal * (1 + tax / 100);
    return Math.round(withTax * 100) / 100;
  };

  const handleUpdateLine = (id: string, field: keyof PurchaseLine, val: any) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, [field]: val };
        updated.total = calculateLineTotal(
          Number(updated.quantity) || 0,
          Number(updated.purchase_price) || 0,
          Number(updated.discount_percent) || 0,
          Number(updated.tax_rate) || 17
        );
        return updated;
      })
    );
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
    toast.info('Stavka je uklonjena iz ulaza robe.');
  };

  const handleAddExistingProduct = (productId: string) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return;
    const newLine: PurchaseLine = {
      id: `pl-${Date.now()}`,
      product_id: p.id,
      product_name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      quantity: 10,
      purchase_price: p.current_purchase_price || 10,
      discount_percent: 0,
      tax_rate: 17,
      total: calculateLineTotal(10, p.current_purchase_price || 10, 0, 17),
    };
    setLines((prev) => [...prev, newLine]);
    setIsAddProductModalOpen(false);
    toast.success(`Artikal "${p.name}" je dodan u stavke.`);
  };

  const handleCreateNewProduct = () => {
    if (!newProductName || !newProductSku) {
      toast.error('Molimo unesite naziv i SKU artikla.');
      return;
    }
    const newLine: PurchaseLine = {
      id: `pl-${Date.now()}`,
      product_id: `prod-temp-${Date.now()}`,
      product_name: newProductName,
      sku: newProductSku,
      barcode: newProductBarcode || '3870000000000',
      quantity: 10,
      purchase_price: Number(newProductPurchasePrice) || 10,
      discount_percent: 0,
      tax_rate: 17,
      total: calculateLineTotal(10, Number(newProductPurchasePrice) || 10, 0, 17),
    };
    setLines((prev) => [...prev, newLine]);
    setIsAddProductModalOpen(false);
    setNewProductName('');
    setNewProductSku('');
    setNewProductBarcode('');
    toast.success(`Novi artikal "${newProductName}" je dodan.`);
  };

  // Totals calculations
  const totalFakturna = lines.reduce(
    (acc, l) => acc + (Number(l.quantity) || 0) * (Number(l.purchase_price) || 0),
    0
  );
  const totalRabat = lines.reduce(
    (acc, l) =>
      acc +
      (Number(l.quantity) || 0) *
        (Number(l.purchase_price) || 0) *
        ((Number(l.discount_percent) || 0) / 100),
    0
  );
  const totalOsnovica = totalFakturna - totalRabat;
  const totalPdv = totalOsnovica * 0.17;
  const grandTotal = totalOsnovica + totalPdv;

  const handleSaveDraft = () => {
    toast.success('Nacrt ulaza robe je uspješno sačuvan.');
  };

  const handlePostDocument = () => {
    setIsConfirmPostOpen(false);
    toast.success('Dokument ulaza robe je uspješno proknjižen! Zaliha je ažurirana.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novi ulaz robe (Prijemnica)"
        subtitle="Unos nabavnog računa dobavljača i automatsko formiranje ulazne kalkulacije i zalihe"
        breadcrumbs={[
          { label: 'Nabavka' },
          { label: 'Ulaz robe', active: true },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.info('Generisanje PDF naloga za prijem robe...')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <FileDown className="h-3.5 w-3.5 text-slate-500" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => toast.info('Štampanje prijemnice...')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Štampaj</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              Sačuvaj nacrt
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmPostOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Knjiži prijem</span>
            </button>
          </div>
        }
      />

      {/* Document Header Form */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Zaglavlje ulaznog dokumenta
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Dobavljač</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Broj računa dobavljača</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="npr. 12-2026"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Datum računa</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Datum ulaza robe</label>
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Ulazno skladište</label>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1 text-xs">Napomena uz ulaz</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dodatne napomene za knjigovodstvo ili skladište..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Lines Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Stavke prijema robe ({lines.length})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Dodaj stavku / artikal</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-3.5 py-2.5">Artikal / Naziv</th>
                <th className="px-3.5 py-2.5">Barkod</th>
                <th className="px-3.5 py-2.5 text-right w-24">Količina</th>
                <th className="px-3.5 py-2.5 text-right w-28">Nabavna cijena</th>
                <th className="px-3.5 py-2.5 text-right w-24">Rabat %</th>
                <th className="px-3.5 py-2.5 text-right w-20">PDV %</th>
                <th className="px-3.5 py-2.5 text-right w-32">Ukupno (KM)</th>
                <th className="px-3.5 py-2.5 text-center w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/60">
                  <td className="px-3.5 py-2.5">
                    <div className="font-semibold text-slate-800">{line.product_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">SKU: {line.sku}</div>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600">{line.barcode}</td>
                  <td className="px-3.5 py-2.5 text-right">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => handleUpdateLine(line.id, 'quantity', Number(e.target.value))}
                      className="w-20 rounded border border-slate-200 px-2 py-1 text-right font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.purchase_price}
                      onChange={(e) =>
                        handleUpdateLine(line.id, 'purchase_price', Number(e.target.value))
                      }
                      className="w-24 rounded border border-slate-200 px-2 py-1 text-right font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={line.discount_percent}
                      onChange={(e) =>
                        handleUpdateLine(line.id, 'discount_percent', Number(e.target.value))
                      }
                      className="w-16 rounded border border-slate-200 px-2 py-1 text-right font-mono text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-slate-700">
                    {line.tax_rate}%
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono font-bold text-slate-900">
                    <CurrencyDisplay amount={line.total} bold />
                  </td>
                  <td className="px-3.5 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Ukloni stavku"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Summary Footer */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500">
            Automatski se kreira nalog za prijem u magacin i kalkulacija veleprodajne i maloprodajne
            marže.
          </div>
          <div className="flex flex-wrap items-baseline gap-6 justify-end text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Fakturna vrijednost:</span>
              <CurrencyDisplay amount={totalFakturna} className="text-sm font-semibold" />
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Ukupan rabat:</span>
              <CurrencyDisplay amount={totalRabat} className="text-sm font-semibold text-rose-700" />
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Osnovica za PDV:</span>
              <CurrencyDisplay amount={totalOsnovica} className="text-sm font-semibold" />
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">PDV 17%:</span>
              <CurrencyDisplay amount={totalPdv} className="text-sm font-semibold" />
            </div>
            <div className="border-l border-slate-200 pl-6">
              <span className="text-slate-500 block text-[11px]">Za platiti / Ukupno:</span>
              <CurrencyDisplay
                amount={grandTotal}
                className="text-lg font-bold text-emerald-800"
                bold
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal (Existing vs New) */}
      <FormDialog
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Dodavanje artikla na ulaz robe"
        subtitle="Izaberite postojeći artikal iz kataloga ili kreirajte novi"
      >
        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setProductSelectionMode('existing')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                productSelectionMode === 'existing'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Postojeći artikal iz kataloga
            </button>
            <button
              type="button"
              onClick={() => setProductSelectionMode('new')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                productSelectionMode === 'new'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Kreiraj novi artikal
            </button>
          </div>

          {productSelectionMode === 'existing' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Kliknite na artikal za dodavanje u trenutni ulazni račun:
              </p>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddExistingProduct(prod.id)}
                    className="flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{prod.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        SKU: {prod.sku} • Barkod: {prod.barcode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        <CurrencyDisplay amount={prod.current_purchase_price} />
                      </div>
                      <div className="text-[10px] text-slate-400">Trenutna NC</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Naziv novog artikla *</label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="npr. LED Lampa Luna"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">SKU Šifra *</label>
                  <input
                    type="text"
                    value={newProductSku}
                    onChange={(e) => setNewProductSku(e.target.value)}
                    placeholder="ART-099"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Barkod</label>
                  <input
                    type="text"
                    value={newProductBarcode}
                    onChange={(e) => setNewProductBarcode(e.target.value)}
                    placeholder="3870000000000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nabavna cijena (NC)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductPurchasePrice}
                    onChange={(e) => setNewProductPurchasePrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Prodajna cijena (MPC)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateNewProduct}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  Sačuvaj i dodaj u stavke
                </button>
              </div>
            </div>
          )}
        </div>
      </FormDialog>

      {/* Confirmation Dialog for Posting */}
      <ConfirmDialog
        isOpen={isConfirmPostOpen}
        onClose={() => setIsConfirmPostOpen(false)}
        onConfirm={handlePostDocument}
        title="Da li ste sigurni da želite knjižiti ovaj dokument?"
        description="Knjiženjem će dokument biti zaključen i više ga neće biti moguće slobodno uređivati. Količine će automatski biti uknjižene na stanje zaliha."
        confirmLabel="Knjiži dokument"
        cancelLabel="Nazad"
        variant="post"
      />
    </div>
  );
};
