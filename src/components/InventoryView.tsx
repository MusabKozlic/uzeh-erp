import React, { useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileSpreadsheet,
  PackageMinus,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { InventoryCount, WriteOff } from '../types/erp';

export const InventoryView: React.FC = () => {
  const {
    inventoryCounts,
    writeOffs,
    products,
    activeWarehouse,
    createInventoryCount,
    postInventoryCount,
    createWriteOff,
    postWriteOff,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'inventura' | 'otpis'>('inventura');

  // Modals
  const [selectedInv, setSelectedInv] = useState<InventoryCount | null>(null);
  const [selectedOtp, setSelectedOtp] = useState<WriteOff | null>(null);
  const [isNewInvOpen, setIsNewInvOpen] = useState(false);
  const [isNewOtpOpen, setIsNewOtpOpen] = useState(false);

  // New Inventura state
  const [invDate, setInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [invLines, setInvLines] = useState<
    Array<{
      productId: string;
      productName: string;
      systemQty: number;
      countedQty: number;
      unitPrice: number;
      notes: string;
    }>
  >([]);

  // Item to add to inventura
  const [selectedProdForInv, setSelectedProdForInv] = useState(products[0]?.id || '');
  const [countedQtyInput, setCountedQtyInput] = useState('0');

  const addInvLine = () => {
    const prod = products.find((p) => p.id === selectedProdForInv);
    if (!prod) return;

    const counted = parseFloat(countedQtyInput) || 0;
    setInvLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        systemQty: prod.stock_quantity,
        countedQty: counted,
        unitPrice: prod.current_price,
        notes: '',
      },
    ]);
  };

  const submitNewInventura = (autoPost: boolean) => {
    if (invLines.length === 0) {
      alert('Morate unijeti barem jedan artikal na popis.');
      return;
    }

    let surplusVal = 0;
    let deficitVal = 0;

    const lines = invLines.map((l, idx) => {
      const diff = l.countedQty - l.systemQty;
      const diffVal = diff * l.unitPrice;
      if (diff > 0) surplusVal += diffVal;
      else deficitVal += Math.abs(diffVal);

      return {
        id: `invl-new-${Date.now()}-${idx}`,
        inventory_count_id: '',
        product_id: l.productId,
        product_name: l.productName,
        system_quantity: l.systemQty,
        counted_quantity: l.countedQty,
        difference: diff,
        unit_price: l.unitPrice,
        difference_value: diffVal,
        notes: l.notes,
      };
    });

    createInventoryCount(
      {
        warehouse_id: activeWarehouse.id,
        warehouse_name: activeWarehouse.name,
        date: invDate,
        lines,
        total_surplus_value: surplusVal,
        total_deficit_value: deficitVal,
      },
      autoPost
    );

    setIsNewInvOpen(false);
    setInvLines([]);
  };

  // New Otpis state
  const [otpDate, setOtpDate] = useState(new Date().toISOString().split('T')[0]);
  const [otpReason, setOtpReason] = useState<'DAMAGED' | 'EXPIRED' | 'MISSING' | 'THEFT' | 'OTHER'>('DAMAGED');
  const [otpNotes, setOtpNotes] = useState('');
  const [otpProdId, setOtpProdId] = useState(products[0]?.id || '');
  const [otpQty, setOtpQty] = useState('1');

  const submitNewOtpis = (autoPost: boolean) => {
    const prod = products.find((p) => p.id === otpProdId);
    if (!prod) return;

    const qty = parseFloat(otpQty) || 1;
    const cost = prod.current_purchase_price || 5.0;

    createWriteOff(
      {
        warehouse_id: activeWarehouse.id,
        warehouse_name: activeWarehouse.name,
        date: otpDate,
        reason: otpReason,
        notes: otpNotes || 'Redovan otpis oštećene robe iz izloga / skladišta',
        total_amount: qty * cost,
        lines: [
          {
            id: `otpl-new-${Date.now()}`,
            write_off_id: '',
            product_id: prod.id,
            product_name: prod.name,
            quantity: qty,
            unit_cost: cost,
            total_cost: qty * cost,
            reason: otpReason,
          },
        ],
      },
      autoPost
    );

    setIsNewOtpOpen(false);
    setOtpNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switching */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventura & Otpis robe
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upravljanje fizičkim popisom lagera (utvrđivanje viškova i manjkova) i zakonski otpis
            oštećene/neispravne robe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'inventura' ? (
            <button
              type="button"
              onClick={() => setIsNewInvOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              <span>Novi popis / Inventura</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsNewOtpOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
            >
              <PackageMinus className="h-4 w-4" />
              <span>Novi nalog za otpis</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('inventura')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'inventura'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>Popisi zaliha (Inventura) ({inventoryCounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('otpis')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'otpis'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PackageMinus className="h-4 w-4" />
          <span>Otpis robe i rashod ({writeOffs.length})</span>
        </button>
      </div>

      {/* INVENTURA TAB */}
      {activeTab === 'inventura' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Broj inventure</th>
                <th className="py-3 px-3 font-semibold">Datum</th>
                <th className="py-3 px-4 font-semibold">Objekat</th>
                <th className="py-3 px-3 font-semibold text-center">Broj stavki</th>
                <th className="py-3 px-3 font-semibold text-right">Utvrđeni viškova</th>
                <th className="py-3 px-3 font-semibold text-right">Utvrđeni manjkova</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Pregled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventoryCounts.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => setSelectedInv(inv)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {inv.document_number}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {formatBosnianDate(inv.date)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{inv.warehouse_name}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{inv.lines.length}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-bold">
                    +{formatBosnianCurrency(inv.total_surplus_value)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-600 font-bold">
                    -{formatBosnianCurrency(inv.total_deficit_value)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInv(inv);
                      }}
                      className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* OTPIS TAB */}
      {activeTab === 'otpis' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Broj naloga</th>
                <th className="py-3 px-3 font-semibold">Datum</th>
                <th className="py-3 px-4 font-semibold">Razlog otpisa</th>
                <th className="py-3 px-3 font-semibold">Napomena</th>
                <th className="py-3 px-3 font-semibold text-right">Vrijednost otpisa</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold">Kreirao</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Pregled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {writeOffs.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => setSelectedOtp(w)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {w.document_number}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">
                    {formatBosnianDate(w.date)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                      {w.reason}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{w.notes || '—'}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                    {formatBosnianCurrency(w.total_amount)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {w.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">{w.created_by}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOtp(w);
                      }}
                      className="rounded-md border border-slate-200 bg-white p-1 text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* NEW INVENTURA MODAL */}
      {isNewInvOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Kreiranje popisa zaliha (Inventura)
              </h3>
              <button
                type="button"
                onClick={() => setIsNewInvOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 text-xs">
              <label className="block font-medium text-slate-700 mb-1">Datum popisa</label>
              <input
                type="date"
                value={invDate}
                onChange={(e) => setInvDate(e.target.value)}
                className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
              />
            </div>

            {/* Add product to count */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Unos prebrojanog stanja
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Artikal</label>
                  <select
                    value={selectedProdForInv}
                    onChange={(e) => {
                      setSelectedProdForInv(e.target.value);
                      const prod = products.find((p) => p.id === e.target.value);
                      if (prod) setCountedQtyInput(String(prod.stock_quantity));
                    }}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} {p.name} (Sistemsko stanje: {p.stock_quantity} kom)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Fizički izbrojano (kom)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={countedQtyInput}
                      onChange={(e) => setCountedQtyInput(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white font-mono font-bold text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={addInvLine}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Popis items list */}
            <div className="my-4 space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Stavke popisa ({invLines.length})
              </div>
              <div className="rounded-lg border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Artikal</th>
                      <th className="py-2 px-2 text-right">Sistemsko</th>
                      <th className="py-2 px-2 text-right">Izbrojano</th>
                      <th className="py-2 px-2 text-right">Razlika</th>
                      <th className="py-2 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invLines.map((l, idx) => {
                      const diff = l.countedQty - l.systemQty;
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium">{l.productName}</td>
                          <td className="py-2 px-2 text-right font-mono">{l.systemQty}</td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                            {l.countedQty}
                          </td>
                          <td
                            className={`py-2 px-2 text-right font-mono font-bold ${
                              diff === 0
                                ? 'text-slate-400'
                                : diff > 0
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {diff > 0 ? `+${diff}` : diff} kom
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setInvLines((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewInvOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={() => submitNewInventura(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
              >
                Zaključi i proknjiži popis na stanje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW OTPIS MODAL */}
      {isNewOtpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Novi nalog za otpis robe</h3>
              <button
                type="button"
                onClick={() => setIsNewOtpOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 my-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Artikal za otpis</label>
                <select
                  value={otpProdId}
                  onChange={(e) => setOtpProdId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} {p.name} (Stanje: {p.stock_quantity} kom, NC: {p.current_purchase_price.toFixed(2)} KM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Količina za otpis</label>
                  <input
                    type="number"
                    min="1"
                    value={otpQty}
                    onChange={(e) => setOtpQty(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Razlog otpisa</label>
                  <select
                    value={otpReason}
                    onChange={(e) => setOtpReason(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                  >
                    <option value="DAMAGED">Oštećenje u radnji/transportu</option>
                    <option value="EXPIRED">Istekao rok trajanja</option>
                    <option value="MISSING">Manjak</option>
                    <option value="THEFT">Krađa</option>
                    <option value="OTHER">Ostalo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Napomena / Obrazloženje</label>
                <textarea
                  rows={2}
                  placeholder="npr. Razbijeno staklo prilikom slaganja police..."
                  value={otpNotes}
                  onChange={(e) => setOtpNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsNewOtpOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                type="button"
                onClick={() => submitNewOtpis(true)}
                className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs"
              >
                Proknjiži otpis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR INVENTURA */}
      {selectedInv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedInv.document_number}</h3>
                <p className="text-xs text-slate-500">
                  Datum: {formatBosnianDate(selectedInv.date)} • Objekat: {selectedInv.warehouse_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInv(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 divide-y divide-slate-100 max-h-60 overflow-y-auto text-xs">
              {selectedInv.lines.map((l, i) => (
                <div key={i} className="py-2 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-slate-900">{l.product_name}</div>
                    <div className="text-[11px] text-slate-400">
                      Sistem: {l.system_quantity} kom | Izbrojano: {l.counted_quantity} kom
                    </div>
                  </div>
                  <div
                    className={`font-mono font-bold ${
                      l.difference > 0
                        ? 'text-emerald-600'
                        : l.difference < 0
                        ? 'text-rose-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {l.difference > 0 ? `+${l.difference}` : l.difference} kom (
                    {formatBosnianCurrency(l.difference_value)})
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedInv(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR OTPIS */}
      {selectedOtp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedOtp.document_number}</h3>
                <p className="text-slate-500">
                  Datum: {formatBosnianDate(selectedOtp.date)} • Razlog: {selectedOtp.reason}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOtp(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 space-y-2">
              <div className="text-slate-600">
                Napomena: <strong>{selectedOtp.notes || 'Bez napomene'}</strong>
              </div>
              <div className="divide-y divide-slate-100">
                {selectedOtp.lines.map((l, i) => (
                  <div key={i} className="py-2 flex justify-between items-center">
                    <span className="font-medium text-slate-900">{l.product_name}</span>
                    <span className="font-mono text-rose-600 font-bold">
                      -{l.quantity} kom ({formatBosnianCurrency(l.total_cost)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedOtp(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
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
