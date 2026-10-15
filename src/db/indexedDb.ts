import Dexie, { Table } from 'dexie';
import { ReceiptDocument, AchievementStamp } from '../types/receipt';
import { SAMPLE_RECEIPTS } from '../utils/mockSamples';

export class PaperTrailDatabase extends Dexie {
  receipts!: Table<ReceiptDocument, string>;
  stamps!: Table<AchievementStamp, string>;
  vaultMeta!: Table<{ key: string; value: any }, string>;

  constructor() {
    super('PaperTrailLocalDB');
    this.version(1).stores({
      receipts: 'id, fileHash, date, vendorCategory, status, clientBillable, uploadTimestamp',
      stamps: 'id, unlocked',
      vaultMeta: 'key',
    });
  }
}

export const db = new PaperTrailDatabase();

export async function initIndexedDb(): Promise<ReceiptDocument[]> {
  try {
    const count = await db.receipts.count();
    if (count === 0) {
      // Seed initial sample receipts
      await db.receipts.bulkAdd(SAMPLE_RECEIPTS);
      return SAMPLE_RECEIPTS;
    }
    const docs = await db.receipts.orderBy('uploadTimestamp').reverse().toArray();
    return docs;
  } catch (err) {
    console.warn('IndexedDB unavailable or blocked, falling back to localStorage:', err);
    const raw = localStorage.getItem('papertrail_receipts_v1');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return SAMPLE_RECEIPTS;
  }
}

export async function saveReceiptToDb(receipt: ReceiptDocument): Promise<void> {
  try {
    await db.receipts.put(receipt);
  } catch (err) {
    console.warn('Failed to put receipt in IndexedDB:', err);
  }
}

export async function bulkSaveReceiptsToDb(receipts: ReceiptDocument[]): Promise<void> {
  try {
    await db.receipts.bulkPut(receipts);
  } catch (err) {
    console.warn('Failed to bulkPut receipts in IndexedDB:', err);
  }
}

export async function deleteReceiptFromDb(id: string): Promise<void> {
  try {
    await db.receipts.delete(id);
  } catch (err) {
    console.warn('Failed to delete receipt from IndexedDB:', err);
  }
}

export async function clearAllFromDb(): Promise<void> {
  try {
    await db.receipts.clear();
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }
}
