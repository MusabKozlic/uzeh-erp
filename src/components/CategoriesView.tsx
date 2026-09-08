import React, { useState } from 'react';
import {
  Bookmark,
  ChevronRight,
  FolderTree,
  Percent,
  Plus,
  Scale,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { Category } from '../types/erp';

export const CategoriesView: React.FC = () => {
  const { categories, products, createCategory } = useERP();

  const [activeTab, setActiveTab] = useState<'categories' | 'brands' | 'units'>('categories');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatCode) return;

    createCategory({
      name: newCatName,
      code: newCatCode.toUpperCase(),
      parent_id: newCatParentId || null,
      is_active: true,
    });

    setIsCreateOpen(false);
    setNewCatName('');
    setNewCatCode('');
    setNewCatParentId('');
  };

  // Top level categories
  const topCategories = categories.filter((c) => !c.parent_id);

  // Helper to count products per category
  const getProductCount = (catId: string) => {
    return products.filter((p) => p.category_id === catId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Klasifikacija & Šifarnici
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upravljanje kategorijama proizvoda, robnim markama (brendovima), jedinicama mjere i poreskim stopama.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          <span>Nova kategorija</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'categories'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Kategorije artikala ({categories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('brands')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'brands'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Robne marke / Proizvođači</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('units')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'units'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>Jedinice mjere & PDV</span>
        </button>
      </div>

      {/* CATEGORIES VIEW */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCategories.map((topCat) => {
            const children = categories.filter((c) => c.parent_id === topCat.id);
            const totalProductsInCat =
              getProductCount(topCat.id) +
              children.reduce((acc, ch) => acc + getProductCount(ch.id), 0);

            return (
              <div
                key={topCat.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <FolderTree className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{topCat.name}</h3>
                        <span className="font-mono text-[10px] text-slate-400">
                          ŠIFRA: {topCat.code}
                        </span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {totalProductsInCat} artikala
                    </span>
                  </div>

                  {/* Subcategories list */}
                  {children.length > 0 && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Potkategorije ({children.length})
                      </div>
                      <div className="space-y-1">
                        {children.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-md bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <span className="font-medium">{child.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {getProductCount(child.id)} art.
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Aktivan šifarnik</span>
                  <span className="font-mono">ID: {topCat.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BRANDS VIEW */}
      {activeTab === 'brands' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Evidentirani proizvođači i robne marke</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              'BINGO d.o.o.',
              'EDEKA Germany',
              'Pilot Company',
              'Amazon Basics',
              'Belamionix',
              'Sarajevo Craft',
              'Bosna Plast',
              'Herceg Home',
            ].map((brand, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 p-3 bg-slate-50 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <span className="font-semibold text-slate-800">{brand}</span>
                </div>
                <span className="text-[10px] rounded bg-white px-1.5 py-0.5 text-slate-500 border border-slate-200">
                  Aktivan
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UNITS & TAX VIEW */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax Rates in BiH */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Poreske stope (Uprava za indirektno oporezivanje BiH)
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/60 flex justify-between items-center">
                <div>
                  <div className="font-bold text-emerald-950">Standardna stopa PDV (BiH)</div>
                  <div className="text-[11px] text-emerald-800">
                    Oznaka E • Primjenjuje se na sve maloprodajne artikle
                  </div>
                </div>
                <span className="text-lg font-bold font-mono text-emerald-700">17.00%</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Oslobođeno od plaćanja PDV-a</div>
                  <div className="text-[11px] text-slate-500">Član 24. i 25. Zakona o PDV BiH</div>
                </div>
                <span className="text-lg font-bold font-mono text-slate-600">0.00%</span>
              </div>
            </div>
          </div>

          {/* Units of Measure */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Jedinice mjere (JM)</h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { code: 'kom', name: 'Komad', desc: 'Standardna jedinica za pojedinačne artikle' },
                { code: 'kg', name: 'Kilogram', desc: 'Mjerna jedinica za robu na vagu' },
                { code: 'lit', name: 'Litar', desc: 'Mjerna jedinica za tečnosti' },
                { code: 'pak', name: 'Pakovanje', desc: 'Zbirno pakovanje artikala' },
                { code: 'par', name: 'Par', desc: 'Obuća, rukavice' },
              ].map((u) => (
                <div
                  key={u.code}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 rounded bg-white px-2 py-0.5 border border-slate-200">
                      {u.code}
                    </span>
                    <span className="font-medium text-slate-800">{u.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{u.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateCategory}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Nova kategorija artikala</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Naziv kategorije *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. Rasvjeta i lampe"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Šifra kategorije *</label>
                <input
                  type="text"
                  required
                  placeholder="npr. KAT-RASVJETA"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nadređena kategorija (opcionalno)</label>
                <select
                  value={newCatParentId}
                  onChange={(e) => setNewCatParentId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                >
                  <option value="">Glavna kategorija (Nema nadređenu)</option>
                  {topCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Odustani
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Sačuvaj kategoriju
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
