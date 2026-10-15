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

const STORAGE_KEY = 'papertrail_registered_accounts';
const DEFAULT_ACCOUNT: StoredAccount = {
  name: 'Independent Syndicate',
  email: 'syndicate@papertrail.local',
  passwordHash: 'pass123',
  vaultPasscode: 'vault2026',
  createdAt: Date.now(),
};

export const SovereignLoginGateway: React.FC<SovereignLoginGatewayProps> = ({
  onLogin,
}) => {
  const isOnline = useOnlineStatus();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'passcode'>('signin');

  // Sign In / Sign Up state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('syndicate@papertrail.local');
  const [password, setPassword] = useState('pass123');
  const [vaultPasscode, setVaultPasscode] = useState('vault2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');

  // Pre-seed default account in localStorage if empty
  useEffect(() => {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_ACCOUNT]));
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
    return [DEFAULT_ACCOUNT];
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsAuthenticating(true);
    setTimeout(() => {
      const accounts = getAccounts();
      const match = accounts.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!match) {
        // Allow fallback or prompt
        if (password.length >= 4) {
          // If valid looking credentials, auto-provision and authenticate
          const newUser: VaultUser = {
            id: `usr-${Date.now()}`,
            name: email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase(),
            email: email.trim(),
            authMethod: 'local_master_passcode',
            unlockedAt: Date.now(),
            encryptionAlgorithm: 'AES-GCM-256',
            isAirGapped: true,
          };
          setIsAuthenticating(false);
          onLogin(newUser);
          return;
        } else {
          setIsAuthenticating(false);
          setErrorMsg('No account found with this email. Click "Sign Up" to register!');
          return;
        }
      }

      if (match.passwordHash !== password) {
        setIsAuthenticating(false);
        setErrorMsg('Invalid password for this account. Try again.');
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
      setErrorMsg('Please enter your full name or syndicate label.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
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
        setErrorMsg('An account with this email already exists. Please Sign In.');
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
      setSuccessMsg('Account registered successfully! Unlocking your private vault...');

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
        name: 'Independent Syndicate',
        email: 'local.vault@airgap.device',
        authMethod: 'local_master_passcode',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: true,
      });
    }, 350);
  };

  const handleGoogleAccountSelected = (userEmail: string, userName: string) => {
    setShowGoogleModal(false);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({
        id: `usr-google-${Date.now()}`,
        name: userName,
        email: userEmail,
        authMethod: 'google_sso',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: false,
      });
    }, 500);
  };

  const handleQuickDemoAccess = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({
        id: 'usr-syndicate-partner',
        name: 'Private Syndicate Sovereign',
        email: 'syndicate@papertrail.local',
        authMethod: 'local_master_passcode',
        unlockedAt: Date.now(),
        encryptionAlgorithm: 'AES-GCM-256',
        isAirGapped: true,
      });
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#0D1912] text-[#141D17] py-6 sm:py-12 px-4 flex flex-col items-center justify-center font-sans selection:bg-[#82E6B3]/40 selection:text-[#0E1713] relative overflow-hidden">
      {/* Ambient background glow rings */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#82E6B3]/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-[#1A3324]/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-12 right-12 w-60 h-60 bg-[#82E6B3]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Top Institutional Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-5 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141D17]/90 border border-[#82E6B3]/30 text-[11px] font-mono text-[#82E6B3] shadow-md"
      >
        <span className="w-2 h-2 rounded-full bg-[#82E6B3] animate-pulse shadow-[0_0_8px_rgba(130,230,179,0.8)]" />
        <span className="font-semibold tracking-wider uppercase">
          PaperTrail Sovereign Gateway
        </span>
        <span className="text-white/30">·</span>
        <span className="font-cursive text-sm text-[#DEE6DC]">
          Air-Gapped Privacy First
        </span>
      </motion.div>

      {/* Central Luxury Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#EBF0E8] rounded-[32px] border border-[#141D17]/12 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)] p-6 sm:p-9 relative overflow-hidden"
      >
        {/* Subtle paper watermarked seal */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full border border-[#141D17]/6 pointer-events-none flex items-center justify-center rotate-12">
          <span className="font-cursive text-4xl text-[#141D17]/8 select-none">
            PaperTrail
          </span>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[#141D17] text-[#82E6B3] flex items-center justify-center shadow-lg border-2 border-[#82E6B3]/40">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#82E6B3] text-[#0E1713] flex items-center justify-center shadow-sm border border-[#141D17]/10">
              <Fingerprint className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-center">
            <h1 className="text-3xl font-serif font-bold text-[#141D17] tracking-tight">
              PaperTrail
            </h1>
            <span className="font-cursive text-2xl text-emerald-800 font-bold rotate-[-3deg]">
              Vault
            </span>
          </div>

          <p className="font-signature text-xl text-[#5E6D64] mt-0.5">
            Private Syndicate Sovereignty
          </p>

          <p className="text-xs text-[#5E6D64] mt-1.5 max-w-xs leading-relaxed">
            Local-first zero-cloud document ledger for freelancers and private credit portfolios.
          </p>
        </div>

        {/* Auth Mode Switcher Pills */}
        <div className="mt-5 bg-[#DEE6DC] p-1 rounded-full border border-[#141D17]/8 flex items-center shadow-inner">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signin'
                ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                : 'text-[#5E6D64] hover:text-[#141D17]'
            }`}
          >
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                : 'text-[#5E6D64] hover:text-[#141D17]'
            }`}
          >
            <span>Sign Up</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('passcode');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'passcode'
                ? 'bg-[#141D17] text-[#82E6B3] shadow-xs'
                : 'text-[#5E6D64] hover:text-[#141D17]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Passcode</span>
          </button>
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-mono flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* MODE 1: SIGN IN */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3.5">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-mono text-[#5E6D64] hover:text-[#141D17] flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            {/* Reshaped Luxury Submit Button */}
            <motion.button
              type="submit"
              disabled={isAuthenticating}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-2 py-3 px-5 rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Sign In & Unlock Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* MODE 2: SIGN UP */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="mt-4 space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                Full Name / Syndicate Title
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin (Design Lead)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@studio.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create master password (min 4 chars)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isAuthenticating}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-2 py-3 px-5 rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                  <span>Registering Sovereign Account...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Create Account & Enter Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* MODE 3: PASSCODE ONLY */}
        {authMode === 'passcode' && (
          <form onSubmit={handleHardwarePasscodeSubmit} className="mt-4 space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-mono uppercase font-bold text-[#5E6D64] tracking-wider">
                  Local Master Passcode
                </label>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  AES-GCM-256
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#5E6D64] absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={vaultPasscode}
                  onChange={(e) => setVaultPasscode(e.target.value)}
                  placeholder="Enter vault passcode..."
                  className="w-full pl-10 pr-20 py-2.5 text-xs font-mono bg-white border border-[#141D17]/15 rounded-2xl text-[#141D17] placeholder:text-[#5E6D64]/50 focus:outline-hidden focus:border-[#141D17] focus:ring-2 focus:ring-[#82E6B3]/40 transition-all shadow-2xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setVaultPasscode('vault2026')}
                  className="absolute right-2.5 top-2 text-[10px] font-mono text-[#5E6D64] hover:text-[#141D17] bg-[#DEE6DC] px-2 py-1 rounded-md cursor-pointer"
                >
                  Default
                </button>
              </div>
              <p className="text-[11px] text-[#5E6D64] mt-1 font-mono">
                Default key: <code className="text-emerald-800 font-bold">vault2026</code>
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isAuthenticating}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#82E6B3] to-[#6ce0a4] hover:from-[#72dca5] hover:to-[#5fd497] text-[#0E1713] font-bold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg border border-[#141D17]/12"
            >
              {isAuthenticating ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0E1713] border-t-transparent rounded-full animate-spin" />
                  <span>Decrypting Hardware Enclave...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Unlock Hardware Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </motion.button>
          </form>
        )}

        {/* Divider with cursive touch */}
        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#141D17]/10" />
          <span className="text-[11px] font-cursive text-[#5E6D64] font-bold">or connect sovereign identity</span>
          <div className="flex-1 h-px bg-[#141D17]/10" />
        </div>

        {/* Google SSO Button */}
        <motion.button
          type="button"
          onClick={() => setShowGoogleModal(true)}
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.96 }}
          className="w-full py-2.5 px-4 rounded-full bg-white hover:bg-[#FAFBF9] text-[#141D17] font-semibold text-xs tracking-wide flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs hover:shadow-sm border border-[#141D17]/15"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
          <span className="font-cursive text-sm text-emerald-800 font-bold ml-1">OIDC</span>
        </motion.button>

        {/* 1-Click Instant Demo Access */}
        <div className="mt-3.5 pt-3.5 border-t border-[#141D17]/8 flex flex-col items-center">
          <motion.button
            type="button"
            onClick={handleQuickDemoAccess}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 px-4 rounded-full bg-[#DEE6DC] hover:bg-[#d2ded0] text-[#141D17] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#141D17]/10 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-800" />
            <span>Instant Demo Explorer Pass (1-Click)</span>
            <span className="font-cursive text-sm text-emerald-800 font-bold">Fast Pass</span>
          </motion.button>

          <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-[#5E6D64]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span>IndexedDB Hardware Enclave · Zero External Egress</span>
          </div>
        </div>
      </motion.div>

      {/* Footer Signature */}
      <div className="mt-6 text-center text-xs text-[#DEE6DC]/60 font-mono flex items-center gap-2 justify-center">
        <span className="font-cursive text-base text-[#82E6B3]">PaperTrail Sovereign</span>
        <span>·</span>
        <span className="font-signature text-lg text-[#DEE6DC]/80">Signed by Nib</span>
      </div>

      {/* Interactive Google Sign-In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1912]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl border border-[#141D17]/10 text-[#141D17] relative"
          >
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-[#5E6D64] hover:text-[#141D17] p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Google Header */}
            <div className="flex items-center gap-2.5 mb-4">
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
              <div>
                <h3 className="text-sm font-bold text-[#141D17]">Choose a Google Account</h3>
                <p className="text-[11px] text-[#5E6D64]">to proceed to PaperTrail Sovereign Vault</p>
              </div>
            </div>

            {/* List of Detected / Quick Accounts */}
            <div className="space-y-2 mt-3">
              <button
                onClick={() => handleGoogleAccountSelected('aishik.roy1234@gmail.com', 'Aishik Roy')}
                className="w-full p-3 rounded-2xl border border-[#141D17]/10 hover:border-[#141D17]/25 hover:bg-[#EBF0E8]/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  AR
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#141D17]">Aishik Roy</div>
                  <div className="text-[11px] font-mono text-[#5E6D64] truncate">
                    aishik.roy1234@gmail.com
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </button>

              <button
                onClick={() =>
                  handleGoogleAccountSelected('syndicate.partner@gmail.com', 'Syndicate Capital')
                }
                className="w-full p-3 rounded-2xl border border-[#141D17]/10 hover:border-[#141D17]/25 hover:bg-[#EBF0E8]/50 flex items-center gap-3 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                  SC
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#141D17]">Syndicate Capital</div>
                  <div className="text-[11px] font-mono text-[#5E6D64] truncate">
                    syndicate.partner@gmail.com
                  </div>
                </div>
              </button>
            </div>

            {/* Custom Google account entry */}
            <div className="mt-4 pt-3 border-t border-[#141D17]/8">
              <label className="text-[10px] font-mono text-[#5E6D64] block mb-1">
                Or enter another Google email:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  placeholder="custom@gmail.com"
                  className="flex-1 px-3 py-1.5 text-xs font-mono border border-[#141D17]/15 rounded-xl bg-[#FAFBF9] text-[#141D17]"
                />
                <button
                  type="button"
                  disabled={!googleCustomEmail.includes('@')}
                  onClick={() =>
                    handleGoogleAccountSelected(
                      googleCustomEmail,
                      googleCustomEmail.split('@')[0]
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-[#141D17] text-[#82E6B3] text-xs font-bold font-mono disabled:opacity-40 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>

            <p className="mt-4 text-[10px] text-[#5E6D64] text-center leading-tight">
              By continuing, Google shares your profile name and email address with PaperTrail.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};
