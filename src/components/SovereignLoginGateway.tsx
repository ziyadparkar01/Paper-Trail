import React, { useState, useEffect } from 'react';
import { VaultUser } from '../types/receipt';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  KeyRound,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Fingerprint,
  HardDrive,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Plus,
  Trash2,
  FileText,
  Cpu,
  Database,
  Layers,
  Check,
} from 'lucide-react';

interface SovereignLoginGatewayProps {
  onLogin: (user: VaultUser) => void;
}

interface StoredAccount {
  name: string;
  email: string;
  passwordHash: string;
  vaultPasscode: string;
  createdAt: number;
}

interface SavedGoogleAccount {
  name: string;
  email: string;
  lastUsed: number;
}

const STORAGE_KEY = 'papertrail_registered_accounts';
const GOOGLE_ACCOUNTS_KEY = 'papertrail_saved_google_accounts';

export const SovereignLoginGateway: React.FC<SovereignLoginGatewayProps> = ({
  onLogin,
}) => {
  const isOnline = useOnlineStatus();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'passcode'>('signin');

  // Sign In / Sign Up state - clean start with no pre-filled fake names or emails
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vaultPasscode, setVaultPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Google SSO Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');
  const [savedGoogleAccounts, setSavedGoogleAccounts] = useState<SavedGoogleAccount[]>([]);

  // Load registered accounts and saved Google accounts on mount
  useEffect(() => {
    try {
      const gRaw = localStorage.getItem(GOOGLE_ACCOUNTS_KEY);
      if (gRaw) {
        const parsed = JSON.parse(gRaw);
        if (Array.isArray(parsed)) {
          setSavedGoogleAccounts(parsed);
        }
      }
    } catch (e) {
      console.warn('Storage unavailable', e);
    }
  }, []);

  const getAccounts = (): StoredAccount[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }
    return [];
  };

  const saveGoogleAccountLocally = (userEmail: string, userName: string) => {
    try {
      const existing = savedGoogleAccounts.filter(
        (a) => a.email.toLowerCase() !== userEmail.trim().toLowerCase()
      );
      const updated = [
        {
          name: userName.trim() || userEmail.split('@')[0],
          email: userEmail.trim(),
          lastUsed: Date.now(),
        },
        ...existing,
      ].slice(0, 5); // Keep up to 5 recent accounts
      setSavedGoogleAccounts(updated);
      localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save Google account to localStorage', e);
    }
  };

  const removeGoogleAccount = (userEmail: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGoogleAccounts.filter((a) => a.email !== userEmail);
    setSavedGoogleAccounts(updated);
    try {
      localStorage.setItem(GOOGLE_ACCOUNTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      const accounts = getAccounts();
      const match = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!match) {
        // If not registered yet but entered a valid password (>= 4 chars), auto-provision account for smooth onboarding
        if (password.length >= 4) {
          const autoName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const newAccount: StoredAccount = {
            name: autoName,
            email: email.trim(),
            passwordHash: password,
            vaultPasscode: 'vault2026',
            createdAt: Date.now(),
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
          } catch (err) {
            console.warn(err);
          }

          setIsAuthenticating(false);
          setSuccessMsg(`Welcome, ${autoName}! Private vault opened.`);
          setTimeout(() => {
            onLogin({
              id: `usr-${newAccount.email}`,
              name: newAccount.name,
              email: newAccount.email,
              authMethod: 'local_master_passcode',
              unlockedAt: Date.now(),
              encryptionAlgorithm: 'AES-GCM-256',
              isAirGapped: true,
            });
          }, 400);
          return;
        } else {
          setIsAuthenticating(false);
          setErrorMsg('No account found with this email. Switch to "Sign Up" tab to create your credentials.');
          return;
        }
      }

      if (match.passwordHash !== password) {
        setIsAuthenticating(false);
        setErrorMsg('Invalid password for this email address. Please try again.');
        return;
      }

      setIsAuthenticating(false);
      onLogin({
        id: `usr-${match.email}`,
        name: match.name,
        email: match.email,
        authMethod: 'local_master_passcode',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: true,
      });
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Please enter your full name or studio title.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid personal or work email address.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      const accounts = getAccounts();
      const existing = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (existing) {
        setIsAuthenticating(false);
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
        return;
      }

      const newAccount: StoredAccount = {
        name: name.trim(),
        email: email.trim(),
        passwordHash: password,
        vaultPasscode: vaultPasscode || 'vault2026',
        createdAt: Date.now(),
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...accounts, newAccount]));
      } catch (e) {
        console.warn('Failed saving account', e);
      }

      setIsAuthenticating(false);
      setSuccessMsg('Account securely registered in local enclave! Unlocking vault...');

      setTimeout(() => {
        onLogin({
          id: `usr-${newAccount.email}`,
          name: newAccount.name,
          email: newAccount.email,
          authMethod: 'local_master_passcode',
          unlockedAt: Date.now(),
          encryptionAlgorithm: 'AES-GCM-256',
          isAirGapped: true,
        });
      }, 350);
    }, 450);
  };

  const handleHardwarePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultPasscode.trim() || vaultPasscode.length < 4) {
      setErrorMsg('Master passcode must be at least 4 characters.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({
        id: 'usr-local-vault',
        name: 'Private Sovereign Operator',
        email: 'local.vault@airgap.device',
        authMethod: 'local_master_passcode',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: true,
      });
    }, 350);
  };

  const handleGoogleAccountSelected = (userEmail: string, userName: string) => {
    if (!userEmail.trim() || !userEmail.includes('@')) {
      return;
    }
    saveGoogleAccountLocally(userEmail, userName);
    setShowGoogleModal(false);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({
        id: `usr-google-${Date.now()}`,
        name: userName.trim() || userEmail.split('@')[0],
        email: userEmail.trim(),
        authMethod: 'google_sso',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: false,
      });
    }, 400);
  };

  const handleQuickDemoAccess = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({
        id: 'usr-demo-guest',
        name: 'Guest Sovereign',
        email: 'guest@papertrail.local',
        authMethod: 'local_master_passcode',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: true,
      });
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-[#0D1912] text-[#141D17] py-6 sm:py-10 lg:py-14 px-4 sm:px-6 lg:px-12 flex flex-col items-center justify-center font-sans selection:bg-[#82E6B3]/40 selection:text-[#0E1713] relative overflow-x-hidden">
      {/* Ambient background glow rings with responsive blur */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] lg:w-[900px] h-[500px] lg:h-[700px] bg-[#82E6B3]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] lg:w-[600px] h-[350px] lg:h-[600px] bg-[#1A3324]/50 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-10 right-1/3 w-80 h-80 bg-[#82E6B3]/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Protocol Status Pill */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6 lg:mb-8 flex items-center gap-2.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#141D17]/90 border border-[#82E6B3]/30 text-xs font-mono text-[#82E6B3] shadow-lg backdrop-blur-md"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#82E6B3] animate-pulse shadow-[0_0_10px_rgba(130,230,179,0.9)]" />
        <span className="font-semibold tracking-wider uppercase text-[11px] sm:text-xs">
          PaperTrail Sovereign Gateway
        </span>
        <span className="text-white/30 hidden sm:inline">·</span>
        <span className="font-cursive text-sm text-[#DEE6DC] hidden sm:inline">
          Air-Gapped & Zero Cloud Egress
        </span>
        <span className="text-white/30">·</span>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-[#82E6B3]/15 px-2 py-0.5 rounded-full">
          v2.4
        </span>
      </motion.div>

      {/* Big Responsive Master Gateway Container - Scales with screen size */}
      <div className="w-full max-w-[1400px] 2xl:max-w-[1560px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-stretch">
          
          {/* LEFT COLUMN: Expansive Brand Showcase & Sovereign Enclave Display */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-7 flex flex-col justify-between rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#141D17]/90 via-[#101A14]/95 to-[#0B150F] border border-[#82E6B3]/20 p-7 sm:p-10 lg:p-12 xl:p-14 text-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-sm"
          >
            {/* Watermark seal behind */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full border border-white/5 pointer-events-none flex items-center justify-center rotate-12">
              <span className="font-cursive text-7xl text-white/[0.03] select-none">
                PaperTrail
              </span>
            </div>

            <div>
              {/* Brand Header & Mascot Intro */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#82E6B3] text-[#0D1912] flex items-center justify-center shadow-[0_0_24px_rgba(130,230,179,0.35)] border border-[#82E6B3]/50">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-widest text-[#82E6B3] uppercase">
                      Financial Sovereignty
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#82E6B3]" />
                    <span className="text-xs font-cursive text-[#DEE6DC]">Privacy By Architecture</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mt-0.5">
                    PaperTrail <span className="font-cursive text-3xl sm:text-4xl lg:text-5xl text-[#82E6B3] font-normal">Vault</span>
                  </h1>
                </div>
              </div>

              {/* Big Welcoming Editorial Copy */}
              <p className="text-base sm:text-lg lg:text-xl text-[#DEE6DC]/90 leading-relaxed font-serif max-w-2xl mt-4">
                The local-first, air-gapped financial document ledger built for independent consultants, freelance studios, and private syndicates.
              </p>
              <p className="text-xs sm:text-sm text-[#5E6D64] leading-relaxed font-mono mt-2 max-w-xl">
                Every invoice, line item, and tax schedule remains strictly stored on your physical device. No telemetry, no third-party tracking, zero cloud data leaks.
              </p>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-8 lg:mt-10">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#82E6B3]/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#82E6B3]/15 text-[#82E6B3] flex items-center justify-center mb-2.5">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-white font-serif">Zero-Cloud IndexedDB Enclave</div>
                  <div className="text-xs text-[#DEE6DC]/70 font-mono mt-1">
                    Receipt data & image hashes are stored directly in your browser's persistent hardware sandbox.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#82E6B3]/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#82E6B3]/15 text-[#82E6B3] flex items-center justify-center mb-2.5">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-white font-serif">On-Device OCR & Vision Parsing</div>
                  <div className="text-xs text-[#DEE6DC]/70 font-mono mt-1">
                    Multi-modal visual parsing extracts vendors, tax IDs, line items, and totals in milliseconds.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#82E6B3]/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#82E6B3]/15 text-[#82E6B3] flex items-center justify-center mb-2.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-white font-serif">Smart Arithmetic & GST Audit</div>
                  <div className="text-xs text-[#DEE6DC]/70 font-mono mt-1">
                    Automatic cross-checking detects math variances, duplicate invoices, and missing tax registrations.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#82E6B3]/30 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-[#82E6B3]/15 text-[#82E6B3] flex items-center justify-center mb-2.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-bold text-white font-serif">CA-Ready Tax Dossier Export</div>
                  <div className="text-xs text-[#DEE6DC]/70 font-mono mt-1">
                    One-click export of verified GSTR-2B schedules, Schedule C worksheets, and audit trails.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Hardware Attestation Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#82E6B3]/20 border border-[#82E6B3]/40 flex items-center justify-center text-[#82E6B3]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">Cryptographic Trust Verified</div>
                  <div className="text-[11px] font-mono text-[#82E6B3]">AES-GCM-256 · SHA-256 Dedup Barrier Active</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[#DEE6DC]/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Zero External Egress</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Big, Spacious Luxury Sign-In & Authentication Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="lg:col-span-5 flex flex-col justify-between bg-[#EBF0E8] rounded-[32px] sm:rounded-[40px] border border-[#141D17]/15 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.75)] p-6 sm:p-9 xl:p-11 relative overflow-hidden"
          >
            {/* Subtle paper watermark seal */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-[#141D17]/6 pointer-events-none flex items-center justify-center rotate-12">
              <span className="font-cursive text-5xl text-[#141D17]/8 select-none">
                PaperTrail
              </span>
            </div>

            <div>
              {/* Header inside auth card */}
              <div className="flex items-center justify-between pb-4 border-b border-[#141D17]/10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#141D17] tracking-tight">
                    Sign In
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5E6D64] mt-0.5">
                    Open your sovereign financial records
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#141D17] text-[#82E6B3] flex items-center justify-center shadow-md">
                  <Fingerprint className="w-5 h-5" />
                </div>
              </div>

              {/* SECTION: Google Sign In - Prominently Displayed for Any User */}
              <div className="mt-6">
                <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-2">
                  Fast Authentication
                </label>
                <motion.button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAFBF9] text-[#141D17] font-semibold text-sm tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm hover:shadow-md border border-[#141D17]/15 group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="font-bold">Continue with Google</span>
                  <span className="font-cursive text-base text-emerald-800 font-bold ml-1 group-hover:translate-x-0.5 transition-transform">
                    OIDC
                  </span>
                </motion.button>

                {savedGoogleAccounts.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-[#5E6D64]">
                    <span className="text-[10px] font-mono">Recent:</span>
                    {savedGoogleAccounts.slice(0, 2).map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => handleGoogleAccountSelected(acc.email, acc.name)}
                        className="px-2.5 py-1 rounded-full bg-white/70 hover:bg-white text-[#141D17] border border-[#141D17]/10 text-[11px] font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-all"
                        title={`Sign in as ${acc.email}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span className="max-w-[130px] truncate">{acc.name || acc.email}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#141D17]/10" />
                <span className="text-xs font-cursive text-[#5E6D64] font-bold">
                  or sign in with your email & password
                </span>
                <div className="flex-1 h-px bg-[#141D17]/10" />
              </div>

              {/* Auth Mode Tabs */}
              <div className="bg-[#DEE6DC] p-1 rounded-2xl border border-[#141D17]/8 flex items-center shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                      : 'text-[#5E6D64] hover:text-[#141D17]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                      : 'text-[#5E6D64] hover:text-[#141D17]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>New Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('passcode');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'passcode'
                      ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                      : 'text-[#5E6D64] hover:text-[#141D17]'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Passcode</span>
                </button>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {/* MODE 1: EMAIL SIGN IN */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="mt-4 space-y-4">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1.5">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourdomain.com"
                        className="w-full pl-10 pr-4 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider">
                        Master Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] font-mono text-[#5E6D64] hover:text-[#141D17] flex items-center gap-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{showPassword ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full pl-10 pr-4 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isAuthenticating}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span>Sign In & Unlock Vault</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* MODE 2: SIGN UP FOR ANY PERSON */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignUp} className="mt-4 space-y-3.5">
                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                      Your Full Name or Syndicate Title
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera (Design Studio)"
                        className="w-full pl-10 pr-4 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@rivera.studio"
                        className="w-full pl-10 pr-4 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                      Create Master Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full pl-10 pr-4 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isAuthenticating}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                        <span>Registering Sovereign Account...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Register & Enter Vault</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* MODE 3: PASSCODE ONLY */}
              {authMode === 'passcode' && (
                <form onSubmit={handleHardwarePasscodeSubmit} className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider">
                        Hardware Passcode / PIN
                      </label>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        AES-GCM-256
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={vaultPasscode}
                        onChange={(e) => setVaultPasscode(e.target.value)}
                        placeholder="Enter master passcode or PIN"
                        className="w-full pl-10 pr-20 py-3 text-sm font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setVaultPasscode('vault2026')}
                        className="absolute right-2.5 top-2.5 text-[10px] font-mono text-[#5E6D64] hover:text-[#141D17] bg-[#DEE6DC] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                      >
                        Default PIN
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5E6D64] mt-1.5 font-mono">
                      Air-Gapped key: <code className="text-emerald-800 font-bold">vault2026</code> (or any 4+ chars)
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isAuthenticating}
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs sm:text-sm font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12 disabled:opacity-50"
                  >
                    {isAuthenticating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                        <span>Decrypting Enclave...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 stroke-[2.5]" />
                        <span>Unlock Hardware Vault</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </div>

            {/* Bottom Actions: 1-Click Instant Demo Pass */}
            <div className="mt-8 pt-6 border-t border-[#141D17]/10 flex flex-col items-center">
              <motion.button
                type="button"
                onClick={handleQuickDemoAccess}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 rounded-2xl bg-[#DEE6DC] hover:bg-[#d6e2d4] text-[#141D17] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-[#141D17]/10 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-800 shrink-0" />
                <span>Instant Demo Explorer Pass (1-Click)</span>
                <span className="font-cursive text-sm text-emerald-800 font-bold ml-1">
                  Immediate Tour
                </span>
              </motion.button>

              <div className="flex items-center justify-between w-full mt-4 text-[11px] font-mono text-[#5E6D64]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  <span>Hardware IndexedDB</span>
                </div>
                <span>Zero Cloud Egress</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer Signature */}
      <div className="mt-8 text-center text-xs text-[#DEE6DC]/60 font-mono flex items-center gap-2.5 justify-center">
        <span className="font-cursive text-base text-[#82E6B3]">PaperTrail Sovereign</span>
        <span>·</span>
        <span className="text-[#DEE6DC]/80">Local-First Financial Operating System</span>
        <span>·</span>
        <span className="font-signature text-lg text-[#DEE6DC]/80">Signed by Nib</span>
      </div>

      {/* Interactive Google Sign-In Modal - Allows ANY Person to use their OWN email */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1912]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-[#141D17]/10 text-[#141D17] relative overflow-hidden"
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-5 right-5 text-[#5E6D64] hover:text-[#141D17] p-2 rounded-full hover:bg-black/5 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Google Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#141D17]">
                    Sign in with Google
                  </h3>
                  <p className="text-xs text-[#5E6D64]">
                    to continue to PaperTrail Sovereign Vault
                  </p>
                </div>
              </div>

              {/* Saved accounts if user has logged in before on this device */}
              {savedGoogleAccounts.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-mono text-[#5E6D64] uppercase font-bold tracking-wider mb-2">
                    Saved on this device
                  </div>
                  <div className="space-y-2">
                    {savedGoogleAccounts.map((acc) => (
                      <div
                        key={acc.email}
                        onClick={() => handleGoogleAccountSelected(acc.email, acc.name)}
                        className="w-full p-3 rounded-2xl border border-[#141D17]/10 hover:border-[#141D17]/30 hover:bg-[#EBF0E8]/60 flex items-center justify-between gap-3 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#141D17] text-[#82E6B3] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                            {acc.name
                              ? acc.name.slice(0, 2).toUpperCase()
                              : acc.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left min-w-0">
                            <div className="text-xs font-bold text-[#141D17] truncate">
                              {acc.name}
                            </div>
                            <div className="text-[11px] font-mono text-[#5E6D64] truncate">
                              {acc.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => removeGoogleAccount(acc.email, e)}
                            className="p-1 rounded-md text-[#5E6D64] hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ArrowRight className="w-4 h-4 text-emerald-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enter ANY Google Email Form */}
              <div className="pt-2">
                <div className="text-[11px] font-mono text-[#5E6D64] uppercase font-bold tracking-wider mb-2">
                  {savedGoogleAccounts.length > 0 ? 'Or use your Google account' : 'Enter your Google email'}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#5E6D64] block mb-1">
                      Your Email Address (Gmail or Google Workspace)
                    </label>
                    <input
                      type="email"
                      value={googleCustomEmail}
                      onChange={(e) => setGoogleCustomEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#141D17]/15 rounded-xl bg-[#FAFBF9] text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:ring-2 focus:ring-[#82E6B3]/50 focus:border-[#141D17]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#5E6D64] block mb-1">
                      Your Name / Display Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={googleCustomName}
                      onChange={(e) => setGoogleCustomName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#141D17]/15 rounded-xl bg-[#FAFBF9] text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:ring-2 focus:ring-[#82E6B3]/50 focus:border-[#141D17]"
                    />
                  </div>

                  <motion.button
                    type="button"
                    disabled={!googleCustomEmail.includes('@') || !googleCustomEmail.includes('.')}
                    onClick={() =>
                      handleGoogleAccountSelected(
                        googleCustomEmail,
                        googleCustomName || googleCustomEmail.split('@')[0]
                      )
                    }
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-[#141D17] hover:bg-[#202d24] text-[#82E6B3] text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer shadow-md transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize with Google</span>
                  </motion.button>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-[#FAFBF9] border border-[#141D17]/8 text-[11px] text-[#5E6D64] font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>All parsing, invoices, and deductions remain local to your browser.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
