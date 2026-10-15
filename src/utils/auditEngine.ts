import { AuditIssue, ReceiptDocument } from '../types/receipt';

export function runSmartAudit(
  doc: Omit<ReceiptDocument, 'auditIssues' | 'calculatedTotal' | 'status'>,
  allExistingDocs: ReceiptDocument[] = []
): { issues: AuditIssue[]; calculatedTotal: number; status: 'verified' | 'needs_repair' | 'pending_review' } {
  const issues: AuditIssue[] = [];

  // 1. Line items sum
  const lineItemsSum = doc.lineItems.reduce((acc, item) => acc + item.total, 0);
  
  // Calculated total = line items total + taxAmount (or subtotal + taxAmount)
  const baseSubtotal = doc.lineItems.length > 0 ? lineItemsSum : doc.subtotal;
  const calculatedTotal = Number((baseSubtotal + doc.taxAmount).toFixed(2));
  
  // Math discrepancy check
  const mathDelta = Math.abs(calculatedTotal - doc.grandTotal);
  if (mathDelta > 0.05) {
    issues.push({
      id: `math-${doc.id}`,
      type: 'MATH_MISMATCH',
      severity: 'critical',
      title: 'Math Total Discrepancy',
      description: `Sum of line items (${doc.currencySymbol}${baseSubtotal.toFixed(2)}) + Tax (${doc.currencySymbol}${doc.taxAmount.toFixed(2)}) is ${doc.currencySymbol}${calculatedTotal.toFixed(2)}, but grand total shows ${doc.currencySymbol}${doc.grandTotal.toFixed(2)} (gap: ${doc.currencySymbol}${mathDelta.toFixed(2)}).`,
      field: 'grandTotal',
      expectedValue: calculatedTotal,
      foundValue: doc.grandTotal,
      suggestedFix: `Update Grand Total to ${doc.currencySymbol}${calculatedTotal.toFixed(2)}`,
      fixed: false,
    });
  }

  // 2. Duplicate receipt check (by file hash or exact vendor + date + total combo)
  const isDuplicate = allExistingDocs.some(
    (existing) =>
      existing.id !== doc.id &&
      (existing.fileHash === doc.fileHash ||
        (existing.vendorName.toLowerCase().trim() === doc.vendorName.toLowerCase().trim() &&
          existing.date === doc.date &&
          Math.abs(existing.grandTotal - doc.grandTotal) < 0.01))
  );

  if (isDuplicate) {
    issues.push({
      id: `dup-${doc.id}`,
      type: 'DUPLICATE_RECEIPT',
      severity: 'critical',
      title: 'Potential Duplicate Entry',
      description: `Identical receipt hash or matching vendor (${doc.vendorName}), date (${doc.date}), and total (${doc.currencySymbol}${doc.grandTotal.toFixed(2)}) already exists in your vault.`,
      field: 'fileHash',
      suggestedFix: 'Remove this duplicate or mark as intentional second transaction.',
      fixed: false,
    });
  }

  // 3. Missing GSTIN / Tax ID check
  const taxExemptCategories = ['Client Meals', 'Travel & Transit'];
  const isTaxExemptCategory = taxExemptCategories.includes(doc.vendorCategory);
  
  if (!doc.taxId || doc.taxId.trim() === '' || doc.taxId.toUpperCase() === 'N/A') {
    if (!isTaxExemptCategory && doc.grandTotal > 500) {
      issues.push({
        id: `tax-${doc.id}`,
        type: 'MISSING_TAX_ID',
        severity: 'warning',
        title: 'Missing GSTIN / Tax ID',
        description: `This business expense (${doc.currencySymbol}${doc.grandTotal.toFixed(2)}) has no GSTIN/Tax ID recorded. Your CA may reject Input Tax Credit (ITC) for this vendor.`,
        field: 'taxId',
        suggestedFix: 'Add vendor GSTIN or mark as unregistered supplier.',
        fixed: false,
      });
    }
  }

  // 4. Future Date Check
  const docDate = new Date(doc.date);
  const now = new Date();
  // allow 1 day buffer for timezones
  now.setDate(now.getDate() + 1);
  if (!isNaN(docDate.getTime()) && docDate > now) {
    issues.push({
      id: `date-${doc.id}`,
      type: 'FUTURE_DATE',
      severity: 'warning',
      title: 'Future Invoice Date',
      description: `Invoice date (${doc.date}) appears in the future. Check for a typo in the year.`,
      field: 'date',
      expectedValue: new Date().toISOString().split('T')[0],
      foundValue: doc.date,
      suggestedFix: `Set date to today (${new Date().toISOString().split('T')[0]})`,
      fixed: false,
    });
  }

  const criticalOrWarningIssues = issues.filter(i => !i.fixed);
  const status: 'verified' | 'needs_repair' | 'pending_review' =
    criticalOrWarningIssues.length > 0 ? 'needs_repair' : 'verified';

  return {
    issues,
    calculatedTotal,
    status,
  };
}

export async function computeClientSHA256(fileContent: string | ArrayBuffer): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = typeof fileContent === 'string' ? encoder.encode(fileContent) : new Uint8Array(fileContent);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // fallback pseudo hash
    let hash = 0;
    const str = typeof fileContent === 'string' ? fileContent : 'binary-data';
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}
