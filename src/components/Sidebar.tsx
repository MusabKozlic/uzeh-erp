import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  FolderTree,
  Tags,
  Ruler,
  FileSpreadsheet,
  Percent,
  PlusCircle,
  Truck,
  RotateCcw,
  ShoppingCart,
  Users,
  Layers,
  ArrowLeftRight,
  ClipboardCheck,
  Trash2,
  TrendingUp,
  Coins,
  Receipt,
  Globe,
  ShieldCheck,
  Store,
  Settings,
  History,
  Database,
  X,
  CreditCard,
} from 'lucide-react';
import { useERP } from '../context/ERPContext';

export type NavView =
  | 'dashboard'
  // Artikli & Cijene
  | 'products'
  | 'product_detail'
  | 'categories'
  | 'brands'
  | 'units'
  | 'price_list'
  | 'nivelacije'
  // Nabavka
  | 'purchase_entry'
  | 'kalkulacije'
  | 'suppliers'
  | 'supplier_returns'
  // Prodaja
  | 'sales'
  | 'customers'
  | 'customer_returns'
  // Skladište
  | 'stock_status'
  | 'stock_movements'
  | 'transfers'
  | 'inventory'
  | 'write_offs'
  // Izvještaji
  | 'report_sales'
  | 'report_purchases'
  | 'report_stock'
  | 'report_margins'
  | 'report_tkm'
  // Integracije
  | 'webshop_sync'
  // Administracija
  | 'admin_users'
  | 'admin_warehouses'
  | 'settings'
  | 'audit_logs'
  | 'database_schema';

interface SidebarProps {
  activeTab: NavView;
  onSelectTab: (view: NavView) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { products, retailCalculations, priceAdjustments, sales, stockMovements } = useERP();

  const navGroups = [
    {
      title: 'Pregled',
      items: [
        {
          id: 'dashboard' as NavView,
          label: 'Nadzorna ploča',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      title: 'Artikli & Cijene',
      items: [
        {
          id: 'products' as NavView,
          label: 'Artikli',
          icon: Boxes,
          badge: products.length,
          badgeColor: 'bg-slate-800 text-slate-300',
        },
        {
          id: 'categories' as NavView,
          label: 'Kategorije',
          icon: FolderTree,
          badge: null,
        },
        {
          id: 'brands' as NavView,
          label: 'Brendovi',
          icon: Tags,
          badge: null,
        },
        {
          id: 'units' as NavView,
          label: 'Jedinice mjere',
          icon: Ruler,
          badge: null,
        },
        {
          id: 'price_list' as NavView,
          label: 'Cjenovnik',
          icon: Coins,
          badge: null,
        },
        {
          id: 'nivelacije' as NavView,
          label: 'Nivelacije',
          icon: Percent,
          badge: priceAdjustments.length,
          badgeColor: 'bg-purple-900/60 text-purple-200',
        },
      ],
    },
    {
      title: 'Nabavka',
      items: [
        {
          id: 'purchase_entry' as NavView,
          label: 'Ulaz robe (Novi unos)',
          icon: PlusCircle,
          badge: 'NOVO',
          badgeColor: 'bg-emerald-900/80 text-emerald-300 font-bold',
        },
        {
          id: 'kalkulacije' as NavView,
          label: 'Kalkulacije',
          icon: FileSpreadsheet,
          badge: retailCalculations.length,
          badgeColor: 'bg-blue-900/60 text-blue-200',
        },
        {
          id: 'suppliers' as NavView,
          label: 'Dobavljači',
          icon: Truck,
          badge: null,
        },
        {
          id: 'supplier_returns' as NavView,
          label: 'Povrat dobavljaču',
          icon: RotateCcw,
          badge: null,
        },
      ],
    },
    {
      title: 'Prodaja',
      items: [
        {
          id: 'sales' as NavView,
          label: 'Računi / Prodaja',
          icon: ShoppingCart,
          badge: sales.length,
          badgeColor: 'bg-emerald-900/60 text-emerald-200',
        },
        {
          id: 'customers' as NavView,
          label: 'Kupci',
          icon: Users,
          badge: null,
        },
        {
          id: 'customer_returns' as NavView,
          label: 'Povrat kupca',
          icon: RotateCcw,
          badge: null,
        },
      ],
    },
    {
      title: 'Skladište',
      items: [
        {
          id: 'stock_status' as NavView,
          label: 'Stanje zalihe',
          icon: Layers,
          badge: null,
        },
        {
          id: 'stock_movements' as NavView,
          label: 'Promet zalihe',
          icon: ArrowLeftRight,
          badge: null,
        },
        {
          id: 'transfers' as NavView,
          label: 'Prenos između skladišta',
          icon: Truck,
          badge: null,
        },
        {
          id: 'inventory' as NavView,
          label: 'Inventura',
          icon: ClipboardCheck,
          badge: null,
        },
        {
          id: 'write_offs' as NavView,
          label: 'Otpis',
          icon: Trash2,
          badge: null,
        },
      ],
    },
    {
      title: 'Izvještaji',
      items: [
        {
          id: 'report_sales' as NavView,
          label: 'Prodaja',
          icon: TrendingUp,
          badge: null,
        },
        {
          id: 'report_purchases' as NavView,
          label: 'Nabavka',
          icon: Truck,
          badge: null,
        },
        {
          id: 'report_stock' as NavView,
          label: 'Zaliha',
          icon: Layers,
          badge: null,
        },
        {
          id: 'report_margins' as NavView,
          label: 'Marža',
          icon: Percent,
          badge: null,
        },
        {
          id: 'report_tkm' as NavView,
          label: 'TKM (Trgovačka knjiga)',
          icon: Receipt,
          badge: null,
        },
      ],
    },
    {
      title: 'Integracije',
      items: [
        {
          id: 'webshop_sync' as NavView,
          label: 'Uzeh.ba Webshop',
          icon: Globe,
          badge: 'API',
          badgeColor: 'bg-amber-900/80 text-amber-300 font-bold',
        },
      ],
    },
    {
      title: 'Administracija',
      items: [
        {
          id: 'admin_users' as NavView,
          label: 'Korisnici & Uloge',
          icon: ShieldCheck,
          badge: null,
        },
        {
          id: 'admin_warehouses' as NavView,
          label: 'Skladišta',
          icon: Store,
          badge: null,
        },
        {
          id: 'settings' as NavView,
          label: 'Postavke',
          icon: Settings,
          badge: null,
        },
        {
          id: 'audit_logs' as NavView,
          label: 'Revizijski trag (Audit Log)',
          icon: History,
          badge: null,
        },
        {
          id: 'database_schema' as NavView,
          label: 'Baza & SQL Schema',
          icon: Database,
          badge: 'DDL',
          badgeColor: 'bg-indigo-900/80 text-indigo-300',
        },
      ],
    },
  ];

  const handleItemClick = (id: NavView) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-lg shadow-sm shadow-emerald-900/40">
              U
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white tracking-wide text-base">UZEH ERP</span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400">
                  PROD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">BiH Retail Cloud ERP</p>
            </div>
          </div>

          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                {group.title}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-mono ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span>Izvor istine:</span>
            <span className="font-mono text-emerald-400 font-semibold">PostgreSQL (ERP)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Valuta & Porez:</span>
            <span className="font-semibold text-slate-200">KM (BAM) • PDV 17%</span>
          </div>
        </div>
      </aside>
    </>
  );
};
