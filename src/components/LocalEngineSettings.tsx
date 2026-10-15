import React from 'react';
import { EngineConfig } from '../types/receipt';
import { ShieldCheck, HardDrive, Terminal, Lock, CheckCircle2, Cpu, Volume2, VolumeX, X } from 'lucide-react';

interface LocalEngineSettingsProps {
  config: EngineConfig;
  isOpen: boolean;
  onClose: () => void;
  onUpdateConfig: (newConfig: EngineConfig) => void;
}

export const LocalEngineSettings: React.FC<LocalEngineSettingsProps> = ({
  config,
  isOpen,
  onClose,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1912]/80 backdrop-blur-md">
      <div className="bg-[#EBF0E8] rounded-[28px] shadow-2xl border border-[#141D17]/10 w-full max-w-lg overflow-hidden text-[#141D17]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#141D17]/8 flex items-center justify-between bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#141D17] text-[#82E6B3] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#141D17] font-serif">
                Inference Engine & Security Vault
              </h3>
              <p className="text-[10px] font-mono text-[#5E6D64]">Cryptographic On-Device Pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5E6D64] hover:text-[#141D17] p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-[#141D17]">
          {/* Privacy Trust Banner */}
          <div className="bg-white/80 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <Lock className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-emerald-900 font-mono text-xs">
                Zero Cloud Leakage Active
              </div>
              <p className="text-[#5E6D64] text-[11px] mt-0.5 leading-relaxed font-sans">
                Receipts, invoice numbers, GSTINs, and vendor details stay strictly inside your local memory and browser storage.
              </p>
            </div>
          </div>

          {/* Engine Modes */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono font-bold text-[#5E6D64] uppercase tracking-wider">
              Document Inference Pipeline
            </label>

            {/* Mode 1: Pure Offline */}
            <div
              onClick={() => onUpdateConfig({ ...config, mode: 'local_heuristics' })}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                config.mode === 'local_heuristics'
                  ? 'border-[#141D17] bg-white shadow-xs'
                  : 'border-[#141D17]/10 hover:border-[#141D17]/25 bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#141D17] font-mono">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  On-Device Neural Heuristics (Default)
                </div>
                {config.mode === 'local_heuristics' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                )}
              </div>
              <p className="text-[11px] text-[#5E6D64] mt-1 pl-6">
                100% offline. Instant client-side text parsing, regex validation, and SHA-256 verification. Zero backend required.
              </p>
            </div>

            {/* Mode 2: Local FastAPI + Ollama */}
            <div
              onClick={() => onUpdateConfig({ ...config, mode: 'local_fastapi' })}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                config.mode === 'local_fastapi'
                  ? 'border-[#141D17] bg-white shadow-xs'
                  : 'border-[#141D17]/10 hover:border-[#141D17]/25 bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#141D17] font-mono">
                  <Terminal className="w-4 h-4 text-emerald-700" />
                  Local FastAPI + Ollama Vision Runner
                </div>
                {config.mode === 'local_fastapi' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                )}
              </div>
              <p className="text-[11px] text-[#5E6D64] mt-1 pl-6">
                Connects to local <code className="font-mono text-emerald-800 bg-[#DEE6DC] px-1 py-0.5 rounded">localhost:8000</code> running Llama-3.2-Vision or Qwen-2.5-VL via Ollama.
              </p>

              {config.mode === 'local_fastapi' && (
                <div className="mt-3 pl-6 space-y-2">
                  <div>
                    <label className="text-[10px] font-mono text-[#5E6D64] block">
                      FastAPI Endpoint URL
                    </label>
                    <input
                      type="text"
                      value={config.fastApiEndpoint}
                      onChange={(e) =>
                        onUpdateConfig({ ...config, fastApiEndpoint: e.target.value })
                      }
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#141D17]/15 rounded-lg bg-white text-[#141D17] mt-0.5 focus:outline-hidden focus:border-[#141D17]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#5E6D64] block">
                      Local Vision Model Tag
                    </label>
                    <input
                      type="text"
                      value={config.ollamaModel}
                      onChange={(e) =>
                        onUpdateConfig({ ...config, ollamaModel: e.target.value })
                      }
                      className="w-full text-xs font-mono px-3 py-1.5 border border-[#141D17]/15 rounded-lg bg-white text-[#141D17] mt-0.5 focus:outline-hidden focus:border-[#141D17]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deduplication Switch */}
          <div className="pt-3 border-t border-[#141D17]/8 flex items-center justify-between font-mono">
            <div>
              <div className="font-bold text-[#141D17] text-xs">
                SHA-256 Duplication Guard
              </div>
              <p className="text-[11px] text-[#5E6D64]">
                Intercept identical documents to prevent duplicate filing deductions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.autoDeduplicate}
              onChange={(e) =>
                onUpdateConfig({ ...config, autoDeduplicate: e.target.checked })
              }
              className="w-4 h-4 rounded text-[#141D17] accent-[#141D17] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#141D17]/8 bg-white/70 flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] transition-colors cursor-pointer shadow-xs border border-[#141D17]/10"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
