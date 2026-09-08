import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Percent,
  Plus,
  Printer,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { formatBosnianCurrency, formatBosnianDate } from '../lib/formatters';
import { PriceAdjustment, PriceAdjustmentLine } from '../types/erp';

export const NivelacijeView: React.FC = () => {
  const {
    priceAdjustments,
    products,
    createPriceAdjustment,
    postPriceAdjustment,
  } = useERP();

  const [selectedAdj, setSelectedAdj] = useState<PriceAdjustment | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New adjustment form state
  const [adjReason, setAdjReason] = useState('Sezonsko usklađivanje cijena');
  const [adjDate, setAdjDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      oldPrice: number;
      newPrice: number;
    }>
  >([]);

  // Item selector
  const [itemProdId, setItemProdId] = useState(products[0]?.id || '');
  const [itemNewPrice, setItemNewPrice] = useState('10.00');

  const addLine = () => {
    const prod = products.find((p) => p.id === itemProdId);
    if (!prod) return;

    const newP = parseFloat(itemNewPrice) || 0;
    setLines((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: prod.stock_quantity || 1,
        oldPrice: prod.current_price,
        newPrice: newP,
      },
    ]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const computedTotalDifference = lines.reduce(
    (acc, l) => acc + l.quantity * (l.newPrice - l.oldPrice),
    0
  );

  const handleCreateSubmit = (autoPost: boolean) => {
    if (lines.length === 0) {
      alert('Morate unijeti barem jedan artikal na nivelaciju.');
      return;
    }

    const adjLines: PriceAdjustmentLine[] = lines.map((l, idx) => ({
      id: `nivl-new-${Date.now()}-${idx}`,
      price_adjustment_id: '',
      product_id: l.productId,
      product_name: l.productName,
      quantity: l.quantity,
      old_price: l.oldPrice,
      new_price: l.newPrice,
      difference: l.newPrice - l.oldPrice,
      total_difference: l.quantity * (l.newPrice - l.oldPrice),
    }));

    createPriceAdjustment(
      {
        date: adjDate,
        reason: adjReason,
        lines: adjLines,
        total_difference: computedTotalDifference,
      },
      autoPost
    );

    setIsCreateOpen(false);
    setLines([]);
    setAdjReason('Sezonsko usklađivanje cijena');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Nivelacije maloprodajnih cijena
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Zvanični dokument o promjeni maloprodajnih cijena na zalihama. Knjiženjem se evidentira
            razlika u trgovačkoj knjizi (TKM) i ažurira cjenovnik u sistemu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nova nivelacija</span>
        </button>
      </div>

      {/* Nivelacije Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold w-32">Broj dokumenta</th>
                <th className="py-3 px-3 font-semibold">Datum</th>
                <th className="py-3 px-4 font-semibold">Razlog nivelacije</th>
                <th className="py-3 px-3 font-semibold text-center">Broj artikala</th>
                <th className="py-3 px-3 font-semibold text-right">Razlika u vrijednosti</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold">Obradio</th>
                <th className="py-3 px-3 font-semibold text-center w-20">Pregled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {priceAdjustments.map((n) => (
                <tr
                  key={n.id}
                  onClick={() => setSelectedAdj(n)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">
                    {n.document_number}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{formatBosnianDate(n.date)}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{n.reason}</td>
                  <td className="py-3 px-3 text-center font-mono">{n.lines.length}</td>
                  <td
                    className={`py-3 px-3 text-right font-mono font-bold ${
                      n.total_difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {n.total_difference >= 0 ? '+' : ''}
                    {formatBosnianCurrency(n.total_difference)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        n.status === 'POSTED'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset'
                          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset'
                      }`}
                    >
                      {n.status === 'POSTED' ? 'PROKNJIŽENO' : 'DRAFT'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500">{n.created_by}</td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAdj(n);
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

      {/* NIVELACIJA DETAIL MODAL */}
      {selectedAdj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono rounded bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
                    {selectedAdj.document_number}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Zapisnik o nivelaciji maloprodajnih cijena
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Razlog: <span className="font-bold text-slate-800">{selectedAdj.reason}</span> •
                  Datum: <span className="font-mono font-bold text-slate-700">{formatBosnianDate(selectedAdj.date)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                  title="Štampaj nivelaciju"
                >
                  <Printer className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAdj(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Total difference banner */}
            <div className="my-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <span className="text-xs text-slate-500">Ukupna finansijska razlika na zalihama:</span>
                <div
                  className={`text-xl font-bold font-mono ${
                    selectedAdj.total_difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedAdj.total_difference >= 0 ? '+' : ''}
                  {formatBosnianCurrency(selectedAdj.total_difference)}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <span>Broj nivelisanih stavki:</span>
                <div className="text-base font-bold text-slate-800">{selectedAdj.lines.length}</div>
              </div>
            </div>

            {/* Line items table */}
            <div className="my-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Stavke obuhvaćene nivelacijom
              </h4>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">R.br</th>
                      <th className="py-2.5 px-4">Naziv artikla</th>
                      <th className="py-2.5 px-3 text-right">Zatečena kol.</th>
                      <th className="py-2.5 px-3 text-right">Stara MPC</th>
                      <th className="py-2.5 px-3 text-right">Nova MPC</th>
                      <th className="py-2.5 px-3 text-right">Razlika po kom.</th>
                      <th className="py-2.5 px-3 text-right">Ukupna razlika (KM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedAdj.lines.map((l, idx) => (
                      <tr key={l.id || idx}>
                        <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-4 font-medium text-slate-900">{l.product_name}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                          {l.quantity} kom
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-500">
                          {formatBosnianCurrency(l.old_price)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatBosnianCurrency(l.new_price)}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-mono font-semibold ${
                            l.difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {l.difference >= 0 ? '+' : ''}
                          {formatBosnianCurrency(l.difference)}
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-mono font-bold ${
                            l.total_difference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {l.total_difference >= 0 ? '+' : ''}
                          {formatBosnianCurrency(l.total_difference)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Obradio: <span className="font-semibold text-slate-700">{selectedAdj.created_by}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedAdj.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={() => {
                      postPriceAdjustment(selectedAdj.id);
                      setSelectedAdj(null);
                    }}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-xs"
                  >
                    Proknjiži nivelaciju
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedAdj(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NIVELACIJA MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Nova nivelacija maloprodajnih cijena
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Razlog nivelacije *</label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Datum stupanja na snagu</label>
                <input
                  type="date"
                  value={adjDate}
                  onChange={(e) => setAdjDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Add item */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Odabir artikla za nivelaciju
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 mb-1">Artikal</label>
                  <select
                    value={itemProdId}
                    onChange={(e) => setItemProdId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} {p.name} (Trenutna MPC: {p.current_price.toFixed(2)} KM, Stanje: {p.stock_quantity} kom)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Nova MPC cijena (KM)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={itemNewPrice}
                      onChange={(e) => setItemNewPrice(e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 bg-white text-slate-900 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={addLine}
                      className="rounded-md bg-purple-600 px-3 py-1.5 font-bold text-white hover:bg-purple-700 text-xs"
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
                <span>Stavke na nivelaciji ({lines.length})</span>
                <span>
                  Ukupna razlika:{' '}
                  <strong
                    className={`font-mono ${
                      computedTotalDifference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {computedTotalDifference >= 0 ? '+' : ''}
                    {formatBosnianCurrency(computedTotalDifference)}
                  </strong>
                </span>
              </div>

              <div className="rounded-lg border border-slate-200 overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Artikal</th>
                      <th className="py-2 px-2 text-right">Zatečena kol.</th>
                      <th className="py-2 px-2 text-right">Stara MPC</th>
                      <th className="py-2 px-2 text-right">Nova MPC</th>
                      <th className="py-2 px-2 text-right">Razlika</th>
                      <th className="py-2 px-2 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((l, idx) => {
                      const diff = l.newPrice - l.oldPrice;
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3 font-medium">{l.productName}</td>
                          <td className="py-2 px-2 text-right font-mono">{l.quantity} kom</td>
                          <td className="py-2 px-2 text-right font-mono">
                            {formatBosnianCurrency(l.oldPrice)}
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-purple-700">
                            {formatBosnianCurrency(l.newPrice)}
                          </td>
                          <td
                            className={`py-2 px-2 text-right font-mono font-bold ${
                              diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {diff >= 0 ? '+' : ''}
                            {formatBosnianCurrency(diff * l.quantity)}
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
                          Niste dodali nijednu stavku na nivelaciju.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
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
                className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 shadow-xs"
              >
                Proknjiži nivelaciju u cjenovnik
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
