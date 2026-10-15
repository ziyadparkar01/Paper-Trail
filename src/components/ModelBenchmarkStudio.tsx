import React, { useState } from 'react';
import { OpenWeightModelInfo, EngineConfig } from '../types/receipt';
import { motion } from 'motion/react';
import { Cpu, CheckCircle2, Shield, Zap, DollarSign, Terminal, Layers, Play } from 'lucide-react';

const OPEN_MODELS: OpenWeightModelInfo[] = [
  {
    id: 'llama-3.2-2b-vision',
    name: 'Llama 3.2 Vision (2B)',
    creator: 'Meta Open Innovation',
    paramSize: '2.0 Billion',
    vramRequired: '1.8 GB (Runs on M1/M2/M3 Air)',
    inferenceSpeed: '~280 ms / receipt',
    costPer1kReceipts: '$0.00 (Self-Hosted)',
    privacyRating: 'A+ (100% Offline Hardware)',
    description: 'Ultra-lightweight open-weight multimodal model. Extracts vendor names, line items, and totals with zero external network connectivity.',
    isRecommended: true,
  },
  {
    id: 'qwen-2.5-vl-3b',
    name: 'Qwen 2.5 VL (3B)',
    creator: 'Alibaba Research (Apache 2.0)',
    paramSize: '3.1 Billion',
    vramRequired: '2.4 GB',
    inferenceSpeed: '~340 ms / receipt',
    costPer1kReceipts: '$0.00 (Self-Hosted)',
    privacyRating: 'A+ (100% Offline Hardware)',
    description: 'Exceptional visual layout grounding for complex tabular invoices, thermal receipts, and GSTIN/HSN tax code extractions.',
  },
  {
    id: 'deepseek-vl2-tiny',
    name: 'DeepSeek VL2 (Tiny)',
    creator: 'DeepSeek AI (Open-Weight)',
    paramSize: '1.3 Billion',
    vramRequired: '1.2 GB',
    inferenceSpeed: '~190 ms / receipt',
    costPer1kReceipts: '$0.00 (Self-Hosted)',
    privacyRating: 'A+ (100% Offline Hardware)',
    description: 'Blazing-fast edge model designed for low-power laptops and battery-efficient background document batching.',
  },
  {
    id: 'browser-wasm-neural',
    name: 'In-Browser Neural Wasm',
    creator: 'PaperTrail Web Runtime',
    paramSize: 'Heuristic Tokenizer',
    vramRequired: 'Zero GPU Required (Client Memory)',
    inferenceSpeed: '~45 ms / receipt',
    costPer1kReceipts: '$0.00 (Zero Install)',
    privacyRating: 'A+ (In-Memory Canvas Sandboxed)',
    description: 'Zero terminal installation. Runs right inside the browser sandbox using WebCrypto SHA-256 and regex syntax trees.',
  },
];

interface ModelBenchmarkStudioProps {
  config: EngineConfig;
  onSelectModel: (modelId: string) => void;
}

export const ModelBenchmarkStudio: React.FC<ModelBenchmarkStudioProps> = ({
  config,
  onSelectModel,
}) => {
  const [testPrompt, setTestPrompt] = useState(
    'Extract JSON schema: { vendor, date, gstin, items: [{name, qty, price, total}], subtotal, tax, grand_total }'
  );
  const [simulatedInferenceResult, setSimulatedInferenceResult] = useState<string | null>(null);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const selectedModel =
    OPEN_MODELS.find((m) => m.id === config.selectedOpenWeightModel) || OPEN_MODELS[0];

  const handleRunInferenceTest = () => {
    setIsRunningSim(true);
    setSimulatedInferenceResult(null);
    setTimeout(() => {
      setIsRunningSim(false);
      setSimulatedInferenceResult(
        JSON.stringify(
          {
            engine: selectedModel.name,
            inference_time_ms: Math.floor(180 + Math.random() * 120),
            vram_used: selectedModel.vramRequired,
            extracted_vendor: 'WeWork India Management Pvt Ltd',
            gstin: '29AABCS1429B1Z5',
            status: 'verified_mathematically',
            privacy_egress: '0 bytes transferred over internet',
          },
          null,
          2
        )
      );
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Studio Header */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#82E6B3] text-[#0E1713] uppercase">
            Open Inference Infrastructure
          </span>
          <span className="text-[#141D17]/20">·</span>
          <span className="text-xs font-mono font-medium text-[#5E6D64]">
            Open-Weight Model Benchmark
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141D17] tracking-tight mt-1">
          Deterministic Vision Models Running On-Device
        </h2>
        <p className="text-xs text-[#5E6D64] mt-1 max-w-2xl leading-relaxed">
          Running inference locally eliminates variable cloud API overhead ($150 per 10,000 documents) while providing mathematical guarantee that private client records never leave hardware.
        </p>

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {OPEN_MODELS.map((model) => {
            const isSelected = model.id === config.selectedOpenWeightModel;

            return (
              <motion.div
                key={model.id}
                whileHover={{ y: -2 }}
                onClick={() => onSelectModel(model.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#141D17] bg-white shadow-md ring-1 ring-[#141D17]/10'
                    : 'border-[#141D17]/8 hover:border-[#141D17]/20 bg-[#DEE6DC]/40 hover:bg-[#DEE6DC]/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-serif font-bold text-[#141D17]">
                          {model.name}
                        </h4>
                        {model.isRecommended && (
                          <span className="text-[9px] font-bold bg-[#82E6B3] text-[#0E1713] px-2 py-0.5 rounded-full font-mono">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5E6D64] font-mono">
                        {model.creator}
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#141D17] border-[#141D17] text-[#82E6B3]'
                          : 'border-[#141D17]/15 bg-white'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <p className="text-xs text-[#5E6D64] mt-2 leading-relaxed">
                    {model.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#141D17]/8 font-mono text-[11px]">
                    <div>
                      <span className="text-[#5E6D64] text-[10px] block">Hardware Footprint:</span>
                      <span className="font-semibold text-[#141D17]">{model.vramRequired}</span>
                    </div>
                    <div>
                      <span className="text-[#5E6D64] text-[10px] block">Inference Latency:</span>
                      <span className="font-semibold text-[#141D17]">{model.inferenceSpeed}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#141D17]/8 flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-800 font-bold">
                    {model.costPer1kReceipts}
                  </span>
                  <span className="text-[#5E6D64] font-mono text-[11px]">
                    {model.privacyRating}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-lg font-serif font-bold text-[#141D17] tracking-tight">
          Open-Weight Local AI vs. Closed Cloud APIs
        </h3>

        <div className="overflow-x-auto border border-[#141D17]/8 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#EBF0E8] text-[#5E6D64] uppercase tracking-wider text-[10px] border-b border-[#141D17]/8">
              <tr>
                <th className="py-2.5 px-3.5">Metric</th>
                <th className="py-2.5 px-3.5 bg-[#82E6B3]/25 text-[#0E1713] font-bold">
                  PaperTrail (Open-Weight Local)
                </th>
                <th className="py-2.5 px-3.5">AWS Textract</th>
                <th className="py-2.5 px-3.5">Google Cloud Document AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141D17]/6">
              <tr>
                <td className="py-2.5 px-3.5 text-[#141D17] font-semibold">Cost per 5,000 Receipts</td>
                <td className="py-2.5 px-3.5 font-bold text-emerald-800 bg-[#82E6B3]/15">$0.00 (Self-Hosted)</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">$75.00</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">$75.00</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 text-[#141D17] font-semibold">Data Transfer Egress</td>
                <td className="py-2.5 px-3.5 font-bold text-emerald-800 bg-[#82E6B3]/15">0 Bytes (Local Memory)</td>
                <td className="py-2.5 px-3.5 text-rose-700">Full Cloud Upload</td>
                <td className="py-2.5 px-3.5 text-rose-700">Full Cloud Upload</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 text-[#141D17] font-semibold">Offline / Airplane Mode</td>
                <td className="py-2.5 px-3.5 font-bold text-emerald-800 bg-[#82E6B3]/15">100% Operational</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">Fails (No Internet)</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">Fails (No Internet)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 text-[#141D17] font-semibold">Regulatory Compliance</td>
                <td className="py-2.5 px-3.5 font-bold text-emerald-800 bg-[#82E6B3]/15">Absolute Data Sovereignty</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">Third-Party Cloud DPA</td>
                <td className="py-2.5 px-3.5 text-[#5E6D64]">Third-Party Cloud DPA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Extraction Tester */}
      <div className="bg-white/85 border border-[#141D17]/8 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#141D17]">
              Verify Local Model Token Pipeline
            </h3>
            <p className="text-xs text-[#5E6D64] mt-0.5">
              Simulate schema extraction on active engine: <span className="text-emerald-800 font-mono font-bold">{selectedModel.name}</span>
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleRunInferenceTest}
            disabled={isRunningSim}
            className="px-4 py-2 text-xs font-mono font-semibold rounded-full bg-[#82E6B3] hover:bg-[#72dca5] text-[#0E1713] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isRunningSim ? (
              <div className="w-3.5 h-3.5 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Local Inference Test</span>
          </motion.button>
        </div>

        <div>
          <label className="block text-[10px] font-mono text-[#5E6D64] uppercase mb-1">
            Extraction Directive / System Prompt:
          </label>
          <input
            type="text"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            className="w-full text-xs font-mono px-3.5 py-2.5 bg-[#EBF0E8] border border-[#141D17]/10 text-[#141D17] rounded-xl focus:ring-1 focus:ring-[#141D17] focus:outline-hidden"
          />
        </div>

        {simulatedInferenceResult && (
          <div className="p-4 bg-[#141D17] text-[#82E6B3] rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-[#141D17]">
            <pre>
              <code>{simulatedInferenceResult}</code>
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
};
