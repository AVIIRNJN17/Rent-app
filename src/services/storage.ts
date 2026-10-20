import {
  AppProfile,
  ElectricityRecord,
  ExpenseRecord,
  FinalSettlement,
  ReceiptRecord,
  RentRecord,
  RationItem,
  RationReceiptRecord,
} from '../types';

const DB_NAME = 'AvhiiRentAppDB';
const DB_VERSION = 2;

// Storage keys
const STORAGE_KEYS = {
  PROFILE: 'avhii_profile',
  RENTS: 'avhii_rents',
  ELECTRICITY: 'avhii_electricity',
  EXPENSES: 'avhii_expenses',
  SETTLEMENTS: 'avhii_settlements',
  RECEIPTS: 'avhii_receipts',
  RATION_ITEMS: 'avhii_ration_items',
  RATION_RECEIPTS: 'avhii_ration_receipts',
};

export const DEFAULT_PROFILE: AppProfile = {
  tenantName: 'Abhishek Ranjan',
  landlordName: 'Rajesh Sharma',
  landlordMobile: '+91 98765 43210',
  roomAddress: 'Flat 302, Golden Orchid Residency, Indiranagar, Bengaluru',
  defaultRent: 9500,
  defaultElectricityRate: 7,
  defaultRationBudget: 5000,
  monthlyRationBudgets: {
    '2026-10': 5000,
    '2026-09': 5000,
  },
  theme: 'light',
  language: 'en',
};

export const SAMPLE_RENTS: RentRecord[] = [
  {
    id: 'rent-2026-08',
    monthKey: '2026-08',
    tenantName: 'Abhishek Ranjan',
    landlordName: 'Rajesh Sharma',
    landlordMobile: '+91 98765 43210',
    roomAddress: 'Flat 302, Golden Orchid Residency, Indiranagar, Bengaluru',
    monthlyRent: 9500,
    dueDate: '2026-08-05',
    paymentDate: '2026-08-04',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/623819284719/Paytm',
    paymentStatus: 'Paid',
    amountPaid: 9500,
    additionalCharges: 0,
    remarks: 'August rent paid on time via UPI',
    updatedAt: '2026-08-04T10:00:00.000Z',
  },
  {
    id: 'rent-2026-09',
    monthKey: '2026-09',
    tenantName: 'Abhishek Ranjan',
    landlordName: 'Rajesh Sharma',
    landlordMobile: '+91 98765 43210',
    roomAddress: 'Flat 302, Golden Orchid Residency, Indiranagar, Bengaluru',
    monthlyRent: 9500,
    dueDate: '2026-09-05',
    paymentDate: '2026-09-05',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'IMPS-90283741829',
    paymentStatus: 'Paid',
    amountPaid: 9500,
    additionalCharges: 250,
    additionalChargesNote: 'Water tanker shared cost',
    remarks: 'September rent and water share cleared',
    updatedAt: '2026-09-05T12:00:00.000Z',
  },
  {
    id: 'rent-2026-10',
    monthKey: '2026-10',
    tenantName: 'Abhishek Ranjan',
    landlordName: 'Rajesh Sharma',
    landlordMobile: '+91 98765 43210',
    roomAddress: 'Flat 302, Golden Orchid Residency, Indiranagar, Bengaluru',
    monthlyRent: 9500,
    dueDate: '2026-10-05',
    paymentDate: '',
    paymentMethod: 'UPI',
    transactionRef: '',
    paymentStatus: 'Pending',
    amountPaid: 0,
    additionalCharges: 0,
    remarks: 'October rent due',
    updatedAt: '2026-10-01T08:00:00.000Z',
  },
];

export const SAMPLE_ELECTRICITY: ElectricityRecord[] = [
  {
    id: 'elec-2026-08',
    monthKey: '2026-08',
    previousReading: 1160,
    currentReading: 1250,
    unitsConsumed: 90,
    ratePerUnit: 7,
    totalAmount: 630,
    readingDate: '2026-08-01',
    notes: 'August meter reading by building supervisor',
    updatedAt: '2026-08-01T09:00:00.000Z',
  },
  {
    id: 'elec-2026-09',
    monthKey: '2026-09',
    previousReading: 1250,
    currentReading: 1340,
    unitsConsumed: 90,
    ratePerUnit: 7,
    totalAmount: 630,
    readingDate: '2026-09-01',
    notes: 'September reading verified',
    updatedAt: '2026-09-01T09:30:00.000Z',
  },
  {
    id: 'elec-2026-10',
    monthKey: '2026-10',
    previousReading: 1340,
    currentReading: 1445,
    unitsConsumed: 105,
    ratePerUnit: 7,
    totalAmount: 735,
    readingDate: '2026-10-02',
    notes: 'AC used during festival days',
    updatedAt: '2026-10-02T10:00:00.000Z',
  },
];

export const SAMPLE_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    title: 'Supermarket Groceries & Daily Needs',
    amount: 2450,
    date: '2026-10-03',
    monthKey: '2026-10',
    category: 'Food & Groceries',
    paymentMethod: 'UPI',
    notes: 'Rice, oil, pulses, and spices from Nature Basket',
    createdAt: '2026-10-03T14:30:00.000Z',
  },
  {
    id: 'exp-2',
    title: 'Fresh Vegetables & Fruits',
    amount: 420,
    date: '2026-10-05',
    monthKey: '2026-10',
    category: 'Vegetables',
    paymentMethod: 'UPI',
    notes: 'Weekly sabzi mandi purchase',
    createdAt: '2026-10-05T18:20:00.000Z',
  },
  {
    id: 'exp-3',
    title: 'HP Gas LPG Cylinder Refill',
    amount: 980,
    date: '2026-10-08',
    monthKey: '2026-10',
    category: 'Gas / Cooking',
    paymentMethod: 'Cash',
    notes: '14.2kg domestic cylinder',
    createdAt: '2026-10-08T11:15:00.000Z',
  },
  {
    id: 'exp-4',
    title: 'Metro Smart Card & Auto Rides',
    amount: 650,
    date: '2026-10-12',
    monthKey: '2026-10',
    category: 'Transportation',
    paymentMethod: 'UPI',
    notes: 'Namma Metro recharge',
    createdAt: '2026-10-12T09:00:00.000Z',
  },
  {
    id: 'exp-5',
    title: 'Airtel 5G Unlimited Recharge',
    amount: 719,
    date: '2026-10-15',
    monthKey: '2026-10',
    category: 'Mobile Recharge',
    paymentMethod: 'UPI',
    notes: '84 days validity pack',
    createdAt: '2026-10-15T16:45:00.000Z',
  },
  {
    id: 'exp-6',
    title: 'Plumbing Tap Repair',
    amount: 350,
    date: '2026-10-18',
    monthKey: '2026-10',
    category: 'Room Maintenance',
    paymentMethod: 'Cash',
    notes: 'Kitchen sink washer change',
    createdAt: '2026-10-18T10:10:00.000Z',
  },
  {
    id: 'exp-7',
    title: 'September D-Mart Monthly Supplies',
    amount: 3200,
    date: '2026-09-10',
    monthKey: '2026-09',
    category: 'Food & Groceries',
    paymentMethod: 'UPI',
    notes: 'Monthly staples',
    createdAt: '2026-09-10T12:00:00.000Z',
  },
];

export const SAMPLE_SETTLEMENTS: FinalSettlement[] = [
  {
    id: 'settle-2026-08',
    monthKey: '2026-08',
    rentAmount: 9500,
    previousReading: 1160,
    currentReading: 1250,
    electricityUnits: 90,
    electricityRate: 7,
    electricityBill: 630,
    additionalCharges: 0,
    previousDue: 0,
    advanceAdjustment: 0,
    grandTotal: 10130,
    amountPaid: 10130,
    remainingBalance: 0,
    paymentDate: '2026-08-04',
    paymentMethod: 'UPI',
    transactionRef: 'UPI/623819284719/Paytm',
    notes: 'Full August settlement cleared',
    isConfirmed: true,
    finalizedAt: '2026-08-04T12:00:00.000Z',
  },
  {
    id: 'settle-2026-09',
    monthKey: '2026-09',
    rentAmount: 9500,
    previousReading: 1250,
    currentReading: 1340,
    electricityUnits: 90,
    electricityRate: 7,
    electricityBill: 630,
    additionalCharges: 250,
    previousDue: 0,
    advanceAdjustment: 0,
    grandTotal: 10380,
    amountPaid: 10380,
    remainingBalance: 0,
    paymentDate: '2026-09-05',
    paymentMethod: 'Bank Transfer',
    transactionRef: 'IMPS-90283741829',
    notes: 'September settlement completed',
    isConfirmed: true,
    finalizedAt: '2026-09-05T13:00:00.000Z',
  },
];

export const SAMPLE_RATION_ITEMS: RationItem[] = [
  {
    id: 'rat-1',
    itemName: 'Aashirvaad Shudh Chakki Atta',
    category: 'Flour & Grains',
    quantity: '10 kg',
    pricePerUnit: 44,
    totalAmount: 440,
    date: '2026-10-02',
    monthKey: '2026-10',
    storeName: 'D-Mart Supermarket',
    paymentMethod: 'UPI',
    notes: 'Monthly whole wheat flour pack',
    createdAt: '2026-10-02T10:00:00.000Z',
  },
  {
    id: 'rat-2',
    itemName: 'Fortune Sunlite Refined Sunflower Oil',
    category: 'Oils & Ghee',
    quantity: '2 Ltr (2 pouches)',
    pricePerUnit: 145,
    totalAmount: 290,
    date: '2026-10-02',
    monthKey: '2026-10',
    storeName: 'D-Mart Supermarket',
    paymentMethod: 'UPI',
    notes: 'Cooking oil stock',
    createdAt: '2026-10-02T10:15:00.000Z',
  },
  {
    id: 'rat-3',
    itemName: 'India Gate Basmati Rice Feast Rozzana',
    category: 'Flour & Grains',
    quantity: '5 kg',
    pricePerUnit: 96,
    totalAmount: 480,
    date: '2026-10-04',
    monthKey: '2026-10',
    storeName: 'Reliance Smart Bazaar',
    paymentMethod: 'UPI',
    notes: 'Daily basmati rice',
    createdAt: '2026-10-04T12:30:00.000Z',
  },
  {
    id: 'rat-4',
    itemName: 'Tata Sampann Unpolished Toor Dal',
    category: 'Pulses & Dal',
    quantity: '2 kg',
    pricePerUnit: 170,
    totalAmount: 340,
    date: '2026-10-04',
    monthKey: '2026-10',
    storeName: 'Reliance Smart Bazaar',
    paymentMethod: 'UPI',
    notes: 'Protein rich unpolished dal',
    createdAt: '2026-10-04T12:35:00.000Z',
  },
  {
    id: 'rat-5',
    itemName: 'Everest Turmeric, Chilli & Garam Masala Pack',
    category: 'Spices & Masala',
    quantity: '3 packets',
    pricePerUnit: 55,
    totalAmount: 165,
    date: '2026-10-06',
    monthKey: '2026-10',
    storeName: 'Local Kirana Store',
    paymentMethod: 'Cash',
    notes: 'Kitchen spices refill',
    createdAt: '2026-10-06T18:00:00.000Z',
  },
  {
    id: 'rat-6',
    itemName: 'Fresh Onions, Potatoes & Ginger Garlic',
    category: 'Fresh Vegetables',
    quantity: '5 kg combo',
    pricePerUnit: 48,
    totalAmount: 240,
    date: '2026-10-08',
    monthKey: '2026-10',
    storeName: 'Sabzi Mandi',
    paymentMethod: 'UPI',
    notes: 'Weekly fresh sabzi ration',
    createdAt: '2026-10-08T09:30:00.000Z',
  },
  {
    id: 'rat-7',
    itemName: 'Amul Taaza Milk Pouches & Curd (Weekly batch)',
    category: 'Dairy & Milk',
    quantity: '7 packets',
    pricePerUnit: 33,
    totalAmount: 231,
    date: '2026-10-10',
    monthKey: '2026-10',
    storeName: 'Amul Milk Parlour',
    paymentMethod: 'UPI',
    notes: 'Daily dairy supplies',
    createdAt: '2026-10-10T07:15:00.000Z',
  },
  {
    id: 'rat-8',
    itemName: 'Surf Excel Quick Wash & Vim Dishwash Liquid',
    category: 'Cleaning & Household',
    quantity: '1 kg + 500ml',
    pricePerUnit: 195,
    totalAmount: 195,
    date: '2026-10-12',
    monthKey: '2026-10',
    storeName: 'Blinkit',
    paymentMethod: 'UPI',
    notes: 'Home cleaning staples',
    createdAt: '2026-10-12T15:20:00.000Z',
  },
];

// Helper to open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const stores = [
        STORAGE_KEYS.PROFILE,
        STORAGE_KEYS.RENTS,
        STORAGE_KEYS.ELECTRICITY,
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.SETTLEMENTS,
        STORAGE_KEYS.RECEIPTS,
        STORAGE_KEYS.RATION_ITEMS,
        STORAGE_KEYS.RATION_RECEIPTS,
      ];
      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Generic Storage API with dual layer (IndexedDB primary + LocalStorage backup)
export class StorageService {
  private static async getIDB<T>(storeName: string): Promise<T[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  private static async setIDB<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }

  // Profile methods
  static getProfile(): AppProfile {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  }

  static saveProfile(profile: AppProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  // Rent Records
  static async getRents(): Promise<RentRecord[]> {
    const idbData = await this.getIDB<RentRecord>(STORAGE_KEYS.RENTS);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.RENTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    // Initialize with samples
    await this.saveRents(SAMPLE_RENTS);
    return SAMPLE_RENTS;
  }

  static async saveRents(rents: RentRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.RENTS, JSON.stringify(rents));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.RENTS, rents);
  }

  // Electricity Records
  static async getElectricity(): Promise<ElectricityRecord[]> {
    const idbData = await this.getIDB<ElectricityRecord>(STORAGE_KEYS.ELECTRICITY);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.ELECTRICITY);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    await this.saveElectricity(SAMPLE_ELECTRICITY);
    return SAMPLE_ELECTRICITY;
  }

  static async saveElectricity(records: ElectricityRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.ELECTRICITY, JSON.stringify(records));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.ELECTRICITY, records);
  }

  // Expense Records
  static async getExpenses(): Promise<ExpenseRecord[]> {
    const idbData = await this.getIDB<ExpenseRecord>(STORAGE_KEYS.EXPENSES);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    await this.saveExpenses(SAMPLE_EXPENSES);
    return SAMPLE_EXPENSES;
  }

  static async saveExpenses(expenses: ExpenseRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.EXPENSES, expenses);
  }

  // Settlements
  static async getSettlements(): Promise<FinalSettlement[]> {
    const idbData = await this.getIDB<FinalSettlement>(STORAGE_KEYS.SETTLEMENTS);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    await this.saveSettlements(SAMPLE_SETTLEMENTS);
    return SAMPLE_SETTLEMENTS;
  }

  static async saveSettlements(settlements: FinalSettlement[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.SETTLEMENTS, settlements);
  }

  // Receipts
  static async getReceipts(): Promise<ReceiptRecord[]> {
    const idbData = await this.getIDB<ReceiptRecord>(STORAGE_KEYS.RECEIPTS);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (local) return JSON.parse(local);
    } catch {
      // ignore
    }
    return [];
  }

  static async saveReceipts(receipts: ReceiptRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.RECEIPTS, receipts);
  }

  // Monthly House Ration Items
  static async getRationItems(): Promise<RationItem[]> {
    const idbData = await this.getIDB<RationItem>(STORAGE_KEYS.RATION_ITEMS);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.RATION_ITEMS);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }

    await this.saveRationItems(SAMPLE_RATION_ITEMS);
    return SAMPLE_RATION_ITEMS;
  }

  static async saveRationItems(items: RationItem[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.RATION_ITEMS, JSON.stringify(items));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.RATION_ITEMS, items);
  }

  // Monthly House Ration Receipts
  static async getRationReceipts(): Promise<RationReceiptRecord[]> {
    const idbData = await this.getIDB<RationReceiptRecord>(STORAGE_KEYS.RATION_RECEIPTS);
    if (idbData && idbData.length > 0) return idbData;

    try {
      const local = localStorage.getItem(STORAGE_KEYS.RATION_RECEIPTS);
      if (local) return JSON.parse(local);
    } catch {
      // ignore
    }
    return [];
  }

  static async saveRationReceipts(receipts: RationReceiptRecord[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.RATION_RECEIPTS, JSON.stringify(receipts));
    } catch {
      // ignore
    }
    await this.setIDB(STORAGE_KEYS.RATION_RECEIPTS, receipts);
  }

  // Full Backup Export
  static async exportBackup(): Promise<string> {
    const profile = this.getProfile();
    const rents = await this.getRents();
    const electricity = await this.getElectricity();
    const expenses = await this.getExpenses();
    const settlements = await this.getSettlements();
    const receipts = await this.getReceipts();
    const rationItems = await this.getRationItems();
    const rationReceipts = await this.getRationReceipts();

    const data = {
      app: 'AVHII RENT APP',
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      profile,
      rents,
      electricity,
      expenses,
      settlements,
      receipts,
      rationItems,
      rationReceipts,
    };

    return JSON.stringify(data, null, 2);
  }

  // Full Backup Import
  static async importBackup(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') return false;

      if (parsed.profile) this.saveProfile(parsed.profile);
      if (Array.isArray(parsed.rents)) await this.saveRents(parsed.rents);
      if (Array.isArray(parsed.electricity)) await this.saveElectricity(parsed.electricity);
      if (Array.isArray(parsed.expenses)) await this.saveExpenses(parsed.expenses);
      if (Array.isArray(parsed.settlements)) await this.saveSettlements(parsed.settlements);
      if (Array.isArray(parsed.receipts)) await this.saveReceipts(parsed.receipts);
      if (Array.isArray(parsed.rationItems)) await this.saveRationItems(parsed.rationItems);
      if (Array.isArray(parsed.rationReceipts)) await this.saveRationReceipts(parsed.rationReceipts);

      return true;
    } catch (e) {
      console.error('Failed to import backup:', e);
      return false;
    }
  }

  // Reset to Demo Data
  static async resetToDemo(): Promise<void> {
    this.saveProfile(DEFAULT_PROFILE);
    await this.saveRents(SAMPLE_RENTS);
    await this.saveElectricity(SAMPLE_ELECTRICITY);
    await this.saveExpenses(SAMPLE_EXPENSES);
    await this.saveSettlements(SAMPLE_SETTLEMENTS);
    await this.saveReceipts([]);
    await this.saveRationItems(SAMPLE_RATION_ITEMS);
    await this.saveRationReceipts([]);
  }

  // Clear All Data
  static async clearAllData(): Promise<void> {
    this.saveProfile({
      ...DEFAULT_PROFILE,
      tenantName: 'Tenant Name',
      landlordName: 'Landlord Name',
      landlordMobile: '',
      roomAddress: '',
      defaultRent: 0,
    });
    await this.saveRents([]);
    await this.saveElectricity([]);
    await this.saveExpenses([]);
    await this.saveSettlements([]);
    await this.saveReceipts([]);
    await this.saveRationItems([]);
    await this.saveRationReceipts([]);
  }
}
