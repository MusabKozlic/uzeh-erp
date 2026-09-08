/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Header } from './components/Header';
import { NavView, Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/ui/CommandPalette';
import { Product } from './types/erp';

// Core Application Views
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { ProductDetailView } from './components/ProductDetailView';
import { CategoriesView } from './components/CategoriesView';
import { GenericDocumentListView } from './components/GenericDocumentListView';
import { PurchaseEntryView } from './components/PurchaseEntryView';
import { KalkulacijeView } from './components/KalkulacijeView';
import { NivelacijeView } from './components/NivelacijeView';
import { StockMovementsView } from './components/StockMovementsView';
import { SalesView } from './components/SalesView';
import { InventoryView } from './components/InventoryView';
import { ReportsView } from './components/ReportsView';
import { WebshopSyncView } from './components/WebshopSyncView';
import { AdministrationView } from './components/AdministrationView';
import { SettingsView } from './components/SettingsView';
import { AuditLogView } from './components/AuditLogView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';

const VIEW_TITLES: Record<NavView, string> = {
  dashboard: 'Nadzorna ploča & Glavni pokazatelji',
  products: 'Katalog i šifarnik artikala',
  product_detail: 'Detalji artikla & Kartica',
  categories: 'Klasifikacija & Robne kategorije',
  brands: 'Robne marke & Proizvođači',
  units: 'Jedinice mjere (Šifarnik)',
  price_list: 'Aktivni cjenovnik artikala (MPC)',
  nivelacije: 'Nivelacije maloprodajnih cijena',
  purchase_entry: 'Ulaz robe • Novi unos primke / kalkulacije',
  kalkulacije: 'Kalkulacije maloprodajnih cijena (Ulaz)',
  suppliers: 'Evidencija dobavljača & Partnera',
  supplier_returns: 'Povrati robe dobavljačima',
  sales: 'Maloprodajna kasa & Izdavanje računa (POS)',
  customers: 'Kupci & B2B Partneri',
  customer_returns: 'Povrati robe od kupaca',
  stock_status: 'Trenutno stanje zaliha po magacinima',
  stock_movements: 'Dnevnik kretanja zaliha (Stock Movements)',
  transfers: 'Međuskladišnice (Prenos robe)',
  inventory: 'Popisi zaliha (Inventura)',
  write_offs: 'Zapisnici o otpisu robe (Kalo/Lom/Kvar)',
  report_sales: 'Izvještaj: Realizacija i promet prodaje',
  report_purchases: 'Izvještaj: Nabavke i fakture dobavljača',
  report_stock: 'Izvještaj: Stanje i obrt zaliha',
  report_margins: 'Izvještaj: Ostvarena marža i RUC',
  report_tkm: 'Trgovačka knjiga na malo (TKM)',
  webshop_sync: 'Uzeh.ba Webshop API & Sinhronizacija',
  admin_users: 'Administracija korisnika & Prava pristupa',
  admin_warehouses: 'Organizacija skladišta & Poslovnih jedinica',
  settings: 'Konfiguracija & Postavke ERP sistema',
  audit_logs: 'Dnevnik aktivnosti & Revizijski trag (Audit Log)',
  database_schema: 'Supabase PostgreSQL Baza & DDL Migracija',
};

function ERPAppContent() {
  const [activeTab, setActiveTab] = useState<NavView>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const { products } = useERP();
  const toast = useToast();

  // Global Keyboard Shortcuts (Ctrl+K, Ctrl+N, Ctrl+S, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K -> Toggle command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }

      // Ctrl+N -> New entry depending on page
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        if (activeTab === 'kalkulacije') {
          setActiveTab('purchase_entry');
          toast.info('Otvaranje unosa novog ulaza robe...');
        } else if (activeTab === 'products') {
          toast.info('Otvaranje dijaloga za novi artikal...');
        } else if (activeTab === 'sales') {
          toast.info('Otvaranje novog POS računa...');
        } else {
          setActiveTab('purchase_entry');
          toast.info('Otvaranje novog dokumenta...');
        }
      }

      // Ctrl+S -> Save draft / prompt
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toast.success('Nacrt je automatski sačuvan u memoriji.');
      }

      // Escape -> Close command palette or mobile menu
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
        }
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, isCommandPaletteOpen, isMobileMenuOpen, toast]);

  const handleOpenProductDetail = (p: Product) => {
    setSelectedProduct(p);
    setActiveTab('product_detail');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab as NavView)} />;

      // Artikli & Cijene
      case 'products':
        return <ProductsView onOpenProductDetail={handleOpenProductDetail} />;
      case 'product_detail':
        return (
          <ProductDetailView
            product={selectedProduct || products[0]}
            onBack={() => setActiveTab('products')}
            onEdit={(p) => {
              setSelectedProduct(p);
              setActiveTab('products');
            }}
          />
        );
      case 'categories':
        return <CategoriesView />;
      case 'brands':
        return <GenericDocumentListView type="brands" />;
      case 'units':
        return <GenericDocumentListView type="units" />;
      case 'price_list':
        return <GenericDocumentListView type="price_list" />;
      case 'nivelacije':
        return <NivelacijeView />;

      // Nabavka
      case 'purchase_entry':
        return (
          <PurchaseEntryView
            onFinish={() => setActiveTab('kalkulacije')}
            onCancel={() => setActiveTab('kalkulacije')}
          />
        );
      case 'kalkulacije':
        return <KalkulacijeView onNavigateNewEntry={() => setActiveTab('purchase_entry')} />;
      case 'suppliers':
        return <GenericDocumentListView type="suppliers" />;
      case 'supplier_returns':
        return <GenericDocumentListView type="supplier_returns" />;

      // Prodaja
      case 'sales':
        return <SalesView />;
      case 'customers':
        return <GenericDocumentListView type="customers" />;
      case 'customer_returns':
        return <GenericDocumentListView type="customer_returns" />;

      // Skladište
      case 'stock_status':
        return <GenericDocumentListView type="stock_status" />;
      case 'stock_movements':
        return <StockMovementsView />;
      case 'transfers':
        return <GenericDocumentListView type="transfers" />;
      case 'inventory':
        return <InventoryView />;
      case 'write_offs':
        return <GenericDocumentListView type="write_offs" />;

      // Izvještaji
      case 'report_sales':
        return (
          <ReportsView
            initialType="report_sales"
            onNavigate={(tab) => setActiveTab(tab as NavView)}
          />
        );
      case 'report_purchases':
        return (
          <ReportsView
            initialType="report_purchases"
            onNavigate={(tab) => setActiveTab(tab as NavView)}
          />
        );
      case 'report_stock':
        return (
          <ReportsView
            initialType="report_stock"
            onNavigate={(tab) => setActiveTab(tab as NavView)}
          />
        );
      case 'report_margins':
        return (
          <ReportsView
            initialType="report_margins"
            onNavigate={(tab) => setActiveTab(tab as NavView)}
          />
        );
      case 'report_tkm':
        return (
          <ReportsView
            initialType="report_tkm"
            onNavigate={(tab) => setActiveTab(tab as NavView)}
          />
        );

      // Integracije
      case 'webshop_sync':
        return <WebshopSyncView />;

      // Administracija
      case 'admin_users':
        return <AdministrationView initialTab="users" />;
      case 'admin_warehouses':
        return <AdministrationView initialTab="warehouses" />;
      case 'settings':
        return <SettingsView />;
      case 'audit_logs':
        return <AuditLogView />;
      case 'database_schema':
        return <DatabaseSchemaView />;

      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab as NavView)} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          currentViewTitle={VIEW_TITLES[activeTab] || 'Uzeh ERP'}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onNavigateSettings={() => setActiveTab('settings')}
          onNavigateAuditLogs={() => setActiveTab('audit_logs')}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(viewId, extra) => {
          if (viewId === 'products' && extra?.selectedProductId) {
            const p = products.find((prod) => prod.id === extra.selectedProductId);
            if (p) {
              setSelectedProduct(p);
              setActiveTab('product_detail');
              return;
            }
          }
          setActiveTab(viewId as NavView);
        }}
        onOpenNewPurchase={() => setActiveTab('purchase_entry')}
        onOpenNewCalculation={() => setActiveTab('purchase_entry')}
        onOpenNewPriceAdjustment={() => setActiveTab('nivelacije')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ToastProvider>
        <ERPAppContent />
      </ToastProvider>
    </ERPProvider>
  );
}
