import React, { useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  Eye,
  FileCheck2,
  Minus,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  Trash2,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { Sale, SaleLine } from '../types/erp';

export const SalesView: React.FC = () => {
  const { sales, products, activeWarehouse, partners, createSale } = useERP();

  // POS State
  const [cart, setCart] = useState<
    Array<{
      productId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      availableStock: number;
    }>
  >([]);

  const [searchProduct, setSearchProduct] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pm-cash' | 'pm-card' | 'pm-bank'>('pm-cash');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [posError, setPosError] = useState<string | null>(null);

  // Cart calculations
  const totalGross = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const totalTax = totalGross * (17 / 117); // 17% VAT embedded in Bosnian retail MPC
  const totalNet = totalGross - totalTax;

  const addToCart = (productId: string) => {
    setPosError(null);
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    if (prod.stock_quantity <= 0) {
      setPosError(`Artikal "${prod.name}" nema raspoloživih zaliha na skladištu.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        if (existing.quantity + 1 > prod.stock_quantity) {
          setPosError(`Nema dovoljno zaliha. Na stanju je samo ${prod.stock_quantity} kom.`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          unitPrice: prod.current_price,
          quantity: 1,
          availableStock: prod.stock_quantity,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setPosError(null);
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQ = item.quantity + delta;
            if (newQ > item.availableStock) {
              setPosError(`Dostupno je maksimalno ${item.availableStock} kom.`);
              return item;
            }
            return { ...item, quantity: newQ };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setPosError('Korpa je prazna.');
      return;
    }

    try {
      const customer = partners.find((p) => p.id === selectedCustomerId);
      const saleLines: SaleLine[] = cart.map((item, idx) => {
        const lineTotal = item.quantity * item.unitPrice;
        const lineTax = lineTotal * (17 / 117);
        return {
          id: `salel-${Date.now()}-${idx}`,
          sale_id: '',
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: 0,
          tax_rate_id: 'tax-17',
          tax_amount: lineTax,
          total_amount: lineTotal,
        };
      });

      const pmName =
        paymentMethod === 'pm-cash'
          ? 'Gotovina'
          : paymentMethod === 'pm-card'
          ? 'Platna kartica'
          : 'Virman / Žiralno';

      const created = createSale(
        {
          warehouse_id: activeWarehouse.id,
          warehouse_name: activeWarehouse.name,
          customer_id: customer?.id || null,
          customer_name: customer?.name || 'Maloprodajni kupac (Fizičko lice)',
          lines: saleLines,
          subtotal_amount: totalNet,
          tax_amount: totalTax,
          total_amount: totalGross,
          payments: [
            {
              id: `pay-${Date.now()}`,
              sale_id: '',
              payment_method_id: paymentMethod,
              payment_method_name: pmName,
              amount: totalGross,
              created_at: new Date().toISOString(),
            },
          ],
        },
        true // Auto-post immediately
      );

      setCart([]);
      setPosError(null);
      setSelectedSale(created);
    } catch (err: any) {
      setPosError(err.message || 'Greška pri izdavanju računa.');
    }
  };

  // Filter products for quick search in POS
  const posSearchProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchProduct.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchProduct.toLowerCase())
    )
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Maloprodajna kasa & Izdavanje računa (POS)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Izdavanje fiskalnih maloprodajnih računa. Svaki proknjiženi račun automatski vrši
            razduženje zalihe na skladištu.
          </p>
        </div>
      </div>

      {/* POS Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product Selector (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Brza pretraga artikla po šifri, nazivu ili barkodu..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Quick product cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 max-h-[420px] overflow-y-auto">
              {posSearchProducts.map((p) => {
                const isOutOfStock = p.stock_quantity <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p.id)}
                    disabled={isOutOfStock}
                    className={`flex items-start justify-between rounded-lg border p-3 text-left transition-all shadow-xs ${
                      isOutOfStock
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 bg-white hover:border-emerald-500 hover:shadow-sm'
                    }`}
                  >
                    <div className="max-w-[70%]">
                      <div className="text-[10px] font-mono text-slate-400 font-semibold">
                        {p.sku}
                      </div>
                      <div className="font-semibold text-xs text-slate-900 line-clamp-2">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Zaliha:{' '}
                        <span
                          className={`font-semibold ${
                            isOutOfStock ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {p.stock_quantity} kom
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-emerald-700">
                        {formatBosnianCurrency(p.current_price)}
                      </div>
                      {!isOutOfStock && (
                        <span className="mt-2 inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          + Dodaj
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Cart & Checkout (1 col) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Račun / Korpa</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{cart.length} stavki</span>
            </div>

            {posError && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{posError}</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.productId} className="pt-2 flex items-center justify-between text-xs">
                  <div className="max-w-[150px]">
                    <div className="font-medium text-slate-900 truncate">{item.productName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatBosnianCurrency(item.unitPrice)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, -1)}
                      className="rounded p-1 text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-mono font-bold w-5 text-center text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.productId, 1)}
                      className="rounded p-1 text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-3 w-3" />
                    </button>

                    <div className="w-16 text-right font-mono font-bold text-slate-900">
                      {formatBosnianCurrency(item.quantity * item.unitPrice)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Korpa je prazna. Kliknite na artikal sa lijeve strane za dodavanje.
                </div>
              )}
            </div>

            {/* Customer selection */}
            <div className="pt-2 border-t border-slate-100 text-xs">
              <label className="block text-slate-600 font-medium mb-1">Kupac na računu</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-800"
              >
                <option value="">Maloprodajni kupac (Fizičko lice)</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (JIB: {p.jib || '—'})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method Selector */}
            <div className="text-xs space-y-1">
              <label className="block text-slate-600 font-medium">Način plaćanja</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pm-cash')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors ${
                    paymentMethod === 'pm-cash'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Wallet className="h-4 w-4 mb-1" />
                  <span>Gotovina</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pm-card')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors ${
                    paymentMethod === 'pm-card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4 mb-1" />
                  <span>Kartica</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('pm-bank')}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-colors ${
                    paymentMethod === 'pm-bank'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="h-4 w-4 mb-1" />
                  <span>Žiralno</span>
                </button>
              </div>
            </div>
          </div>

          {/* Totals & Checkout Button */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Osnovica bez PDV-a:</span>
                <span className="font-mono">{formatBosnianCurrency(totalNet)}</span>
              </div>
              <div className="flex justify-between">
                <span>PDV (17%):</span>
                <span className="font-mono">{formatBosnianCurrency(totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                <span>Ukupno za uplatu:</span>
                <span className="font-mono text-emerald-700 text-base">
                  {formatBosnianCurrency(totalGross)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Izdaj fiskalni račun i razduži zalihe</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Sales Invoices Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Prethodno izdati maloprodajni računi</h3>
          <span className="text-xs text-slate-500">Evidentirano: {sales.length} računa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Broj računa</th>
                <th className="py-3 px-3 font-semibold">Datum & Vrijeme</th>
                <th className="py-3 px-4 font-semibold">Kupac</th>
                <th className="py-3 px-3 font-semibold">Skladište</th>
                <th className="py-3 px-3 font-semibold text-center">Način plaćanja</th>
                <th className="py-3 px-3 font-semibold text-right">Iznos (KM)</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Pregled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sales.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedSale(s)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {s.document_number}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {formatBosnianDate(s.created_at)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{s.customer_name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.warehouse_name}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {s.payments[0]?.payment_method_name || 'Gotovina'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatBosnianCurrency(s.total_amount)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {s.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSale(s);
                      }}
                      className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FISCAL RECEIPT MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 font-mono text-xs text-slate-800">
            {/* Receipt Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <div className="font-bold text-sm tracking-wider">TR "UZEH" SARAJEVO</div>
              <div className="text-[11px] text-slate-600">Sarajevo, Novi Grad</div>
              <div className="text-[11px] text-slate-600">JIB: 4303314560007 • PIB: 303314560007</div>
              <div className="text-[11px] text-slate-600">
                IBFM: BF98412 • Broj: {selectedSale.document_number}
              </div>
              <div className="text-[10px] text-slate-500">
                {formatBosnianDate(selectedSale.created_at)}
              </div>
            </div>

            {/* Buyer info if legal */}
            {selectedSale.customer_name && (
              <div className="py-2 border-b border-dashed border-slate-300 text-[11px]">
                Kupac: <span className="font-bold">{selectedSale.customer_name}</span>
              </div>
            )}

            {/* Items */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              {selectedSale.lines.map((l, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-slate-900">{l.product_name}</div>
                    <div className="text-[10px] text-slate-500">
                      {l.quantity} x {formatBosnianCurrency(l.unit_price)} (E 17%)
                    </div>
                  </div>
                  <div className="font-bold">{formatBosnianCurrency(l.total_amount)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-right">
              <div className="flex justify-between">
                <span>Ukupan iznos bez PDV:</span>
                <span>{formatBosnianCurrency(selectedSale.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>PDV E (17,00%):</span>
                <span>{formatBosnianCurrency(selectedSale.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 text-slate-900">
                <span>UKUPNO ZA UPLATU:</span>
                <span>{formatBosnianCurrency(selectedSale.total_amount)}</span>
              </div>
            </div>

            {/* Payment info */}
            <div className="py-2 text-[11px] text-center border-b border-dashed border-slate-300">
              Plaćeno ({selectedSale.payments[0]?.payment_method_name || 'Gotovina'}):{' '}
              <span className="font-bold">{formatBosnianCurrency(selectedSale.total_amount)}</span>
            </div>

            <div className="text-center pt-3 text-[10px] text-slate-400 space-y-1">
              <div>*** FISKALNI RAČUN GLASI NA ZAKONSKOG KUPCA ***</div>
              <div>Hvala na posjeti! TR Uzeh • www.uzeh.ba</div>
            </div>

            <div className="flex justify-between items-center gap-2 pt-4 mt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Printer className="h-4 w-4" />
                <span>Štampaj</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="flex-1 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
