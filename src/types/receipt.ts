export type ExpenseCategory =
  | 'Software & Cloud'
  | 'Office & Co-working'
  | 'Client Meals'
  | 'Travel & Transit'
  | 'Hardware & Tech'
  | 'Professional Services'
  | 'Utilities'
  | 'Other';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hsnSac?: string;
}

export type AuditIssueType =
  | 'MATH_MISMATCH'
  | 'MISSING_TAX_ID'
  | 'DUPLICATE_RECEIPT'
  | 'FUTURE_DATE'
  | 'HIGH_UNVERIFIED_VALUE';

export interface AuditIssue {
  id: string;
  type: AuditIssueType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  field?: string;
  expectedValue?: string | number;
  foundValue?: string | number;
  suggestedFix?: string;
  fixed?: boolean;
}

export interface ReceiptDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTimestamp: number;
  fileHash: string; // SHA-256 for local deduplication
  vendorName: string;
  vendorCategory: ExpenseCategory;
  date: string; // YYYY-MM-DD
  invoiceNumber: string;
  taxId: string; // GSTIN / VAT / EIN
  hsnSacCode?: string; // Tax classification
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  currencySymbol: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number; // percentage e.g. 18 for 18%
  taxAmount: number;
  grandTotal: number;
  calculatedTotal: number; // derived from lineItems sum + tax
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Cash';
  status: 'pending_review' | 'verified' | 'needs_repair';
  auditIssues: AuditIssue[];
  notes?: string;
  clientBillable?: boolean;
  clientName?: string;
  reimbursed?: boolean;
  previewColor?: string;
  visualData?: {
    receiptTextLines: string[];
    storeLocation?: string;
    cashierOrTerminal?: string;
    barcodeDigits?: string;
  };
}

export interface AchievementStamp {
  id: string;
  name: string;
  description: string;
  badgeCode: string;
  unlocked: boolean;
  unlockedAt?: string;
  color: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
}

export interface OpenWeightModelInfo {
  id: string;
  name: string;
  creator: string;
  paramSize: string;
  vramRequired: string;
  inferenceSpeed: string;
  costPer1kReceipts: string;
  privacyRating: string;
  description: string;
  isRecommended?: boolean;
}

export interface VaultUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authMethod: 'local_master_passcode' | 'google_sso';
  unlockedAt: number;
  encryptionAlgorithm: 'AES-GCM-256';
  isAirGapped: boolean;
}

export interface EngineConfig {
  mode: 'local_heuristics' | 'local_fastapi' | 'gemini_optin';
  fastApiEndpoint: string;
  ollamaModel: string;
  selectedOpenWeightModel: string;
  useSound: boolean;
  autoDeduplicate: boolean;
}
