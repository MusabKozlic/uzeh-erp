import {
  ArticlePrice,
  AuditLog,
  ExternalMapping,
  InventoryCount,
  Product,
  Sale,
  StockMovement,
  StockTransfer,
  SyncLog,
  UserProfile,
  UserRole,
  WriteOff,
} from '../types/erp';
import { INITIAL_CATEGORIES } from './categoriesData';
import { INITIAL_KALKULACIJE } from './kalkulacijeData';
import { INITIAL_NIVELACIJE } from './nivelacijeData';
import { INITIAL_PARTNERS, INITIAL_WAREHOUSES } from './partnersData';
import { INITIAL_PRODUCTS } from './productsData';

export const INITIAL_ROLES: UserRole[] = [
  {
    id: 'role-admin',
    name: 'ADMIN',
    description: 'Puni pristup svim modulima, postavkama i bazama podataka',
    permissions: [
      'products.read', 'products.create', 'products.update', 'products.delete',
      'purchases.read', 'purchases.create', 'purchases.post', 'purchases.cancel',
      'sales.read', 'sales.create', 'sales.post',
      'inventory.read', 'inventory.create', 'inventory.post',
      'prices.read', 'prices.create', 'prices.post',
      'reports.read', 'reports.export',
      'users.manage', 'system.manage', 'sync.manage'
    ],
  },
  {
    id: 'role-manager',
    name: 'MANAGER',
    description: 'Upravljanje artiklima, cijenama, nabavkom i izvještajima',
    permissions: [
      'products.read', 'products.create', 'products.update',
      'purchases.read', 'purchases.create', 'purchases.post',
      'sales.read', 'sales.create', 'sales.post',
      'inventory.read', 'inventory.create', 'inventory.post',
      'prices.read', 'prices.create', 'prices.post',
      'reports.read', 'reports.export',
    ],
  },
  {
    id: 'role-warehouse',
    name: 'WAREHOUSE',
    description: 'Upravljanje skladištem, ulazom robe, inventurom i otpisom',
    permissions: [
      'products.read',
      'purchases.read', 'purchases.create',
      'inventory.read', 'inventory.create', 'inventory.post',
      'reports.read',
    ],
  },
  {
    id: 'role-sales',
    name: 'SALES',
    description: 'Prodaja na kasi, računi i pregled zaliha',
    permissions: [
      'products.read',
      'sales.read', 'sales.create', 'sales.post',
      'inventory.read',
    ],
  },
  {
    id: 'role-accounting',
    name: 'ACCOUNTING',
    description: 'Računovodstvo, TKM knjiga, kalkulacije i finansijski izvještaji',
    permissions: [
      'products.read',
      'purchases.read',
      'sales.read',
      'prices.read',
      'reports.read', 'reports.export',
    ],
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-01',
    email: 'belma@uzeh.ba',
    full_name: 'Belma Dedić-Kozlić (Vlasnik)',
    role: 'ADMIN',
    active: true,
  },
  {
    id: 'user-02',
    email: 'skladiste@uzeh.ba',
    full_name: 'Mirza Hadžić (Skladištar)',
    role: 'WAREHOUSE',
    active: true,
  },
  {
    id: 'user-03',
    email: 'kasa@uzeh.ba',
    full_name: 'Amra Spahić (Prodavač)',
    role: 'SALES',
    active: true,
  },
  {
    id: 'user-04',
    email: 'racunovodstvo@uzeh.ba',
    full_name: 'Edin Kovačević (Knjigovođa)',
    role: 'ACCOUNTING',
    active: true,
  },
];

// Generate initial stock movements based on the kalkulacije and products
export function generateInitialStockMovements(): StockMovement[] {
  const movements: StockMovement[] = [];

  // Stock movements from posted kalkulacije
  INITIAL_KALKULACIJE.forEach((kal) => {
    kal.lines.forEach((line) => {
      movements.push({
        id: `mov-kal-${kal.id}-${line.id}`,
        product_id: line.product_id,
        warehouse_id: kal.warehouse_id,
        quantity: line.quantity,
        movement_type: 'PURCHASE',
        reference_type: 'RETAIL_CALCULATION',
        reference_id: kal.id,
        reference_number: kal.document_number,
        unit_cost: line.cost_price,
        created_at: kal.date + 'T10:00:00Z',
        created_by: kal.created_by,
      });
    });
  });

  // Base movements for products present in 'stanje' but with remainder
  INITIAL_PRODUCTS.forEach((p, idx) => {
    // Check existing movement sum
    const currentSum = movements
      .filter((m) => m.product_id === p.id)
      .reduce((acc, m) => acc + m.quantity, 0);

    const diff = p.stock_quantity - currentSum;
    if (diff !== 0) {
      movements.push({
        id: `mov-init-${p.id}-${idx}`,
        product_id: p.id,
        warehouse_id: 'wh-01',
        quantity: diff,
        movement_type: diff > 0 ? 'PURCHASE' : 'SALE',
        reference_type: 'INITIAL_STOCK',
        reference_id: 'init-doc-2026',
        reference_number: 'POČ-2026-0001',
        unit_cost: p.current_purchase_price,
        created_at: '2026-01-01T08:00:00Z',
        created_by: 'Sistem Uzeh',
      });
    }
  });

  return movements;
}

// Generate versioned prices
export function generateInitialArticlePrices(): ArticlePrice[] {
  const prices: ArticlePrice[] = [];

  INITIAL_PRODUCTS.forEach((p) => {
    // Base price
    prices.push({
      id: `price-reg-${p.id}`,
      product_id: p.id,
      price: p.current_price,
      price_type: 'REGULAR',
      valid_from: '2026-01-01',
      valid_to: null,
      reason: 'Redovni maloprodajni cjenovnik Uzeh.ba',
      created_by: 'Belma Dedić-Kozlić',
      created_at: '2026-01-01T08:00:00Z',
    });
  });

  // Add historical prices from Nivelacije
  INITIAL_NIVELACIJE.forEach((niv) => {
    niv.lines.forEach((line) => {
      prices.push({
        id: `price-niv-${niv.id}-${line.id}`,
        product_id: line.product_id,
        price: line.new_price,
        price_type: line.new_price < line.old_price ? 'ACTION' : 'REGULAR',
        valid_from: niv.date,
        valid_to: null,
        reason: `${niv.document_number}: ${niv.reason}`,
        source_document_id: niv.id,
        created_by: niv.created_by,
        created_at: niv.created_at,
      });
    });
  });

  return prices;
}

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-01',
    document_number: 'MP-2026-000142',
    date: '2026-09-06',
    warehouse_id: 'wh-01',
    warehouse_name: 'TR Uzeh Prodavnica (Novi Grad Sarajevo)',
    customer_id: null,
    customer_name: 'Maloprodajni kupac (Fizičko lice)',
    status: 'POSTED',
    created_by: 'Amra Spahić',
    created_at: '2026-09-06T14:22:00Z',
    posted_at: '2026-09-06T14:23:00Z',
    subtotal_amount: 55.56,
    tax_amount: 9.44,
    total_amount: 65.00,
    lines: [
      {
        id: 'salel-1',
        sale_id: 'sale-01',
        product_id: 'prod-130',
        product_name: 'Magična tulipan lampa',
        quantity: 1,
        unit_price: 30.00,
        discount_percent: 0,
        tax_rate_id: 'tax-17',
        tax_amount: 4.36,
        total_amount: 30.00,
      },
      {
        id: 'salel-2',
        sale_id: 'sale-01',
        product_id: 'prod-132',
        product_name: 'Lampa Kaba',
        quantity: 1,
        unit_price: 35.00,
        discount_percent: 0,
        tax_rate_id: 'tax-17',
        tax_amount: 5.08,
        total_amount: 35.00,
      },
    ],
    payments: [
      {
        id: 'pay-1',
        sale_id: 'sale-01',
        payment_method_id: 'pm-cash',
        payment_method_name: 'Gotovina',
        amount: 65.00,
        created_at: '2026-09-06T14:23:00Z',
      },
    ],
  },
  {
    id: 'sale-02',
    document_number: 'MP-2026-000143',
    date: '2026-09-07',
    warehouse_id: 'wh-01',
    warehouse_name: 'TR Uzeh Prodavnica (Novi Grad Sarajevo)',
    customer_id: 'part-cust-flamingo',
    customer_name: 'Cvjećara Flamingo d.o.o.',
    status: 'POSTED',
    created_by: 'Amra Spahić',
    created_at: '2026-09-07T11:05:00Z',
    posted_at: '2026-09-07T11:06:00Z',
    subtotal_amount: 170.94,
    tax_amount: 29.06,
    total_amount: 200.00,
    lines: [
      {
        id: 'salel-3',
        sale_id: 'sale-02',
        product_id: 'prod-131',
        product_name: 'I love you box',
        quantity: 2,
        unit_price: 100.00,
        discount_percent: 0,
        tax_rate_id: 'tax-17',
        tax_amount: 29.06,
        total_amount: 200.00,
      },
    ],
    payments: [
      {
        id: 'pay-2',
        sale_id: 'sale-02',
        payment_method_id: 'pm-card',
        payment_method_name: 'Platna kartica',
        amount: 200.00,
        reference: 'POS-TX-98421',
        created_at: '2026-09-07T11:06:00Z',
      },
    ],
  },
];

export const INITIAL_INVENTURA: InventoryCount[] = [
  {
    id: 'inv-01',
    document_number: 'INV-2026-000001',
    warehouse_id: 'wh-01',
    warehouse_name: 'TR Uzeh Prodavnica (Novi Grad Sarajevo)',
    date: '2026-06-30',
    status: 'POSTED',
    created_by: 'Mirza Hadžić',
    created_at: '2026-06-30T16:00:00Z',
    posted_at: '2026-06-30T17:30:00Z',
    total_surplus_value: 15.00,
    total_deficit_value: 30.00,
    lines: [
      {
        id: 'invl-1',
        inventory_count_id: 'inv-01',
        product_id: 'prod-001',
        product_name: 'Ž. Ručni sat 3654-678',
        system_quantity: 6,
        counted_quantity: 5,
        difference: -1,
        unit_price: 15.00,
        difference_value: -15.00,
        notes: 'Manjak od 1 kom pri redovnom popisu polugodišta',
      },
      {
        id: 'invl-2',
        inventory_count_id: 'inv-01',
        product_id: 'prod-031',
        product_name: 'Vazelin',
        system_quantity: 19,
        counted_quantity: 20,
        difference: 1,
        unit_price: 2.50,
        difference_value: 2.50,
        notes: 'Višak pronađen u skladišnom regalu A-2',
      },
    ],
  },
];

export const INITIAL_WRITEOFFS: WriteOff[] = [
  {
    id: 'otp-01',
    document_number: 'OTP-2026-000001',
    warehouse_id: 'wh-01',
    warehouse_name: 'TR Uzeh Prodavnica (Novi Grad Sarajevo)',
    date: '2026-07-15',
    reason: 'DAMAGED',
    notes: 'Oštećenje u transportu i izlogu radnje',
    status: 'POSTED',
    created_by: 'Mirza Hadžić',
    created_at: '2026-07-15T11:00:00Z',
    posted_at: '2026-07-15T11:20:00Z',
    total_amount: 14.85,
    lines: [
      {
        id: 'otpl-1',
        write_off_id: 'otp-01',
        product_id: 'prod-047',
        product_name: 'Zemljane posude 6u1',
        quantity: 1,
        unit_cost: 4.90,
        total_cost: 4.90,
        reason: 'DAMAGED',
      },
      {
        id: 'otpl-2',
        write_off_id: 'otp-01',
        product_id: 'prod-085',
        product_name: 'LED lampa O',
        quantity: 1,
        unit_cost: 9.95,
        total_cost: 9.95,
        reason: 'DAMAGED',
      },
    ],
  },
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: 'pre-01',
    document_number: 'PRE-2026-000001',
    date: '2026-08-01',
    source_warehouse_id: 'wh-02',
    source_warehouse_name: 'Centralno skladište Uzeh.ba',
    target_warehouse_id: 'wh-01',
    target_warehouse_name: 'TR Uzeh Prodavnica (Novi Grad Sarajevo)',
    status: 'POSTED',
    notes: 'Redovna popuna maloprodajnog objekta iz centralnog skladišta',
    created_by: 'Mirza Hadžić',
    created_at: '2026-08-01T08:00:00Z',
    posted_at: '2026-08-01T08:45:00Z',
    lines: [
      {
        id: 'prel-1',
        transfer_id: 'pre-01',
        product_id: 'prod-130',
        product_name: 'Magična tulipan lampa',
        quantity: 10,
      },
      {
        id: 'prel-2',
        transfer_id: 'pre-01',
        product_id: 'prod-171',
        product_name: 'Pametni sat M',
        quantity: 5,
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    user_id: 'user-01',
    user_name: 'Belma Dedić-Kozlić',
    action: 'POST',
    entity_type: 'RETAIL_CALCULATION',
    entity_id: 'kal-31',
    details: 'Knjiženje maloprodajne kalkulacije KAL-31/2026 (EDEKA d.o.o.) u iznosu 305,00 KM',
    created_at: '2026-09-05T09:00:00Z',
  },
  {
    id: 'aud-2',
    user_id: 'user-01',
    user_name: 'Belma Dedić-Kozlić',
    action: 'POST',
    entity_type: 'RETAIL_CALCULATION',
    entity_id: 'kal-32',
    details: 'Knjiženje maloprodajne kalkulacije KAL-32/2026 (BELAMIONIX d.o.o.) u iznosu 205,00 KM',
    created_at: '2026-09-05T11:30:00Z',
  },
  {
    id: 'aud-3',
    user_id: 'user-03',
    user_name: 'Amra Spahić',
    action: 'POST',
    entity_type: 'SALE',
    entity_id: 'sale-02',
    details: 'Izdavanje maloprodajnog računa MP-2026-000143 za Cvjećara Flamingo d.o.o. (200,00 KM)',
    created_at: '2026-09-07T11:06:00Z',
  },
  {
    id: 'aud-4',
    user_id: 'user-01',
    user_name: 'Belma Dedić-Kozlić',
    action: 'PRICE_CHANGE',
    entity_type: 'PRICE_ADJUSTMENT',
    entity_id: 'niv-07',
    details: 'Knjiženje nivelacije NIV-07/2026 sa ukupnom razlikom +3.657,80 KM',
    created_at: '2026-06-25T09:30:00Z',
  },
];

export const INITIAL_EXTERNAL_MAPPINGS: ExternalMapping[] = [
  {
    id: 'map-01',
    product_id: 'prod-130',
    system: 'UZEH_WEBSHOP',
    external_id: 'web-prod-8841',
    last_synced_at: '2026-09-08T04:00:00Z',
    sync_status: 'SYNCED',
  },
  {
    id: 'map-02',
    product_id: 'prod-131',
    system: 'UZEH_WEBSHOP',
    external_id: 'web-prod-8842',
    last_synced_at: '2026-09-08T04:00:00Z',
    sync_status: 'SYNCED',
  },
  {
    id: 'map-03',
    product_id: 'prod-132',
    system: 'UZEH_WEBSHOP',
    external_id: 'web-prod-8843',
    last_synced_at: '2026-09-08T04:00:00Z',
    sync_status: 'SYNCED',
  },
];

export const INITIAL_SYNC_LOGS: SyncLog[] = [
  {
    id: 'sync-1',
    entity_type: 'STOCK_SYNC',
    entity_id: 'prod-130',
    action: 'ERP_TO_WEBSHOP',
    status: 'SUCCESS',
    message: 'Sinhronizovano stanje zaliha: 26 kom, MPC: 30,00 KM na Uzeh.ba webshop',
    created_at: '2026-09-08T04:00:15Z',
  },
  {
    id: 'sync-2',
    entity_type: 'PRICE_SYNC',
    entity_id: 'prod-132',
    action: 'ERP_TO_WEBSHOP',
    status: 'SUCCESS',
    message: 'Ažurirana maloprodajna cijena na webshopu: 35,00 KM',
    created_at: '2026-09-08T04:00:20Z',
  },
];
