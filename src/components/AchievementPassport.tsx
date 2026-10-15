import React from 'react';
import { AchievementStamp } from '../types/receipt';
import { Check, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { NibMascot } from './NibMascot';

interface AchievementPassportProps {
  stamps: AchievementStamp[];
  onTriggerStamp?: (stampId: string) => void;
}

export const AchievementPassport: React.FC<AchievementPassportProps> = ({
  stamps,
  onTriggerStamp,
}) => {
  const unlockedCount = stamps.filter((s) => s.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Top Banner with Nib */}
      <NibMascot
        mood="celebrating"
        message={`Audit Compliance Level: ${unlockedCount} of ${stamps.length} attestations satisfied.`}
        subMessage="Attestations cryptographically verify that your financial records conform to regional tax schedules, zero-leak standards, and mathematical parity."
      />

      {/* Compliance Ledger Book Design */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#141D17]/8 pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-emerald-800 font-semibold">
              Compliance Audit Certificate
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#141D17] tracking-tight mt-0.5">
              Tax Season Cryptographic Attestations
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold px-3 py-1 bg-[#DEE6DC] text-[#141D17] rounded-full border border-[#141D17]/8">
              Verified: {unlockedCount} / {stamps.length}
            </span>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stamps.map((stamp, index) => {
            const isUnlocked = stamp.unlocked;

            return (
              <motion.div
                key={stamp.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={`border rounded-2xl p-6 relative flex flex-col justify-between min-h-[180px] ${
                  isUnlocked
                    ? 'border-[#141D17]/10 bg-[#DEE6DC]/40 shadow-xs'
                    : 'border-dashed border-[#141D17]/15 bg-[#EBF0E8]/50 opacity-50'
                }`}
              >
                {/* Stamp visual overlay */}
                {isUnlocked && (
                  <div className="absolute right-4 top-4 select-none pointer-events-none">
                    <div
                      className={`animate-stamp border-2 font-mono font-black text-[9px] tracking-widest px-2.5 py-0.5 rounded-full rotate-[-6deg] uppercase ${
                        stamp.color === 'emerald'
                          ? 'border-emerald-700 text-emerald-800 bg-emerald-50/90'
                          : stamp.color === 'amber'
                          ? 'border-amber-700 text-amber-800 bg-amber-50/90'
                          : stamp.color === 'rose'
                          ? 'border-rose-700 text-rose-800 bg-rose-50/90'
                          : 'border-[#141D17] text-[#141D17] bg-white/90'
                      }`}
                    >
                      Audit Sealed
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[10px] ${
                        isUnlocked
                          ? 'bg-[#141D17] text-[#82E6B3]'
                          : 'bg-[#C4CFC2] text-[#5E6D64]'
                      }`}
                    >
                      0{index + 1}
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5E6D64]">
                      {stamp.badgeCode}
                    </span>
                  </div>

                  <h4 className="text-base font-serif font-bold text-[#141D17] tracking-tight">
                    {stamp.name}
                  </h4>
                  <p className="text-xs text-[#5E6D64] mt-1 leading-relaxed">
                    {stamp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#141D17]/8 flex items-center justify-between text-[11px] font-mono">
                  {isUnlocked ? (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Attested {stamp.unlockedAt || 'Active'}
                    </span>
                  ) : (
                    <span className="text-[#88998D]">Pending Attestation</span>
                  )}

                  {!isUnlocked && onTriggerStamp && (
                    <button
                      onClick={() => onTriggerStamp(stamp.id)}
                      className="text-[#141D17] hover:underline cursor-pointer font-semibold"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Cryptographic Seal */}
        <div className="mt-8 pt-4 border-t border-[#141D17]/8 flex flex-wrap items-center justify-between text-xs text-[#5E6D64] gap-2 font-mono">
          <div className="flex items-center gap-2 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-[#141D17]" />
            <span>Cryptographic Proof: SHA-256 Invariance Ledger Attached</span>
          </div>
          <div className="text-[11px] text-[#5E6D64]">
            Attestation Authority: Local Hardware Enclave #AIRGAP-2026
          </div>
        </div>
      </div>
    </motion.div>
  );
};
