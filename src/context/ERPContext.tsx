import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ArticlePrice,
  AuditLog,
  Category,
  ExternalMapping,
  InventoryCount,
  Partner,
  PriceAdjustment,
  Product,
  RetailCalculation,
  Sale,
  StockMovement,
  StockTransfer,
  SyncLog,
  TaxRate,
  Unit,
  UserProfile,
  Warehouse,
  WriteOff,
} from '../types/erp';
import { INITIAL_CATEGORIES } from '../data/categoriesData';
import { INITIAL_KALKULACIJE } from '../data/kalkulacijeData';
import { INITIAL_NIVELACIJE } from '../data/nivelacijeData';
import {
  INITIAL_PARTNERS,
  INITIAL_TAX_RATES,
  INITIAL_UNITS,
  INITIAL_WAREHOUSES,
} from '../data/partnersData';
import { INITIAL_PRODUCTS } from '../data/productsData';
import {
  generateInitialArticlePrices,
  generateInitialStockMovements,
  INITIAL_AUDIT_LOGS,
  INITIAL_EXTERNAL_MAPPINGS,
  INITIAL_INVENTURA,
  INITIAL_ROLES,
  INITIAL_SALES,
  INITIAL_SYNC_LOGS,
  INITIAL_TRANSFERS,
  INITIAL_USERS,
  INITIAL_WRITEOFFS,
} from '../data/seedDatabase';

interface ERPContextType {
  products: Product[];
  categories: Category[];
  partners: Partner[];
  warehouses: Warehouse[];
  units: Unit[];
  taxRates: TaxRate[];
  stockMovements: StockMovement[];
  articlePrices: ArticlePrice[];
  retailCalculations: RetailCalculation[];
  priceAdjustments: PriceAdjustment[];
  sales: Sale[];
  inventoryCounts: InventoryCount[];
  writeOffs: WriteOff[];
  stockTransfers: StockTransfer[];
  auditLogs: AuditLog[];
  externalMappings: ExternalMapping[];
  syncLogs: SyncLog[];
  activeWarehouse: Warehouse;
  setActiveWarehouse: (w: Warehouse) => void;
  currentUser: UserProfile;
  setCurrentUser: (u: UserProfile) => void;
  // Transactions
  createProduct: (product: Partial<Product>) => Product;
  createRetailCalculation: (calc: Partial<RetailCalculation>, autoPost?: boolean) => RetailCalculation;
  postRetailCalculation: (calcId: string) => void;
  createPriceAdjustment: (adj: Partial<PriceAdjustment>, autoPost?: boolean) => PriceAdjustment;
  postPriceAdjustment: (adjId: string) => void;
  createSale: (sale: Partial<Sale>, autoPost?: boolean) => Sale;
  createInventoryCount: (inv: Partial<InventoryCount>, autoPost?: boolean) => InventoryCount;
  postInventoryCount: (invId: string) => void;
  createWriteOff: (w: Partial<WriteOff>, autoPost?: boolean) => WriteOff;
  postWriteOff: (writeOffId: string) => void;
  createStockTransfer: (t: Partial<StockTransfer>, autoPost?: boolean) => StockTransfer;
  triggerWebshopSync: (productId: string) => void;
  resetToDefaultData: () => void;
  // Helper queries
  getProductStock: (productId: string, warehouseId?: string) => number;
  getProductPrice: (productId: string) => number;
}

const ERPContext = createContext<ERPContextType | null>(null);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('uzeh_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [partners, setPartners] = useState<Partner[]>(() => {
    const saved = localStorage.getItem('uzeh_partners');
    return saved ? JSON.parse(saved) : INITIAL_PARTNERS;
  });

  const [warehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [units] = useState<Unit[]>(INITIAL_UNITS);
  const [taxRates] = useState<TaxRate[]>(INITIAL_TAX_RATES);

  const [activeWarehouse, setActiveWarehouse] = useState<Warehouse>(INITIAL_WAREHOUSES[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const [baseProducts, setBaseProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('uzeh_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('uzeh_stock_movements');
    return saved ? JSON.parse(saved) : generateInitialStockMovements();
  });

  const [articlePrices, setArticlePrices] = useState<ArticlePrice[]>(() => {
    const saved = localStorage.getItem('uzeh_article_prices');
    return saved ? JSON.parse(saved) : generateInitialArticlePrices();
  });

  const [retailCalculations, setRetailCalculations] = useState<RetailCalculation[]>(() => {
    const saved = localStorage.getItem('uzeh_kalkulacije');
    return saved ? JSON.parse(saved) : INITIAL_KALKULACIJE;
  });

  const [priceAdjustments, setPriceAdjustments] = useState<PriceAdjustment[]>(() => {
    const saved = localStorage.getItem('uzeh_nivelacije');
    return saved ? JSON.parse(saved) : INITIAL_NIVELACIJE;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('uzeh_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>(() => {
    const saved = localStorage.getItem('uzeh_inventory_counts');
    return saved ? JSON.parse(saved) : INITIAL_INVENTURA;
  });

  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(() => {
    const saved = localStorage.getItem('uzeh_write_offs');
    return saved ? JSON.parse(saved) : INITIAL_WRITEOFFS;
  });

  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem('uzeh_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('uzeh_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [externalMappings, setExternalMappings] = useState<ExternalMapping[]>(() => {
    const saved = localStorage.getItem('uzeh_external_mappings');
    return saved ? JSON.parse(saved) : INITIAL_EXTERNAL_MAPPINGS;
  });

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    const saved = localStorage.getItem('uzeh_sync_logs');
    return saved ? JSON.parse(saved) : INITIAL_SYNC_LOGS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('uzeh_products', JSON.stringify(baseProducts));
      localStorage.setItem('uzeh_stock_movements', JSON.stringify(stockMovements));
      localStorage.setItem('uzeh_article_prices', JSON.stringify(articlePrices));
      localStorage.setItem('uzeh_kalkulacije', JSON.stringify(retailCalculations));
      localStorage.setItem('uzeh_nivelacije', JSON.stringify(priceAdjustments));
      localStorage.setItem('uzeh_sales', JSON.stringify(sales));
      localStorage.setItem('uzeh_inventory_counts', JSON.stringify(inventoryCounts));
      localStorage.setItem('uzeh_write_offs', JSON.stringify(writeOffs));
      localStorage.setItem('uzeh_transfers', JSON.stringify(stockTransfers));
      localStorage.setItem('uzeh_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('uzeh_external_mappings', JSON.stringify(externalMappings));
      localStorage.setItem('uzeh_sync_logs', JSON.stringify(syncLogs));
    } catch {
      // ignore storage quota errors
    }
  }, [
    baseProducts,
    stockMovements,
    articlePrices,
    retailCalculations,
    priceAdjustments,
    sales,
    inventoryCounts,
    writeOffs,
    stockTransfers,
    auditLogs,
    externalMappings,
    syncLogs,
  ]);

  // Derived stock helper
  const getProductStock = (productId: string, warehouseId?: string): number => {
    return stockMovements
      .filter((m) => m.product_id === productId && (!warehouseId || m.warehouse_id === warehouseId))
      .reduce((acc, m) => acc + m.quantity, 0);
  };

  // Derived active price helper
  const getProductPrice = (productId: string): number => {
    const pricesForProduct = articlePrices.filter((p) => p.product_id === productId);
    if (pricesForProduct.length === 0) return 0;
    // Get latest active price
    const sorted = [...pricesForProduct].sort(
      (a, b) => new Date(b.valid_from).getTime() - new Date(a.valid_from).getTime()
    );
    return sorted[0].price;
  };

  // Dynamically augment products with REAL calculated stock & price
  const products: Product[] = useMemo(() => {
    return baseProducts.map((p) => {
      const stock = stockMovements
        .filter((m) => m.product_id === p.id)
        .reduce((acc, m) => acc + m.quantity, 0);

      const price = getProductPrice(p.id) || p.current_price;
      const cat = categories.find((c) => c.id === p.category_id);

      return {
        ...p,
        category_name: cat ? cat.name : p.category_name || 'Ostalo',
        stock_quantity: Math.max(0, stock),
        current_price: price,
        stock_value: Math.max(0, stock) * price,
      };
    });
  }, [baseProducts, stockMovements, articlePrices, categories]);

  // ============================================================================
  // BUSINESS OPERATIONS & ATOMIC POSTING
  // ============================================================================

  const addAuditLog = (
    action: AuditLog['action'],
    entity_type: string,
    entity_id: string,
    details: string,
    old_values?: Record<string, unknown>,
    new_values?: Record<string, unknown>
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      action,
      entity_type,
      entity_id,
      details,
      old_values: old_values || null,
      new_values: new_values || null,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const createProduct = (productData: Partial<Product>): Product => {
    const sku = productData.sku || `SKU-${String(products.length + 1).padStart(3, '0')}`;
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku,
      barcode: productData.barcode || `387000100${String(products.length + 1).padStart(4, '0')}`,
      name: productData.name || 'Novi artikal',
      description: productData.description || '',
      category_id: productData.category_id || categories[0].id,
      category_name: categories.find((c) => c.id === productData.category_id)?.name || 'Opšte',
      brand_id: productData.brand_id || null,
      unit_id: productData.unit_id || 'unit-kom',
      unit_code: 'kom',
      tax_rate_id: productData.tax_rate_id || 'tax-17',
      tax_rate: 17,
      active: true,
      current_purchase_price: productData.current_purchase_price || 0,
      current_price: productData.current_price || 0,
      stock_quantity: 0,
      stock_value: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBaseProducts((prev) => [newProd, ...prev]);

    // Initial price record
    if (newProd.current_price > 0) {
      setArticlePrices((prev) => [
        {
          id: `price-init-${newProd.id}`,
          product_id: newProd.id,
          price: newProd.current_price,
          price_type: 'REGULAR',
          valid_from: new Date().toISOString().split('T')[0],
          reason: 'Inicijalna cijena pri kreiranju artikla',
          created_by: currentUser.full_name,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    addAuditLog('CREATE', 'PRODUCT', newProd.id, `Kreiran artikal ${newProd.name} (${newProd.sku})`);
    return newProd;
  };

  const createRetailCalculation = (
    calcData: Partial<RetailCalculation>,
    autoPost = false
  ): RetailCalculation => {
    const nextNum = retailCalculations.length + 1;
    const docNumber = `KAL-${String(nextNum).padStart(2, '0')}/2026`;
    const newCalc: RetailCalculation = {
      id: `kal-${Date.now()}`,
      document_number: docNumber,
      date: calcData.date || new Date().toISOString().split('T')[0],
      supplier_id: calcData.supplier_id || partners[0].id,
      supplier_name: partners.find((p) => p.id === calcData.supplier_id)?.name || calcData.supplier_name || 'Dobavljač',
      invoice_number: calcData.invoice_number || `BF: ${Math.floor(100000 + Math.random() * 900000)}`,
      invoice_date: calcData.invoice_date || new Date().toISOString().split('T')[0],
      warehouse_id: calcData.warehouse_id || activeWarehouse.id,
      warehouse_name: activeWarehouse.name,
      status: 'DRAFT',
      lines: calcData.lines || [],
      total_purchase_value: calcData.total_purchase_value || 0,
      total_margin_value: calcData.total_margin_value || 0,
      total_retail_value: calcData.total_retail_value || 0,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    setRetailCalculations((prev) => [newCalc, ...prev]);
    addAuditLog('CREATE', 'RETAIL_CALCULATION', newCalc.id, `Kreiran nacrt kalkulacije ${newCalc.document_number}`);

    if (autoPost) {
      postRetailCalculation(newCalc.id);
    }

    return newCalc;
  };

  const postRetailCalculation = (calcId: string) => {
    const calc = retailCalculations.find((k) => k.id === calcId);
    if (!calc) throw new Error('Kalkulacija nije pronađena.');
    if (calc.status === 'POSTED') throw new Error('Kalkulacija je već knjižena.');
    if (!calc.lines || calc.lines.length === 0) throw new Error('Dokument se ne može knjižiti jer nema stavki.');

    // 1. Create atomic stock movements for every line
    const newMovements: StockMovement[] = calc.lines.map((line) => ({
      id: `mov-${Date.now()}-${line.id}`,
      product_id: line.product_id,
      warehouse_id: calc.warehouse_id,
      quantity: line.quantity,
      movement_type: 'PURCHASE',
      reference_type: 'RETAIL_CALCULATION',
      reference_id: calc.id,
      reference_number: calc.document_number,
      unit_cost: line.cost_price,
      created_at: new Date().toISOString(),
      created_by: currentUser.full_name,
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);

    // 2. Version prices if new selling prices are defined
    const newPrices: ArticlePrice[] = calc.lines.map((line) => ({
      id: `price-kal-${calc.id}-${line.id}`,
      product_id: line.product_id,
      price: line.selling_price,
      price_type: 'REGULAR',
      valid_from: calc.date,
      reason: `Kalkulacija ${calc.document_number} (${calc.supplier_name})`,
      source_document_id: calc.id,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
    }));

    setArticlePrices((prev) => [...newPrices, ...prev]);

    // 3. Update status to POSTED
    setRetailCalculations((prev) =>
      prev.map((k) =>
        k.id === calcId
          ? {
              ...k,
              status: 'POSTED',
              posted_at: new Date().toISOString(),
            }
          : k
      )
    );

    addAuditLog(
      'POST',
      'RETAIL_CALCULATION',
      calc.id,
      `Uspješno knjižena kalkulacija ${calc.document_number} sa ${calc.lines.length} stavki na stanje skladišta.`
    );
  };

  const createPriceAdjustment = (
    adjData: Partial<PriceAdjustment>,
    autoPost = false
  ): PriceAdjustment => {
    const nextNum = priceAdjustments.length + 1;
    const docNumber = `NIV-${String(nextNum).padStart(2, '0')}/2026`;
    const newAdj: PriceAdjustment = {
      id: `niv-${Date.now()}`,
      document_number: docNumber,
      date: adjData.date || new Date().toISOString().split('T')[0],
      reason: adjData.reason || 'Redovno usklađivanje cijena',
      status: 'DRAFT',
      lines: adjData.lines || [],
      total_difference: adjData.total_difference || 0,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
    };

    setPriceAdjustments((prev) => [newAdj, ...prev]);
    addAuditLog('CREATE', 'PRICE_ADJUSTMENT', newAdj.id, `Kreiran nacrt nivelacije ${newAdj.document_number}`);

    if (autoPost) {
      postPriceAdjustment(newAdj.id);
    }

    return newAdj;
  };

  const postPriceAdjustment = (adjId: string) => {
    const adj = priceAdjustments.find((n) => n.id === adjId);
    if (!adj) throw new Error('Nivelacija nije pronađena.');
    if (adj.status === 'POSTED') throw new Error('Nivelacija je već knjižena.');
    if (!adj.lines || adj.lines.length === 0) throw new Error('Nije moguće knjižiti nivelaciju bez stavki.');

    // Create immutable new price records
    const newPrices: ArticlePrice[] = adj.lines.map((line) => ({
      id: `price-niv-${adj.id}-${line.id}`,
      product_id: line.product_id,
      price: line.new_price,
      price_type: line.new_price < line.old_price ? 'ACTION' : 'REGULAR',
      valid_from: adj.date,
      reason: `${adj.document_number}: ${adj.reason}`,
      source_document_id: adj.id,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
    }));

    setArticlePrices((prev) => [...newPrices, ...prev]);

    setPriceAdjustments((prev) =>
      prev.map((n) =>
        n.id === adjId
          ? {
              ...n,
              status: 'POSTED',
              posted_at: new Date().toISOString(),
            }
          : n
      )
    );

    addAuditLog(
      'PRICE_CHANGE',
      'PRICE_ADJUSTMENT',
      adj.id,
      `Knjiženje nivelacije ${adj.document_number} sa ukupnom razlikom ${adj.total_difference.toFixed(2)} KM.`
    );
  };

  const createSale = (saleData: Partial<Sale>, autoPost = true): Sale => {
    if (!saleData.lines || saleData.lines.length === 0) {
      throw new Error('Nije moguće sačuvati račun bez stavki.');
    }

    const warehouseId = saleData.warehouse_id || activeWarehouse.id;

    // Check stock availability if posting
    if (autoPost) {
      for (const line of saleData.lines) {
        const availableStock = getProductStock(line.product_id, warehouseId);
        if (availableStock < line.quantity) {
          throw new Error(
            `Artikal "${line.product_name}" nema dovoljno zalihe na skladištu. Dostupno: ${availableStock}, Traženo: ${line.quantity}`
          );
        }
      }
    }

    const nextNum = sales.length + 1;
    const docNumber = `MP-2026-${String(nextNum).padStart(6, '0')}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      document_number: docNumber,
      date: saleData.date || new Date().toISOString().split('T')[0],
      warehouse_id: warehouseId,
      warehouse_name: activeWarehouse.name,
      customer_id: saleData.customer_id || null,
      customer_name: saleData.customer_name || 'Krajnji kupac (Maloprodaja)',
      status: autoPost ? 'POSTED' : 'DRAFT',
      lines: saleData.lines,
      payments: saleData.payments || [
        {
          id: `pay-${Date.now()}`,
          sale_id: `sale-${Date.now()}`,
          payment_method_id: 'pm-cash',
          payment_method_name: 'Gotovina',
          amount: saleData.total_amount || 0,
          created_at: new Date().toISOString(),
        },
      ],
      subtotal_amount: saleData.subtotal_amount || 0,
      tax_amount: saleData.tax_amount || 0,
      total_amount: saleData.total_amount || 0,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
      posted_at: autoPost ? new Date().toISOString() : null,
    };

    setSales((prev) => [newSale, ...prev]);

    // Atomic negative stock movements
    if (autoPost) {
      const newMovements: StockMovement[] = newSale.lines.map((line) => {
        const prod = products.find((p) => p.id === line.product_id);
        return {
          id: `mov-sale-${newSale.id}-${line.id}`,
          product_id: line.product_id,
          warehouse_id: warehouseId,
          quantity: -line.quantity, // Negative for sale!
          movement_type: 'SALE',
          reference_type: 'SALE',
          reference_id: newSale.id,
          reference_number: newSale.document_number,
          unit_cost: prod ? prod.current_purchase_price : 0,
          created_at: new Date().toISOString(),
          created_by: currentUser.full_name,
        };
      });

      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    addAuditLog('POST', 'SALE', newSale.id, `Izdavanje računa ${newSale.document_number} u iznosu ${newSale.total_amount.toFixed(2)} KM`);
    return newSale;
  };

  const createInventoryCount = (
    invData: Partial<InventoryCount>,
    autoPost = false
  ): InventoryCount => {
    const nextNum = inventoryCounts.length + 1;
    const docNumber = `INV-2026-${String(nextNum).padStart(6, '0')}`;
    const newInv: InventoryCount = {
      id: `inv-${Date.now()}`,
      document_number: docNumber,
      warehouse_id: invData.warehouse_id || activeWarehouse.id,
      warehouse_name: activeWarehouse.name,
      date: invData.date || new Date().toISOString().split('T')[0],
      status: autoPost ? 'POSTED' : 'DRAFT',
      lines: invData.lines || [],
      total_surplus_value: invData.total_surplus_value || 0,
      total_deficit_value: invData.total_deficit_value || 0,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
      posted_at: autoPost ? new Date().toISOString() : null,
    };

    setInventoryCounts((prev) => [newInv, ...prev]);
    addAuditLog('CREATE', 'INVENTORY_COUNT', newInv.id, `Kreiran popis inventure ${newInv.document_number}`);

    if (autoPost) {
      postInventoryCount(newInv.id);
    }

    return newInv;
  };

  const postInventoryCount = (invId: string) => {
    const inv = inventoryCounts.find((i) => i.id === invId);
    if (!inv) throw new Error('Inventura nije pronađena.');
    if (inv.status === 'POSTED') throw new Error('Inventura je već knjižena.');

    // Differences generate INVENTORY_ADJUSTMENT stock movements
    const newMovements: StockMovement[] = [];
    inv.lines.forEach((line) => {
      if (line.difference !== 0) {
        newMovements.push({
          id: `mov-inv-${inv.id}-${line.id}`,
          product_id: line.product_id,
          warehouse_id: inv.warehouse_id,
          quantity: line.difference,
          movement_type: 'INVENTORY_ADJUSTMENT',
          reference_type: 'INVENTORY_COUNT',
          reference_id: inv.id,
          reference_number: inv.document_number,
          unit_cost: line.unit_price,
          created_at: new Date().toISOString(),
          created_by: currentUser.full_name,
        });
      }
    });

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    setInventoryCounts((prev) =>
      prev.map((i) =>
        i.id === invId
          ? {
              ...i,
              status: 'POSTED',
              posted_at: new Date().toISOString(),
            }
          : i
      )
    );

    addAuditLog('POST', 'INVENTORY_COUNT', inv.id, `Knjiženje inventure ${inv.document_number} sa ${newMovements.length} usklađenja.`);
  };

  const createWriteOff = (wData: Partial<WriteOff>, autoPost = false): WriteOff => {
    const nextNum = writeOffs.length + 1;
    const docNumber = `OTP-2026-${String(nextNum).padStart(6, '0')}`;
    const newW: WriteOff = {
      id: `otp-${Date.now()}`,
      document_number: docNumber,
      warehouse_id: wData.warehouse_id || activeWarehouse.id,
      warehouse_name: activeWarehouse.name,
      date: wData.date || new Date().toISOString().split('T')[0],
      reason: wData.reason || 'DAMAGED',
      notes: wData.notes || '',
      status: autoPost ? 'POSTED' : 'DRAFT',
      lines: wData.lines || [],
      total_amount: wData.total_amount || 0,
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
      posted_at: autoPost ? new Date().toISOString() : null,
    };

    setWriteOffs((prev) => [newW, ...prev]);
    addAuditLog('CREATE', 'WRITE_OFF', newW.id, `Kreiran nalog za otpis robe ${newW.document_number}`);

    if (autoPost) {
      postWriteOff(newW.id);
    }

    return newW;
  };

  const postWriteOff = (writeOffId: string) => {
    const w = writeOffs.find((o) => o.id === writeOffId);
    if (!w) throw new Error('Otpis nije pronađen.');
    if (w.status === 'POSTED') throw new Error('Otpis je već knjižen.');

    const newMovements: StockMovement[] = w.lines.map((line) => ({
      id: `mov-otp-${w.id}-${line.id}`,
      product_id: line.product_id,
      warehouse_id: w.warehouse_id,
      quantity: -line.quantity, // Negative
      movement_type: 'WRITE_OFF',
      reference_type: 'WRITE_OFF',
      reference_id: w.id,
      reference_number: w.document_number,
      unit_cost: line.unit_cost,
      created_at: new Date().toISOString(),
      created_by: currentUser.full_name,
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);

    setWriteOffs((prev) =>
      prev.map((o) =>
        o.id === writeOffId
          ? {
              ...o,
              status: 'POSTED',
              posted_at: new Date().toISOString(),
            }
          : o
      )
    );

    addAuditLog('POST', 'WRITE_OFF', w.id, `Knjižen otpis robe ${w.document_number} u vrijednosti ${w.total_amount.toFixed(2)} KM`);
  };

  const createStockTransfer = (tData: Partial<StockTransfer>, autoPost = true): StockTransfer => {
    const nextNum = stockTransfers.length + 1;
    const docNumber = `PRE-2026-${String(nextNum).padStart(6, '0')}`;
    const newTransfer: StockTransfer = {
      id: `pre-${Date.now()}`,
      document_number: docNumber,
      date: tData.date || new Date().toISOString().split('T')[0],
      source_warehouse_id: tData.source_warehouse_id || warehouses[1].id,
      source_warehouse_name: warehouses.find((w) => w.id === tData.source_warehouse_id)?.name || 'Centralno skladište',
      target_warehouse_id: tData.target_warehouse_id || warehouses[0].id,
      target_warehouse_name: warehouses.find((w) => w.id === tData.target_warehouse_id)?.name || 'Maloprodaja',
      status: autoPost ? 'POSTED' : 'DRAFT',
      lines: tData.lines || [],
      notes: tData.notes || '',
      created_by: currentUser.full_name,
      created_at: new Date().toISOString(),
      posted_at: autoPost ? new Date().toISOString() : null,
    };

    setStockTransfers((prev) => [newTransfer, ...prev]);

    if (autoPost && newTransfer.lines.length > 0) {
      const newMovements: StockMovement[] = [];
      newTransfer.lines.forEach((line) => {
        // Outflow from source
        newMovements.push({
          id: `mov-trans-out-${newTransfer.id}-${line.id}`,
          product_id: line.product_id,
          warehouse_id: newTransfer.source_warehouse_id,
          quantity: -line.quantity,
          movement_type: 'TRANSFER_OUT',
          reference_type: 'TRANSFER',
          reference_id: newTransfer.id,
          reference_number: newTransfer.document_number,
          unit_cost: 0,
          created_at: new Date().toISOString(),
          created_by: currentUser.full_name,
        });

        // Inflow to target
        newMovements.push({
          id: `mov-trans-in-${newTransfer.id}-${line.id}`,
          product_id: line.product_id,
          warehouse_id: newTransfer.target_warehouse_id,
          quantity: line.quantity,
          movement_type: 'TRANSFER_IN',
          reference_type: 'TRANSFER',
          reference_id: newTransfer.id,
          reference_number: newTransfer.document_number,
          unit_cost: 0,
          created_at: new Date().toISOString(),
          created_by: currentUser.full_name,
        });
      });

      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    addAuditLog('POST', 'STOCK_TRANSFER', newTransfer.id, `Prenos robe ${newTransfer.document_number} između skladišta`);
    return newTransfer;
  };

  const triggerWebshopSync = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const now = new Date().toISOString();
    setExternalMappings((prev) =>
      prev.map((m) =>
        m.product_id === productId
          ? { ...m, last_synced_at: now, sync_status: 'SYNCED' }
          : m
      )
    );

    const newSyncLog: SyncLog = {
      id: `sync-${Date.now()}`,
      entity_type: 'PRODUCT_SYNC',
      entity_id: prod.sku,
      action: 'ERP_TO_WEBSHOP',
      status: 'SUCCESS',
      message: `Uspješno poslato na Uzeh.ba webshop: ${prod.name} | Cijena: ${prod.current_price.toFixed(2)} KM | Stanje: ${prod.stock_quantity} kom`,
      created_at: now,
    };
    setSyncLogs((prev) => [newSyncLog, ...prev]);
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setCategories(INITIAL_CATEGORIES);
    setPartners(INITIAL_PARTNERS);
    setBaseProducts(INITIAL_PRODUCTS);
    setStockMovements(generateInitialStockMovements());
    setArticlePrices(generateInitialArticlePrices());
    setRetailCalculations(INITIAL_KALKULACIJE);
    setPriceAdjustments(INITIAL_NIVELACIJE);
    setSales(INITIAL_SALES);
    setInventoryCounts(INITIAL_INVENTURA);
    setWriteOffs(INITIAL_WRITEOFFS);
    setStockTransfers(INITIAL_TRANSFERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setExternalMappings(INITIAL_EXTERNAL_MAPPINGS);
    setSyncLogs(INITIAL_SYNC_LOGS);
  };

  return (
    <ERPContext.Provider
      value={{
        products,
        categories,
        partners,
        warehouses,
        units,
        taxRates,
        stockMovements,
        articlePrices,
        retailCalculations,
        priceAdjustments,
        sales,
        inventoryCounts,
        writeOffs,
        stockTransfers,
        auditLogs,
        externalMappings,
        syncLogs,
        activeWarehouse,
        setActiveWarehouse,
        currentUser,
        setCurrentUser,
        createProduct,
        createRetailCalculation,
        postRetailCalculation,
        createPriceAdjustment,
        postPriceAdjustment,
        createSale,
        createInventoryCount,
        postInventoryCount,
        createWriteOff,
        postWriteOff,
        createStockTransfer,
        triggerWebshopSync,
        resetToDefaultData,
        getProductStock,
        getProductPrice,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) throw new Error('useERP must be used within an ERPProvider');
  return context;
};
