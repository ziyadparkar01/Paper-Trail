import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck, Check } from 'lucide-react';

export const OfflineStatusIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5E6D64] bg-white/60 px-2.5 py-1 rounded-full border border-[#141D17]/8">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
        <span className="hidden sm:inline text-[#141D17] font-medium">Air-Gapped Enclave</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full shadow-2xs">
      <WifiOff className="w-3 h-3 text-amber-700 animate-pulse" />
      <span>AIRPLANE MODE: 100% LOCAL</span>
    </div>
  );
};
