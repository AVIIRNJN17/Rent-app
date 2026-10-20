export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer';
export type PaymentStatus = 'Paid' | 'Partial' | 'Pending';

export interface RentRecord {
  id: string;
  monthKey: string; // "YYYY-MM" e.g., "2026-10"
  tenantName: string;
  landlordName: string;
  landlordMobile: string;
  roomAddress: string;
  monthlyRent: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  additionalCharges?: number;
  additionalChargesNote?: string;
  remarks?: string;
  updatedAt: string;
}

export interface ElectricityRecord {
  id: string;
  monthKey: string; // "YYYY-MM"
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnit: number; // default 7
  totalAmount: number;
  readingDate: string; // YYYY-MM-DD
  meterPhoto?: string; // Base64 or object URL
  notes?: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Food & Groceries'
  | 'Vegetables'
  | 'Gas / Cooking'
  | 'Transportation'
  | 'Mobile Recharge'
  | 'Shopping'
  | 'Medical'
  | 'Room Maintenance'
  | 'Electricity'
  | 'Other Expenses';

export interface ExpenseRecord {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  monthKey: string; // "YYYY-MM"
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  notes?: string;
  billPhoto?: string; // Base64
  createdAt: string;
}

export interface FinalSettlement {
  id: string;
  monthKey: string; // "YYYY-MM"
  rentAmount: number;
  previousReading: number;
  currentReading: number;
  electricityUnits: number;
  electricityRate: number;
  electricityBill: number;
  additionalCharges: number;
  previousDue: number;
  advanceAdjustment: number;
  adjustmentType?: 'add' | 'deduct';
  adjustmentAmount?: number;
  adjustmentReason?: string;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  notes?: string;
  isConfirmed: boolean;
  finalizedAt: string;
}

export interface ReceiptRecord {
  id: string;
  receiptNumber: string; // ARA-2026-10-001
  monthKey: string;
  title: string; // "RENT PAYMENT RECEIPT" or "MONTHLY RENT & ELECTRICITY STATEMENT"
  generatedDate: string;
  tenantName: string;
  landlordName: string;
  landlordMobile: string;
  roomAddress: string;
  monthlyRent: number;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  ratePerUnit: number;
  electricityBill: number;
  additionalCharges: number;
  previousDue: number;
  advanceAdjustment: number;
  adjustmentType?: 'add' | 'deduct';
  adjustmentAmount?: number;
  adjustmentReason?: string;
  grandTotal: number;
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: PaymentStatus;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  remarks?: string;
}

export type RationCategory =
  | 'Flour & Grains'
  | 'Oils & Ghee'
  | 'Pulses & Dal'
  | 'Spices & Masala'
  | 'Dairy & Milk'
  | 'Fresh Vegetables'
  | 'Snacks & Beverages'
  | 'Cleaning & Household'
  | 'Personal Care'
  | 'Other Ration';

export interface RationItem {
  id: string;
  itemName: string;
  category: RationCategory;
  quantity: string; // e.g. "10 kg", "2 Ltr", "4 pkts"
  pricePerUnit?: number;
  totalAmount: number;
  date: string; // YYYY-MM-DD
  monthKey: string; // "YYYY-MM"
  storeName?: string; // e.g. "D-Mart", "Local Kirana", "Blinkit"
  paymentMethod: PaymentMethod;
  notes?: string;
  billPhoto?: string;
  createdAt: string;
}

export interface RationReceiptRecord {
  id: string;
  receiptNumber: string; // HRE-202610-001
  monthKey: string;
  generatedDate: string;
  householdName: string;
  totalItems: number;
  totalAmount: number;
  items: RationItem[];
  categorySummary: Record<string, number>;
  notes?: string;
}

export interface AppProfile {
  tenantName: string;
  landlordName: string;
  landlordMobile: string;
  roomAddress: string;
  defaultRent: number;
  defaultElectricityRate: number;
  defaultRationBudget?: number;
  monthlyRationBudgets?: Record<string, number>;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
}

export type ActiveTab =
  | 'dashboard'
  | 'rent'
  | 'electricity'
  | 'expenses'
  | 'ration'
  | 'settlement'
  | 'receipt'
  | 'history'
  | 'settings'
  | '3d-studio'
  | 'maps';
