import { LineItem, ReceiptDocument } from '../types/receipt';
import { computeClientSHA256, runSmartAudit } from './auditEngine';

// GSTIN Regex for India (15 alphanumeric characters)
const GSTIN_REGEX = /\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i;

// Parse text or simulate OCR heuristics on uploaded files
export async function parseDocumentLocally(
  file: File,
  existingDocs: ReceiptDocument[]
): Promise<ReceiptDocument> {
  const fileHash = await computeClientSHA256(await file.arrayBuffer());
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Derive vendor and category heuristics from filename or random seeds
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let vendorName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  let category: ReceiptDocument['vendorCategory'] = 'Other';
  let currency: ReceiptDocument['currency'] = 'INR';
  let currencySymbol = '₹';
  let taxRate = 18;
  let taxId = '';

  const lower = file.name.toLowerCase();
  if (lower.includes('wework') || lower.includes('cowork') || lower.includes('desk') || lower.includes('office')) {
    vendorName = 'WeWork Coworking Spaces';
    category = 'Office & Co-working';
    taxId = '29AABCS1429B1Z5';
  } else if (lower.includes('aws') || lower.includes('amazon') || lower.includes('cloud') || lower.includes('hosting') || lower.includes('vercel') || lower.includes('github')) {
    vendorName = 'Amazon Web Services / Cloud';
    category = 'Software & Cloud';
    taxRate = 18;
    taxId = '27AAACA9928D1Z2';
  } else if (lower.includes('coffee') || lower.includes('starbucks') || lower.includes('cafe') || lower.includes('food') || lower.includes('meal') || lower.includes('lunch') || lower.includes('dinner')) {
    vendorName = 'Artisan Roastery & Cafe';
    category = 'Client Meals';
    taxRate = 5;
    taxId = '29AAGCA8819L1Z8';
  } else if (lower.includes('uber') || lower.includes('ola') || lower.includes('cab') || lower.includes('flight') || lower.includes('air') || lower.includes('travel')) {
    vendorName = 'Airport Transit & Cabs';
    category = 'Travel & Transit';
    taxRate = 5;
    taxId = '29AAACU8892L1ZO';
  } else if (lower.includes('apple') || lower.includes('dell') || lower.includes('croma') || lower.includes('hardware') || lower.includes('tech')) {
    vendorName = 'Apple Retail Store';
    category = 'Hardware & Tech';
    taxRate = 18;
    taxId = '29AAACA2837G1Z1';
  }

  // Create simulated realistic line items based on file size and category
  const lineItems: LineItem[] = [];
  const basePrice = Math.max(350, Math.floor((file.size % 4000) / 10) * 10);
  
  if (category === 'Office & Co-working') {
    lineItems.push({
      id: `li-${Date.now()}-1`,
      description: 'Monthly Flexi Desk Access',
      quantity: 1,
      unitPrice: 9500,
      total: 9500,
    });
  } else if (category === 'Client Meals') {
    lineItems.push(
      {
        id: `li-${Date.now()}-1`,
        description: 'Specialty Beverages & Coffee',
        quantity: 2,
        unitPrice: 280,
        total: 560,
      },
      {
        id: `li-${Date.now()}-2`,
        description: 'Client Lunch Tasting Platter',
        quantity: 1,
        unitPrice: 890,
        total: 890,
      }
    );
  } else if (category === 'Travel & Transit') {
    lineItems.push({
      id: `li-${Date.now()}-1`,
      description: 'Express City Transit Ride',
      quantity: 1,
      unitPrice: 420,
      total: 420,
    });
  } else {
    lineItems.push({
      id: `li-${Date.now()}-1`,
      description: `${vendorName} Item / Service`,
      quantity: 1,
      unitPrice: basePrice,
      total: basePrice,
    });
  }

  const subtotal = lineItems.reduce((acc, it) => acc + it.total, 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const grandTotal = Number((subtotal + taxAmount).toFixed(2));

  const draft: Omit<ReceiptDocument, 'auditIssues' | 'calculatedTotal' | 'status'> = {
    id: `rcpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadTimestamp: Date.now(),
    fileHash,
    vendorName,
    vendorCategory: category,
    date: dateStr,
    invoiceNumber: `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    taxId,
    currency,
    currencySymbol,
    lineItems,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    paymentMethod: 'Credit Card',
    notes: 'Parsed securely on local machine. Zero telemetry sent to cloud.',
    visualData: {
      receiptTextLines: [
        vendorName.toUpperCase(),
        `TAX INVOICE: #INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        `Date: ${dateStr}`,
        taxId ? `GSTIN: ${taxId}` : 'UNREGISTERED SUPPLIER',
        '----------------------------------------',
        ...lineItems.map(item => `${item.description}: ${currencySymbol}${item.total.toFixed(2)}`),
        '----------------------------------------',
        `Subtotal: ${currencySymbol}${subtotal.toFixed(2)}`,
        `Tax (${taxRate}%): ${currencySymbol}${taxAmount.toFixed(2)}`,
        `TOTAL CHARGED: ${currencySymbol}${grandTotal.toFixed(2)}`,
      ],
      storeLocation: 'Local Device Ingestion',
      cashierOrTerminal: 'Offline Llama-Vision Parser',
      barcodeDigits: '890' + Math.floor(1000000000 + Math.random() * 9000000000),
    },
  };

  const audit = runSmartAudit(draft, existingDocs);

  return {
    ...draft,
    calculatedTotal: audit.calculatedTotal,
    auditIssues: audit.issues,
    status: audit.status,
  };
}
