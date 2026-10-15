import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

export type NibMood = 'idle' | 'scanning' | 'alert' | 'celebrating' | 'curious';

interface NibMascotProps {
  mood?: NibMood;
  message?: string;
  subMessage?: string;
  onActionClick?: () => void;
  actionLabel?: string;
  compact?: boolean;
}

export const NibMascot: React.FC<NibMascotProps> = ({
  mood = 'idle',
  message,
  subMessage,
  onActionClick,
  actionLabel,
  compact = false,
}) => {
  const isAlert = mood === 'alert';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-2xl transition-all ${
        compact ? 'p-3.5' : 'p-4 sm:p-5'
      } ${
        isAlert
          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
          : 'bg-[#DEE6DC]/80 border-[#141D17]/8 text-[#141D17]'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Luxury Stylus Hallmark */}
        <div className="relative shrink-0 select-none">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-xs ${
              isAlert
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-[#141D17] border-[#141D17] text-[#82E6B3]'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 4L38 18V32L24 44L10 32V18L24 4Z"
                fill="currentColor"
                fillOpacity="0.2"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M24 4L10 18V32L24 44V4Z"
                fill="currentColor"
                fillOpacity="0.35"
              />
              <circle cx="24" cy="22" r="2.5" fill="currentColor" />
              <line
                x1="24"
                y1="25"
                x2="24"
                y2="44"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Executive Auditor Intelligence Brief */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-[#5E6D64]">
              Audit Intelligence · Nib Engine
            </span>
            <span className="text-[#141D17]/20">·</span>
            <span
              className={`text-[10px] font-mono font-semibold uppercase ${
                isAlert ? 'text-rose-700' : 'text-emerald-800'
              }`}
            >
              {isAlert ? 'Variance Detected' : 'Invariance Verified'}
            </span>
          </div>

          <div className="text-base font-serif font-bold text-[#141D17] tracking-tight leading-snug">
            {message || "Air-gapped verification active. Zero documents leave device memory."}
          </div>

          {subMessage && (
            <div className="text-xs text-[#5E6D64] mt-1 leading-relaxed">
              {subMessage}
              <span className="font-cursive text-sm text-emerald-800 font-bold ml-1.5 select-none">
                — Signed, Nib ✒️
              </span>
            </div>
          )}
        </div>

        {onActionClick && actionLabel && (
          <motion.button
            whileHover={{ y: -1, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onActionClick}
            className={`shrink-0 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1 cursor-pointer border shadow-2xs ${
              isAlert
                ? 'bg-rose-700 hover:bg-rose-800 text-white border-rose-800'
                : 'bg-[#141D17] hover:bg-[#202e24] text-[#82E6B3] border-[#141D17]'
            }`}
          >
            <span>{actionLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
