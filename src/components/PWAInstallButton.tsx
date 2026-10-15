import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Monitor, Share2, X, CheckCircle } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-emerald-800 bg-[#DEE6DC] px-2.5 py-1 rounded-full border border-emerald-300">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
        <span className="font-semibold">Installed App</span>
      </div>
    );
  }

  // Chromium / Edge / Android install flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="px-3 py-1.5 text-xs font-mono font-medium rounded-full bg-white/70 hover:bg-white text-[#141D17] transition-colors flex items-center gap-1.5 cursor-pointer border border-[#141D17]/10 shadow-2xs"
        title="Install PaperTrail as an offline desktop application"
      >
        <Monitor className="w-3.5 h-3.5 text-emerald-700" />
        <span>Install Desktop</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded-full bg-white/70 hover:bg-white text-[#141D17] transition-colors flex items-center gap-1.5 cursor-pointer border border-[#141D17]/10 shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1912]/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-[24px] bg-[#EBF0E8] p-6 shadow-2xl border border-[#141D17]/10 text-[#141D17]">
              <div className="flex items-center justify-between pb-2 border-b border-[#141D17]/10">
                <h3 className="text-sm font-bold text-[#141D17] font-serif">
                  Install PaperTrail on iOS
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-[#5E6D64] hover:text-[#141D17] p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-[#5E6D64] leading-relaxed font-sans">
                1. Tap the <strong>Share</strong> button in the Safari toolbar.<br />
                2. Scroll down and tap <strong>Add to Home Screen</strong>.<br />
                3. Open PaperTrail anytime with full offline cache support.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-full bg-[#82E6B3] py-2 text-xs font-mono font-bold text-[#0E1713] hover:bg-[#72dca5] cursor-pointer shadow-xs border border-[#141D17]/10"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={() => {
        alert('To install PaperTrail, open your browser menu (⋮ or ...) and click "Install PaperTrail" or "Add to Desktop".');
      }}
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-full border border-[#141D17]/10 bg-white/70 hover:bg-white text-[#141D17] transition-colors cursor-pointer shadow-2xs"
      title="PaperTrail is PWA compliant and installable on macOS, Windows, Linux, Android, and iOS"
    >
      <Monitor className="w-3.5 h-3.5 text-[#5E6D64]" />
      <span>Install App</span>
    </button>
  );
};
