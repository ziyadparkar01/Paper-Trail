import React, { useState, useRef, useEffect } from 'react';
import { VaultUser } from '../types/receipt';
import { Lock, ShieldCheck, ChevronDown, LogOut, KeyRound, Cpu, WifiOff } from 'lucide-react';

interface UserVaultPillProps {
  user: VaultUser | null;
  onLockVault: () => void;
  onOpenAuth: () => void;
}

export const UserVaultPill: React.FC<UserVaultPillProps> = ({
  user,
  onLockVault,
  onOpenAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onOpenAuth}
        className="px-3 py-1.5 text-xs font-mono font-semibold rounded-full bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#141D17]/10"
      >
        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Unlock Vault</span>
      </button>
    );
  }

  const isAirGapped = user.isAirGapped;
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#141D17]/10 hover:border-[#141D17]/20 bg-white/70 hover:bg-white transition-colors cursor-pointer text-left shadow-2xs"
      >
        {/* Monogram */}
        <div className="w-6 h-6 rounded-full bg-[#141D17] text-[#82E6B3] flex items-center justify-center font-bold text-[10px] font-mono">
          {initials}
        </div>

        <div className="hidden sm:block">
          <div className="text-xs font-bold text-[#141D17] leading-tight truncate max-w-[110px]">
            {user.name}
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono leading-none mt-0.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAirGapped ? 'bg-emerald-600' : 'bg-blue-600'
              }`}
            />
            <span className="text-[#5E6D64] uppercase tracking-tight">
              {isAirGapped ? 'Air-Gapped' : 'OIDC Synced'}
            </span>
          </div>
        </div>

        <ChevronDown className="w-3 h-3 text-[#5E6D64] ml-0.5" />
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#FAFBF9] border border-[#141D17]/10 rounded-2xl shadow-xl p-3.5 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-150 text-[#141D17]">
          <div className="pb-3 border-b border-[#141D17]/8">
            <div className="font-bold text-[#141D17]">{user.name}</div>
            <div className="text-[#5E6D64] text-[11px] truncate">{user.email}</div>
          </div>

          <div className="py-2.5 space-y-1.5 text-[10px] text-[#5E6D64]">
            <div className="flex justify-between">
              <span>Security Tier:</span>
              <span className="font-bold text-emerald-800">AES-GCM-256</span>
            </div>
            <div className="flex justify-between">
              <span>Local Storage:</span>
              <span className="font-bold text-[#141D17]">IndexedDB (Dexie)</span>
            </div>
            <div className="flex justify-between">
              <span>Network State:</span>
              <span className="font-bold text-[#141D17]">
                {isAirGapped ? 'Offline Zero-Egress' : 'Online Verified'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#141D17]/8 flex flex-col gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onLockVault();
              }}
              className="w-full py-1.5 px-2.5 rounded-xl text-rose-700 hover:bg-rose-50 font-semibold flex items-center gap-1.5 text-xs transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Encrypted Vault</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
