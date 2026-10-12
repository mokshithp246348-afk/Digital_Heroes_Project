'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BillingCycle, User } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Key,
  Mail,
  User as UserIcon,
  Sparkles,
  Lock,
  Crown,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: (user: User) => void;
  onNeedSubscribe?: (cycle?: BillingCycle) => void;
  requestedCycle?: BillingCycle;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
  onNeedSubscribe,
  requestedCycle,
}: AuthModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(cleanEmail, cleanPassword);
    setIsSubmitting(false);

    if (!result.success || !result.user) {
      setError(result.message || 'Invalid account credentials. Please check your email and password.');
      return;
    }

    if (onSuccess) onSuccess(result.user);
    onClose();

    if (result.user.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 8) {
      setError('Password must consist of at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(cleanName, cleanEmail, cleanPassword, requestedCycle || 'monthly');
    setIsSubmitting(false);

    if (!result.success || !result.user) {
      setError(result.message || 'An error occurred during account creation.');
      return;
    }

    if (onSuccess) onSuccess(result.user);
    onClose();

    if (onNeedSubscribe) {
      onNeedSubscribe(requestedCycle);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#090d16] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Micro-header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-xs border border-[#D4AF37]/30">
            <Crown className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#F5E6AB] font-bold">
            digital.HEROES.
          </span>
        </div>

        {/* Tab switch: Sign In | Create Account */}
        <div className="flex border-b border-white/10 mb-6 text-xs sm:text-sm">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`pb-3 font-semibold transition relative flex-1 text-center ${
              mode === 'login' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('sign_in')}
            {mode === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full" />
            )}
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`pb-3 font-semibold transition relative flex-1 text-center ${
              mode === 'signup' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('create_account')}
            {mode === 'signup' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full" />
            )}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">{t('password_label')}</label>
                <span className="text-[10px] text-slate-500">{t('password_hint')}</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-white placeholder-slate-500 font-mono tracking-wider transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  {t('sign_in_btn')}
                </>
              )}
            </button>
          </form>
        ) : (
          /* CREATE ACCOUNT FORM */
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('full_name')}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('name_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('email_label')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('email_placeholder')}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">{t('password_label')}</label>
                <span className="text-[10px] text-[#D4AF37] font-medium">{t('password_hint')}</span>
              </div>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('password_placeholder')}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] text-white placeholder-slate-500 font-mono tracking-wider transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  {t('create_account_btn')}
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
