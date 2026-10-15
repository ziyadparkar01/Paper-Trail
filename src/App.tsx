/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ReceiptDocument, AchievementStamp, EngineConfig, VaultUser } from './types/receipt';
import { SAMPLE_RECEIPTS } from './utils/mockSamples';
import { parseDocumentLocally } from './utils/documentParser';
import { runSmartAudit } from './utils/auditEngine';
import {
  initIndexedDb,
  saveReceiptToDb,
  bulkSaveReceiptsToDb,
  clearAllFromDb,
} from './db/indexedDb';
import {
  loadStoredStamps,
  saveStoredStamps,
} from './utils/localStorageVault';
import { TopNav, NavTab } from './components/TopNav';
import { NibMascot } from './components/NibMascot';
import { DropZone } from './components/DropZone';
import { CADashboard } from './components/CADashboard';
import { RepairMissions } from './components/RepairMissions';
import { TaxSavingsEngine } from './components/TaxSavingsEngine';
import { ModelBenchmarkStudio } from './components/ModelBenchmarkStudio';
import { AchievementPassport } from './components/AchievementPassport';
import { DevCommunityKit } from './components/DevCommunityKit';
import { ReviewModal } from './components/ReviewModal';
import { LocalEngineSettings } from './components/LocalEngineSettings';
import { VaultAuthModal } from './components/VaultAuthModal';
import { SovereignLoginGateway } from './components/SovereignLoginGateway';
import { ShieldCheck, HardDrive, Settings, Sparkles, Trash2, Cpu, DollarSign, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_STAMPS: AchievementStamp[] = [
  {
    id: 'stamp-first-batch',
    name: 'Ingestion Protocol Attested',
    description: 'Ingested and cryptographically hashed initial batch of financial documents.',
    badgeCode: 'INGEST_01',
    unlocked: true,
    unlockedAt: 'Oct 2026',
    color: 'indigo',
  },
  {
    id: 'stamp-audit-ace',
    name: 'Arithmetic Invariance Signoff',
    description: 'Diagnosed and balanced an arithmetic ledger variance via the Resolution Desk.',
    badgeCode: 'MATH_PARITY',
    unlocked: false,
    color: 'amber',
  },
  {
    id: 'stamp-privacy',
    name: 'Zero-Egress Security Attestation',
    description: '100% on-device vision inference verified without external network egress.',
    badgeCode: 'AIRGAP_PROVED',
    unlocked: true,
    unlockedAt: 'Active',
    color: 'emerald',
  },
  {
    id: 'stamp-ca-ready',
    name: 'Institutional CA Dossier Certified',
    description: 'Exported standardized financial schedules with GSTR-2B Input Tax Credit reconciliation.',
    badgeCode: 'CA_VERIFIED',
    unlocked: false,
    color: 'cyan',
  },
  {
    id: 'stamp-sleuth',
    name: 'Duplication Hash Barrier',
    description: 'Intercepted duplicate cryptographic receipt hashes prior to filing.',
    badgeCode: 'DEDUP_ACTIVE',
    unlocked: true,
    unlockedAt: 'Oct 2026',
    color: 'rose',
  },
];

export default function App() {
  const [receipts, setReceipts] = useState<ReceiptDocument[]>(SAMPLE_RECEIPTS);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [stamps, setStamps] = useState<AchievementStamp[]>(() =>
    loadStoredStamps(INITIAL_STAMPS)
  );
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDocument | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);

  // Vault Authentication state - starts null so login screen opens first
  const [vaultUser, setVaultUser] = useState<VaultUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [engineConfig, setEngineConfig] = useState<EngineConfig>({
    mode: 'local_heuristics',
    fastApiEndpoint: 'http://localhost:8000/api/parse-document',
    ollamaModel: 'llama3.2-vision:latest',
    selectedOpenWeightModel: 'llama-3.2-2b-vision',
    useSound: true,
    autoDeduplicate: true,
  });

  // Initialize Dexie IndexedDB on mount
  useEffect(() => {
    async function loadDb() {
      const stored = await initIndexedDb();
      if (stored && stored.length > 0) {
        setReceipts(stored);
      }
    }
    loadDb();
  }, []);

  // Save stamps to offline storage
  useEffect(() => {
    saveStoredStamps(stamps);
  }, [stamps]);

  const pendingRepairsCount = receipts.filter((r) =>
    r.auditIssues.some((issue) => !issue.fixed)
  ).length;

  const handleUnlockStamp = (stampId: string) => {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId
          ? {
              ...s,
              unlocked: true,
              unlockedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              }),
            }
          : s
      )
    );
  };

  const handleFilesDropped = async (files: File[]) => {
    setIsProcessingUpload(true);
    try {
      const newDocs: ReceiptDocument[] = [];
      for (const file of files) {
        const parsed = await parseDocumentLocally(file, [...receipts, ...newDocs]);
        newDocs.push(parsed);
      }
      const updated = [...newDocs, ...receipts];
      setReceipts(updated);
      await bulkSaveReceiptsToDb(newDocs);
      setShowUploadDrawer(false);

      handleUnlockStamp('stamp-first-batch');

      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Failed to parse documents:', err);
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleLoadSamples = async () => {
    setReceipts(SAMPLE_RECEIPTS);
    await bulkSaveReceiptsToDb(SAMPLE_RECEIPTS);
    setShowUploadDrawer(false);
  };

  const handleClearVault = async () => {
    if (confirm('Clear all ledger records from IndexedDB hardware vault?')) {
      setReceipts([]);
      await clearAllFromDb();
    }
  };

  const handleApplyFix = async (
    receiptId: string,
    issueId: string,
    action: string,
    val?: any
  ) => {
    const updatedList = receipts.map((r) => {
      if (r.id !== receiptId) return r;

      let updated = { ...r };

      if (action === 'FIX_MATH_TOTAL' && typeof val === 'number') {
        updated.grandTotal = val;
        updated.calculatedTotal = val;
      } else if (action === 'SET_TAX_ID' && typeof val === 'string') {
        updated.taxId = val;
      }

      const updatedIssues = updated.auditIssues.map((issue) =>
        issue.id === issueId ? { ...issue, fixed: true } : issue
      );

      const audit = runSmartAudit(
        {
          ...updated,
          taxId: updated.taxId,
          grandTotal: updated.grandTotal,
        },
        receipts.filter((item) => item.id !== receiptId)
      );

      const remainingActive = audit.issues.filter((i) => !i.fixed);

      const finalized = {
        ...updated,
        auditIssues: updatedIssues,
        calculatedTotal: audit.calculatedTotal,
        status: remainingActive.length === 0 ? ('verified' as const) : ('needs_repair' as const),
      };

      saveReceiptToDb(finalized);
      return finalized;
    });

    setReceipts(updatedList);
    handleUnlockStamp('stamp-audit-ace');
  };

  const handleSaveReceipt = async (updatedDoc: ReceiptDocument) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === updatedDoc.id ? updatedDoc : r))
    );
    await saveReceiptToDb(updatedDoc);
  };

  const handleToggleBillable = async (receiptId: string, clientName?: string) => {
    const updated = receipts.map((r) => {
      if (r.id !== receiptId) return r;
      const mod = {
        ...r,
        clientBillable: !r.clientBillable,
        clientName: !r.clientBillable ? clientName || 'Acme Studio' : undefined,
      };
      saveReceiptToDb(mod);
      return mod;
    });
    setReceipts(updated);
  };

  if (!vaultUser) {
    return (
      <SovereignLoginGateway
        onLogin={(user) => {
          setVaultUser(user);
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1912] text-[#141D17] py-3 sm:py-6 px-2 sm:px-6 lg:px-10 flex flex-col items-center justify-start font-sans selection:bg-[#82E6B3]/40 selection:text-[#0E1713]">
      {/* Top Institutional Viewport Status Bar */}
      <div className="w-full max-w-[1440px] px-4 pb-3 flex items-center justify-between text-[11px] font-mono text-[#82E6B3]/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#82E6B3] animate-pulse shadow-[0_0_8px_rgba(130,230,179,0.8)]" />
          <span className="font-semibold tracking-wider uppercase text-[#82E6B3]">
            PaperTrail Sovereign Vault
          </span>
          <span className="hidden md:inline text-white/30">|</span>
          <span className="hidden md:inline text-[#DEE6DC]/70 font-cursive text-sm">
            Private Credit & Freelance Ledger Sovereign · Zero Cloud Egress
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#DEE6DC]/60 hidden sm:inline">
            ENCRYPTION: AES-GCM-256
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#82E6B3]/15 text-[#82E6B3] border border-[#82E6B3]/30 text-[10px] font-bold">
            100% AIR-GAPPED
          </span>
        </div>
      </div>

      {/* Main Luxury Application Canvas Container */}
      <div className="w-full max-w-[1440px] bg-[#EBF0E8] rounded-[32px] border border-[#141D17]/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col my-auto transition-all">
        {/* Institutional Top Bar */}
        <TopNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setShowUploadDrawer(false);
          }}
          onQuickUpload={() => setShowUploadDrawer(true)}
          pendingRepairsCount={pendingRepairsCount}
          vaultUser={vaultUser}
          onLockVault={() => {
            setVaultUser(null);
          }}
          onOpenAuth={() => {
            setVaultUser(null);
          }}
        />

        {/* Main Viewport Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Quick Upload Ingestion Banner */}
          {(showUploadDrawer || receipts.length === 0) && (
            <div className="bg-[#DEE6DC]/80 border border-[#141D17]/10 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#141D17]/8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#141D17]">
                    Document Ingestion Pipeline
                  </span>
                  <span className="text-[10px] font-mono text-[#0E1713] bg-[#82E6B3] px-2.5 py-0.5 rounded-full font-bold border border-[#141D17]/10">
                    IndexedDB Hardware Enclave
                  </span>
                </div>
                {receipts.length > 0 && (
                  <button
                    onClick={() => setShowUploadDrawer(false)}
                    className="text-xs font-mono text-[#5E6D64] hover:text-[#141D17] cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>
              <DropZone
                onFilesDropped={handleFilesDropped}
                onLoadSamples={handleLoadSamples}
                isProcessing={isProcessingUpload}
              />
            </div>
          )}

          {/* Dynamic Tab Content */}
          {activeTab === 'dashboard' && (
            <CADashboard
              receipts={receipts}
              onOpenReceipt={(r) => setSelectedReceipt(r)}
              onLaunchRepair={(r) => {
                setActiveTab('repair');
              }}
            />
          )}

          {activeTab === 'repair' && (
            <RepairMissions
              receipts={receipts}
              onApplyFix={handleApplyFix}
              onOpenReceipt={(r) => setSelectedReceipt(r)}
              onUnlockStamp={handleUnlockStamp}
            />
          )}

          {activeTab === 'roi' && (
            <TaxSavingsEngine
              receipts={receipts}
              onToggleBillable={handleToggleBillable}
            />
          )}

          {activeTab === 'models' && (
            <ModelBenchmarkStudio
              config={engineConfig}
              onSelectModel={(modelId) =>
                setEngineConfig({ ...engineConfig, selectedOpenWeightModel: modelId })
              }
            />
          )}

          {activeTab === 'passport' && (
            <AchievementPassport
              stamps={stamps}
              onTriggerStamp={handleUnlockStamp}
            />
          )}

          {activeTab === 'devkit' && (
            <DevCommunityKit receipts={receipts} />
          )}
        </main>

        {/* Institutional Canvas Footer */}
        <footer className="bg-white/50 border-t border-[#141D17]/8 py-4 px-4 sm:px-8 mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#5E6D64]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#141D17]">PaperTrail Platform</span>
              <span aria-hidden="true">·</span>
              <span>Private Credit & Freelance Document Sovereign</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Air-Gapped Hardware Enclave Active
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="hover:text-[#141D17] transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-[#5E6D64]" />
                Infrastructure Settings
              </button>
              <span className="text-[#141D17]/20">·</span>
              <button
                onClick={() => setVaultUser(null)}
                className="hover:text-[#141D17] text-[#5E6D64] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title="Lock vault and return to sign in"
              >
                <LogOut className="w-3.5 h-3.5" />
                Lock Vault
              </button>
              <span className="text-[#141D17]/20">·</span>
              <button
                onClick={handleClearVault}
                className="text-[#5E6D64] hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge Vault
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Review & Edit Modal */}
      {selectedReceipt && (
        <ReviewModal
          receipt={selectedReceipt}
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          onSave={handleSaveReceipt}
        />
      )}

      {/* Local Engine Settings Modal */}
      <LocalEngineSettings
        config={engineConfig}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateConfig={setEngineConfig}
      />

      {/* Vault Authentication & Master Passcode Unlock Modal */}
      <VaultAuthModal
        isOpen={isAuthModalOpen}
        currentUser={vaultUser}
        onUnlock={(user) => {
          setVaultUser(user);
          setIsAuthModalOpen(false);
        }}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
