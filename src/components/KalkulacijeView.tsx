import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Package,
  Plus,
  Printer,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { RetailCalculation, RetailCalculationLine } from '../types/erp';

export const KalkulacijeView: React.FC = () => {
  const {
    retailCalculations,
    partners,
    products,
    activeWarehouse,
    createRetailCalculation,
    postRetailCalculation,
  } = useERP();

  const [selectedCalc, setSelectedCalc] = useState<RetailCalculation | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New calculation form state
  const [supplierId, setSupplierId] = useState(partners[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [calcDate, setCalcDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<
    Array<{
      productId: string;
      quantity: number;
      purchasePrice: number;
      marginPercent: number;
      sellingPrice: number;
    }>
  >([]);

  // Selected product to add to line
  const [itemProductId, setItemProductId] = useState(products[0]?.id || '');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPurchasePrice, setItemPurchasePrice] = useState('5.00');
  const [itemSellingPrice, setItemSellingPrice] = useState('15.00');

  const addLine = () => {
    const prod = products.find((p) => p.id === itemProductId);
    if (!prod) return;

    const qty = parseFloat(itemQuantity) || 1;
    const purchase = parseFloat(itemPurchasePrice) || 0;
    const selling = parseFloat(itemSellingPrice) || 0;
    const marginAmount = selling - purchase;
    const marginPct = purchase > 0 ? (marginAmount / purchase) * 100 : 0;

    setLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        quantity: qty,
        purchasePrice: purchase,
        marginPercent: marginPct,
        sellingPrice: selling,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  // Live totals of lines
  const computedPurchaseTotal = lines.reduce(
    (acc, l) => acc + l.quantity * l.purchasePrice,
    0
  );
  const computedRetailTotal = lines.reduce(
    (acc, l) => acc + l.quantity * l.sellingPrice,
    0
  );
  const computedMarginTotal = computedRetailTotal - computedPurchaseTotal;

  const handleCreateSubmit = (autoPost: boolean) => {
    if (lines.length === 0) {
      alert('Morate unijeti barem jednu stavku u kalkulaciju.');
      return;
    }

    const supplier = partners.find((p) => p.id === supplierId);

    const calcLines: RetailCalculationLine[] = lines.map((l, idx) => {
      const prod = products.find((p) => p.id === l.productId);
      const marginAmt = l.sellingPrice - l.purchasePrice;
      return {
        id: `kall-new-${Date.now()}-${idx}`,
        calculation_id: '',
        product_id: l.productId,
        product_code: prod?.sku || `${idx + 1}.`,
        product_name: prod?.name || 'Artikal',
        unit: prod?.unit_code || 'kom',
        quantity: l.quantity,
        purchase_price: l.purchasePrice,
        additional_cost: 0,
        cost_price: l.purchasePrice,
        margin_percent: l.marginPercent,
        margin_amount: marginAmt,
        selling_price: l.sellingPrice,
        tax_rate_id: 'tax-17',
        total_value: l.quantity * l.sellingPrice,
      };
    });

    const newCalc = createRetailCalculation(
      {
        date: calcDate,
        supplier_id: supplierId,
        supplier_name: supplier?.name || 'Dobavljač',
        invoice_number: invoiceNumber || `BF: ${Math.floor(100000 + Math.random() * 900000)}`,
        invoice_date: invoiceDate,
        warehouse_id: activeWarehouse.id,
        warehouse_name: activeWarehouse.name,
        lines: calcLines,
        total_purchase_value: computedPurchaseTotal,
        total_margin_value: computedMarginTotal,
        total_retail_value: computedRetailTotal,
      },
      autoPost
    );

    setIsCreateOpen(false);
    setLines([]);
    setInvoiceNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Kalkulacije maloprodajnih cijena (Ulaz robe)
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Zakonski obrazac prijema robe i formiranja MPC u Bosni i Hercegovini. Knjiženjem se
            automatski uvećava fizičko stanje zaliha.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova kalkulacija</span>
        </button>
      </div>

      {/* Kalkulacije List Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold w-32">Broj kalkulacije</th>
                <th className="py-3 px-3 font-semibold">Datum</th>
                <th className="py-3 px-4 font-semibold">Dobavljač</th>
                <th className="py-3 px-3 font-semibold">Faktura / BF</th>
                <th className="py-3 px-3 font-semibold text-right">Fakturna vrij.</th>
                <th className="py-3 px-3 font-semibold text-right">Razlika (Marža)</th>
                <th className="py-3 px-3 font-semibold text-right">MPC Vrijednost</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-center w-24">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {retailCalculations.map((k) => (
                <tr
                  key={k.id}
                  onClick={() => setSelectedCalc(k)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {k.document_number}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{formatBosnianDate(k.date)}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{k.supplier_name}</div>
                    <div className="text-[11px] text-slate-400">{k.warehouse_name}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">{k.invoice_number}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {formatBosnianCurrency(k.total_purchase_value)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 font-medium">
                    +{formatBosnianCurrency(k.total_margin_value)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    {formatBosnianCurrency(k.total_retail_value)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        k.status === 'POSTED'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset'
                      }`}
                    >
                      {k.status === 'POSTED' ? 'PROKNJIŽENO' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCalc(k);
                      }}
                      className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-xs"
                      title="Pregled kalkulacije"
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

      {/* CALCULATION DETAIL MODAL (Bosnian Official Form Style) */}
      {selectedCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono rounded bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                    {selectedCalc.document_number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Kalkulacija maloprodajne cijene
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Dobavljač: <span className="font-bold text-slate-800">{selectedCalc.supplier_name}</span> •
                  Faktura: <span className="font-mono font-bold text-slate-700">{selectedCalc.invoice_number}</span> •
                  Datum fakture: {formatBosnianDate(selectedCalc.invoice_date || selectedCalc.date)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                  title="Štampaj kalkulaciju"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCalc(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Warehouse & Status */}
            <div className="grid grid-cols-4 gap-3 my-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Objekat prijema</span>
                <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                  {selectedCalc.warehouse_name}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Fakturna vrijednost</span>
                <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">
                  {formatBosnianCurrency(selectedCalc.total_purchase_value)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Ukupna marža (RUC)</span>
                <div className="text-xs font-bold font-mono text-emerald-600 mt-0.5">
                  {formatBosnianCurrency(selectedCalc.total_margin_value)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] text-slate-500">Maloprodajna vrij. (sa PDV)</span>
                <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                  {formatBosnianCurrency(selectedCalc.total_retail_value)}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="my-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Stavke kalkulacije ({selectedCalc.lines.length})
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-2">R.br</th>
                      <th className="py-2.5 px-2">Šifra</th>
                      <th className="py-2.5 px-3">Naziv artikla</th>
                      <th className="py-2.5 px-2 text-center">JM</th>
                      <th className="py-2.5 px-2 text-right">Količina</th>
                      <th className="py-2.5 px-2 text-right">Fakturna</th>
                      <th className="py-2.5 px-2 text-right">NC</th>
                      <th className="py-2.5 px-2 text-right">Marža %</th>
                      <th className="py-2.5 px-2 text-right">MPC</th>
                      <th className="py-2.5 px-3 text-right">Vrijednost (KM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCalc.lines.map((l, idx) => (
                      <tr key={l.id || idx}>
                        <td className="py-2 px-2 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2 font-mono font-medium text-slate-800">
                          {l.product_code}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">{l.product_name}</td>
                        <td className="py-2 px-2 text-center text-slate-500">{l.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-800">
                          {l.quantity}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {formatBosnianCurrency(l.purchase_price)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-600">
                          {formatBosnianCurrency(l.cost_price)}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-emerald-600">
                          {l.margin_percent.toFixed(1)}%
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                          {formatBosnianCurrency(l.selling_price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatBosnianCurrency(l.total_value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Posting Status & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Dokument izradio: <span className="font-semibold text-slate-700">{selectedCalc.created_by}</span>
                {selectedCalc.posted_at && (
                  <span> • Proknjiženo: {formatBosnianDate(selectedCalc.posted_at)}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedCalc.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={() => {
                      postRetailCalculation(selectedCalc.id);
                      setSelectedCalc(null);
                    }}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                  >
                    Proknjiži kalkulaciju na stanje
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedCalc(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW KALKULACIJA MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Nova kalkulacija maloprodajne cijene (Ulaz robe)
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Header fields */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 my-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dobavljač *</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Broj fakture / BF *</label>
                <input
                  type="text"
                  placeholder="BF: 98412"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Datum fakture</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Datum prijema</label>
                <input
                  type="date"
                  value={calcDate}
                  onChange={(e) => setCalcDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Add Line Form */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dodaj stavku u kalkulaciju
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Artikal iz kataloga</label>
                  <select
                    value={itemProductId}
                    onChange={(e) => {
                      setItemProductId(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) {
                        setItemPurchasePrice(prod.current_purchase_price.toFixed(2));
                        setItemSellingPrice(prod.current_price.toFixed(2));
                      }
                    }}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Količina</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Fakturna cijena (KM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemPurchasePrice}
                    onChange={(e) => setItemPurchasePrice(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Prodajna MPC (KM)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={itemSellingPrice}
                      onChange={(e) => setItemSellingPrice(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={addLine}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lines List */}
            <div className="my-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Stavke na kalkulaciji ({lines.length})</span>
                <div className="flex items-center gap-4 text-xs">
                  <span>
                    Fakturna: <strong className="font-mono">{formatBosnianCurrency(computedPurchaseTotal)}</strong>
                  </span>
                  <span>
                    Marža: <strong className="font-mono text-emerald-600">{formatBosnianCurrency(computedMarginTotal)}</strong>
                  </span>
                  <span>
                    MPC Vrijednost: <strong className="font-mono text-slate-900">{formatBosnianCurrency(computedRetailTotal)}</strong>
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Artikal</th>
                      <th className="py-2 px-2 text-right">Količina</th>
                      <th className="py-2 px-2 text-right">Fakturna</th>
                      <th className="py-2 px-2 text-right">MPC</th>
                      <th className="py-2 px-2 text-right">Ukupno MPC</th>
                      <th className="py-2 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((l, idx) => {
                      const prod = products.find((p) => p.id === l.productId);
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3">
                            <span className="font-mono font-bold text-slate-800 mr-2">{prod?.sku}</span>
                            {prod?.name}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold">{l.quantity}</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {formatBosnianCurrency(l.purchasePrice)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600">
                            {formatBosnianCurrency(l.sellingPrice)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold">
                            {formatBosnianCurrency(l.quantity * l.sellingPrice)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {lines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          Niste dodali nijednu stavku. Koristite formu iznad za dodavanje artikala.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubmit(false)}
                className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-200"
              >
                Sačuvaj kao DRAFT
              </button>
              <button
                type="button"
                onClick={() => handleCreateSubmit(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
              >
                Proknjiži kalkulaciju na zalihe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
