import { ReceiptDocument, AchievementStamp, EngineConfig } from '../types/receipt';
import { SAMPLE_RECEIPTS } from './mockSamples';

const RECEIPTS_KEY = 'papertrail_receipts_v1';
const STAMPS_KEY = 'papertrail_stamps_v1';
const CONFIG_KEY = 'papertrail_config_v1';

export function loadStoredReceipts(): ReceiptDocument[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (!raw) return SAMPLE_RECEIPTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_RECEIPTS;
  } catch (err) {
    console.warn('Could not read from localStorage, using samples', err);
    return SAMPLE_RECEIPTS;
  }
}

export function saveStoredReceipts(receipts: ReceiptDocument[]): void {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  } catch (err) {
    console.warn('Could not write to localStorage', err);
  }
}

export function loadStoredStamps(defaultStamps: AchievementStamp[]): AchievementStamp[] {
  try {
    const raw = localStorage.getItem(STAMPS_KEY);
    if (!raw) return defaultStamps;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultStamps;
  } catch {
    return defaultStamps;
  }
}

export function saveStoredStamps(stamps: AchievementStamp[]): void {
  try {
    localStorage.setItem(STAMPS_KEY, JSON.stringify(stamps));
  } catch (err) {
    console.warn('Could not save stamps', err);
  }
}
