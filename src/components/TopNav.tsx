import React from 'react';
import {
  Plus,
  FileSpreadsheet,
  Wrench,
  TrendingUp,
  Cpu,
  Award,
  BookOpen,
  Lock,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { UserVaultPill } from './UserVaultPill';
import { VaultUser } from '../types/receipt';

export type NavTab = 'dashboard' | 'repair' | 'roi' | 'models' | 'passport' | 'devkit';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onQuickUpload: () => void;
  pendingRepairsCount: number;
  vaultUser: VaultUser | null;
  onLockVault: () => void;
  onOpenAuth: () => void;
}

const TABS: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'General Ledger', icon: FileSpreadsheet },
  { id: 'repair', label: 'Variance Desk', icon: Wrench },
  { id: 'roi', label: 'Tax Yield', icon: TrendingUp },
  { id: 'models', label: 'AI Hardware', icon: Cpu },
  { id: 'passport', label: 'Audit Stamps', icon: Award },
  { id: 'devkit', label: 'Dossier', icon: BookOpen },
];

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onQuickUpload,
  pendingRepairsCount,
  vaultUser,
  onLockVault,
  onOpenAuth,
}) => {
  return (
    <header className="px-5 sm:px-8 pt-5 pb-4 border-b border-[#141D17]/8 bg-white/40 backdrop-blur-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Cursive Seal Zone */}
        <div className="flex items-center justify-between gap-4">
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#141D17] text-[#82E6B3] flex items-center justify-center font-bold text-xs font-mono shadow-md border border-[#82E6B3]/30 transition-transform group-hover:scale-105 group-hover:rotate-[-2deg]">
                PT
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#82E6B3] border-2 border-[#EBF0E8]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-serif font-bold tracking-tight text-[#141D17] group-hover:text-emerald-950 transition-colors">
                  PaperTrail
                </span>
                <span className="font-cursive text-xl text-emerald-800 font-bold rotate-[-3deg] hidden sm:inline">
                  Sovereign
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase text-[#0E1713] bg-[#82E6B3] px-2 py-0.5 rounded-full border border-[#141D17]/10 font-bold">
                  Air-Gapped
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#5E6D64] flex items-center gap-1.5 mt-0.5">
                <span>Zero Cloud Egress</span>
                <span>·</span>
                <span className="font-cursive text-xs text-emerald-900 font-semibold">
                  Handcrafted for Freelancers
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Right Action Elements */}
          <div className="flex items-center gap-2 lg:hidden">
            <PWAInstallButton />
            <UserVaultPill user={vaultUser} onLockVault={onLockVault} onOpenAuth={onOpenAuth} />
          </div>
        </div>

        {/* Floating Segmented Luxury Gliding Tabs */}
        <nav className="flex items-center bg-[#DEE6DC]/90 p-1 rounded-full border border-[#141D17]/8 overflow-x-auto max-w-full shadow-inner">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count = tab.id === 'repair' ? pendingRepairsCount : undefined;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap cursor-pointer z-10 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#141D17]'
                    : 'text-[#5E6D64] hover:text-[#141D17] hover:bg-black/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-white rounded-full shadow-sm border border-[#141D17]/10 -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-800 stroke-[2.2]' : 'text-[#5E6D64]'}`} />
                <span>{tab.label}</span>

                {count !== undefined && count > 0 && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white shadow-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Reshaped Attractive Action Controls & User Pill */}
        <div className="hidden lg:flex items-center gap-3">
          <OfflineStatusIndicator />
          <PWAInstallButton />
          <UserVaultPill user={vaultUser} onLockVault={onLockVault} onOpenAuth={onOpenAuth} />

          {/* Reshaped Luxury Ingest Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ y: -1, scale: 1.02 }}
            onClick={onQuickUpload}
            className="px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6be0a4] hover:from-[#72dca5] hover:to-[#5ed395] text-[#0E1713] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_14px_rgba(130,230,179,0.4)] border border-[#141D17]/12 active:shadow-xs"
          >
            <div className="w-4 h-4 rounded-full bg-[#0E1713] text-[#82E6B3] flex items-center justify-center">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="font-mono tracking-tight uppercase">Ingest Document</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
