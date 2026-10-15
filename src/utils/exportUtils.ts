import { ReceiptDocument } from '../types/receipt';

export function exportToCACSV(receipts: ReceiptDocument[], freelancerName: string = 'Freelance Studio'): void {
  const headers = [
    'Sl. No',
    'Date (YYYY-MM-DD)',
    'Vendor / Merchant Name',
    'Category',
    'Invoice / Bill #',
    'GSTIN / Tax ID',
    'Payment Method',
    'Currency',
    'Base Amount (Taxable)',
    'GST Rate (%)',
    'Tax Amount (ITC Claimable)',
    'Grand Total',
    'Verification Status',
    'File Hash (SHA-256)',
    'Notes / Remarks',
  ];

  const rows = receipts.map((r, index) => {
    return [
      (index + 1).toString(),
      r.date,
      `"${r.vendorName.replace(/"/g, '""')}"`,
      `"${r.vendorCategory}"`,
      `"${r.invoiceNumber}"`,
      `"${r.taxId || 'UNREGISTERED'}"`,
      r.paymentMethod,
      r.currency,
      r.subtotal.toFixed(2),
      `${r.taxRate}%`,
      r.taxAmount.toFixed(2),
      r.grandTotal.toFixed(2),
      r.status === 'verified' ? 'CA_VERIFIED' : 'NEEDS_REVIEW',
      r.fileHash,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `PaperTrail_CA_Tax_Report_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportJSONVault(receipts: ReceiptDocument[]): void {
  const payload = {
    app: 'PaperTrail',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    totalReceipts: receipts.length,
    totalExpenditure: receipts.reduce((acc, r) => acc + r.grandTotal, 0),
    receipts,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `PaperTrail_Vault_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generatePrintableCASummary(receipts: ReceiptDocument[], freelancerName: string = 'Independent Creator Studio'): string {
  const totalSpend = receipts.reduce((acc, r) => acc + r.grandTotal, 0);
  const totalTaxClaimable = receipts
    .filter((r) => r.taxId && r.taxAmount > 0)
    .reduce((acc, r) => acc + r.taxAmount, 0);
  const verifiedCount = receipts.filter((r) => r.status === 'verified').length;

  const categoryMap: Record<string, number> = {};
  receipts.forEach((r) => {
    categoryMap[r.vendorCategory] = (categoryMap[r.vendorCategory] || 0) + r.grandTotal;
  });

  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, amt]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">${cat}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-family: monospace;">${((amt / (totalSpend || 1)) * 100).toFixed(1)}%</td>
      </tr>
    `
    )
    .join('');

  const itemRows = receipts
    .map(
      (r, i) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${i + 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-family: monospace;">${r.date}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; font-weight: 600;">${r.vendorName}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-family: monospace; color: #475569;">${r.taxId || '—'}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px;">${r.vendorCategory}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-family: monospace;">₹${r.subtotal.toFixed(2)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-family: monospace; color: #16a34a;">₹${r.taxAmount.toFixed(2)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; text-align: right; font-family: monospace; font-weight: 700;">₹${r.grandTotal.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>PaperTrail CA Summary Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
          @media print { body { padding: 0; } }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 2px solid #cbd5e1; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 20px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">PaperTrail Financial Summary</h1>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px;">Audited & Prepared for Chartered Accountant Review</p>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 16px;">${freelancerName}</div>
            <div style="font-size: 13px; color: #64748b;">Report Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div style="font-size: 12px; color: #16a34a; font-weight: 600; margin-top: 4px;">100% Local-First Offline Verified</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 24px 0;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">TOTAL EXPENDITURE</div>
            <div style="font-size: 24px; font-weight: 800; font-family: monospace; margin-top: 4px;">₹${totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Across ${receipts.length} documents</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px;">
            <div style="font-size: 12px; color: #166534; font-weight: 600;">INPUT TAX CREDIT (ITC)</div>
            <div style="font-size: 24px; font-weight: 800; font-family: monospace; color: #16a34a; margin-top: 4px;">₹${totalTaxClaimable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            <div style="font-size: 12px; color: #166534; margin-top: 2px;">Claimable against GST output liability</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">AUDIT PASS RATE</div>
            <div style="font-size: 24px; font-weight: 800; font-family: monospace; margin-top: 4px;">${((verifiedCount / (receipts.length || 1)) * 100).toFixed(0)}%</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${verifiedCount} of ${receipts.length} verified</div>
          </div>
        </div>

        <h3 style="font-size: 16px; margin: 30px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Expense Category Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Amount (INR)</th>
              <th style="text-align: right;">Share</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>

        <h3 style="font-size: 16px; margin: 36px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Itemized Audited Ledger</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Vendor</th>
              <th>GSTIN</th>
              <th>Category</th>
              <th style="text-align: right;">Subtotal</th>
              <th style="text-align: right;">Tax (ITC)</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; display: flex; justify-content: space-between;">
          <div>PaperTrail Local-First Document Engine • Zero Data Transferred to External Cloud</div>
          <div>Page 1 of 1</div>
        </div>
      </body>
    </html>
  `;
}
