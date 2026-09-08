import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Package,
  FileSpreadsheet,
  Percent,
  ShoppingCart,
  Users,
  Building,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { formatKM } from '../../lib/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (viewId: string, extra?: any) => void;
  onOpenNewProduct?: () => void;
  onOpenNewCalculation?: () => void;
  onOpenNewPriceAdjustment?: () => void;
  onOpenNewPurchase?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewProduct,
  onOpenNewCalculation,
  onOpenNewPriceAdjustment,
  onOpenNewPurchase,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { products, retailCalculations, priceAdjustments, sales, partners } = useERP();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Quick Action Commands
  const commands = [
    {
      id: 'cmd_new_product',
      title: 'Novi artikal',
      category: 'Akcije',
      icon: Package,
      action: () => {
        onNavigate('products');
        onOpenNewProduct?.();
      },
    },
    {
      id: 'cmd_new_purchase',
      title: 'Novi ulaz robe',
      category: 'Akcije',
      icon: FileSpreadsheet,
      action: () => {
        onNavigate('purchase_entry');
        onOpenNewPurchase?.();
      },
    },
    {
      id: 'cmd_new_calc',
      title: 'Nova kalkulacija',
      category: 'Akcije',
      icon: FileSpreadsheet,
      action: () => {
        onNavigate('kalkulacije');
        onOpenNewCalculation?.();
      },
    },
    {
      id: 'cmd_new_nivelacija',
      title: 'Nova nivelacija',
      category: 'Akcije',
      icon: Percent,
      action: () => {
        onNavigate('nivelacije');
        onOpenNewPriceAdjustment?.();
      },
    },
    {
      id: 'cmd_new_sale',
      title: 'Nova prodaja (Kasa)',
      category: 'Akcije',
      icon: ShoppingCart,
      action: () => {
        onNavigate('sales');
      },
    },
    {
      id: 'cmd_stock',
      title: 'Stanje zalihe',
      category: 'Navigacija',
      icon: Layers,
      action: () => onNavigate('stock_movements'),
    },
    {
      id: 'cmd_products',
      title: 'Artikli (Katalog)',
      category: 'Navigacija',
      icon: Package,
      action: () => onNavigate('products'),
    },
    {
      id: 'cmd_reports',
      title: 'Izvještaji (Prodaja, Nabavka, Zaliha)',
      category: 'Navigacija',
      icon: BarChart3,
      action: () => onNavigate('report_sales'),
    },
  ];

  const filteredCommands = commands.filter((c) =>
    c.title.toLowerCase().includes(q)
  );

  // Filtered Products
  const filteredProducts = q
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.barcode.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  // Filtered Documents
  const filteredDocs = q
    ? [
        ...retailCalculations
          .filter((c) => c.document_number.toLowerCase().includes(q))
          .map((c) => ({
            id: c.id,
            title: `${c.document_number} (Kalkulacija)`,
            subtitle: `${c.supplier_name || 'Dobavljač'} • ${formatKM(c.total_retail_value)}`,
            view: 'kalkulacije',
          })),
        ...priceAdjustments
          .filter((a) => a.document_number.toLowerCase().includes(q))
          .map((a) => ({
            id: a.id,
            title: `${a.document_number} (Nivelacija)`,
            subtitle: `${a.reason} • ${formatKM(a.total_difference)}`,
            view: 'nivelacije',
          })),
        ...sales
          .filter((s) => s.document_number.toLowerCase().includes(q))
          .map((s) => ({
            id: s.id,
            title: `${s.document_number} (Račun)`,
            subtitle: `${formatKM(s.total_amount)} • ${s.status}`,
            view: 'sales',
          })),
      ].slice(0, 5)
    : [];

  // Filtered Partners
  const filteredPartners = q
    ? partners
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.jib && p.jib.includes(q)) ||
            (p.city && p.city.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  const handleSelect = (cb: () => void) => {
    cb();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-slate-950/50 backdrop-blur-xs animate-in fade-in-50 duration-100">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pretraži artikle, SKU, barkodove, dokumente, partnere ili unesi komandu..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="ml-2 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-mono text-slate-400">
            ESC za izlaz
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Commands section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Brze komande
            </div>
            <div className="space-y-1">
              {filteredCommands.slice(0, q ? 3 : 8).map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={() => handleSelect(cmd.action)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="rounded p-1 bg-slate-100 group-hover:bg-white text-slate-600">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-medium text-slate-800">{cmd.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                      <span>Pokreni</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products match */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Artikli ({filteredProducts.length})
              </div>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      handleSelect(() => onNavigate('products', { selectedProductId: p.id }))
                    }
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <div className="min-w-0 truncate">
                        <div className="font-medium text-slate-900 truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          SKU: {p.sku} • Barkod: {p.barcode}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="font-mono font-semibold text-slate-900">
                        {formatKM(p.current_price)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Zaliha: {p.stock_quantity} kom
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents match */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Dokumenti ({filteredDocs.length})
              </div>
              <div className="space-y-1">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelect(() => onNavigate(doc.view))}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900 font-mono">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">{doc.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Partners match */}
          {filteredPartners.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Partneri ({filteredPartners.length})
              </div>
              <div className="space-y-1">
                {filteredPartners.map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => handleSelect(() => onNavigate('partners'))}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{part.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {part.city} • JIB: {part.jib || 'Fizičko lice'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                      {part.roles.join(', ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {q &&
            filteredCommands.length === 0 &&
            filteredProducts.length === 0 &&
            filteredDocs.length === 0 &&
            filteredPartners.length === 0 && (
              <div className="py-8 text-center text-slate-500">
                Nema rezultata za upit "{query}". Pokušajte drugi pojam ili šifru.
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-[11px] text-slate-400 flex justify-between items-center">
          <span>Koristite tipke za brzi odabir</span>
          <span className="font-mono">Ctrl+K / Cmd+K</span>
        </div>
      </div>
    </div>
  );
};
