import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Lock, Shield, KeyRound, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const StudioAuthModal: React.FC = () => {
  const { loginStudio, setIsStudioRoute } = usePortfolio();
  const [email, setEmail] = useState(() => (import.meta.env.VITE_STUDIO_ADMIN_EMAIL as string) || 'admin@muhammadakram.dev');
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) {
      setError('Please enter your studio access passkey.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await loginStudio(passkey, email);
      if (!success) {
        setError('Invalid studio passkey or administrative credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleExitToPublic = () => {
    setIsStudioRoute(false);
    if (window.location.hash.includes('studio') || window.location.hash.includes('admin')) {
      window.location.hash = '';
    } else {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090e]/95 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0f131a] border border-white/10 rounded-2xl shadow-2xl p-8 text-[#f0f4f8]">
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-white">
            Portfolio Visual Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Private Content Management & Visual Builder Environment
          </p>
        </div>

        {/* Security & Setup Info */}
        <div className="mb-6 p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/[0.05] text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Secure PBKDF2 Password Authentication</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Real backend verification with HTTP-only session cookies and cryptographic salt hashing. Studio Passkey: <code className="text-amber-300 font-mono font-bold">akram2026</code> (or your custom <code className="text-sky-300 font-mono">STUDIO_ADMIN_PASSWORD</code>).
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
              ADMINISTRATOR EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-xs bg-[#090b10] border border-white/10 focus:border-sky-400 rounded-lg text-white outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
              STUDIO PASSKEY
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => {
                  setPasskey(e.target.value);
                  setError(null);
                }}
                placeholder="Enter studio passkey..."
                required
                className="w-full pl-3.5 pr-10 py-2 text-xs bg-[#090b10] border border-white/10 focus:border-sky-400 rounded-lg text-white outline-none placeholder:text-slate-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-sm shadow-sky-500/20"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{loading ? 'Verifying Credentials...' : 'Authenticate & Unlock Studio'}</span>
          </button>
        </form>

        {/* Exit back to public site */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center">
          <button
            type="button"
            onClick={handleExitToPublic}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
