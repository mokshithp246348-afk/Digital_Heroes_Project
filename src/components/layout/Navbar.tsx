'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { SupportedLanguage } from '@/lib/translations';
import {
  Sparkles,
  Heart,
  Trophy,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Flame,
  Sun,
  Moon,
  Globe,
  Bell,
  User as UserIcon,
  CreditCard,
  Target,
  HelpCircle,
  Award,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, languages } = useLanguage();
  const { user, logout, isLoading } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [subOpen, setSubOpen] = useState(false);
  const [donationOpen, setDonationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/draws', label: 'Championship Draws' },
    { href: '/charities', label: 'Charity Impact' },
    { href: '/winners', label: 'Hall of Winners' },
    { href: '/faq', label: 'FAQ' },
  ];

  const authLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Trophy },
    { href: '/scores', label: 'My Scores', icon: Target },
    { href: '/draws', label: 'My Draws', icon: Award },
    { href: '/impact', label: 'My Impact', icon: Heart },
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/profile', label: 'Profile', icon: UserIcon },
    { href: '/faq', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#D4AF37]/25 bg-[#05070A]/92 backdrop-blur-xl">
        {/* Top Mini-Banner: Rollover Jackpot Alert */}
        <div className="bg-gradient-to-r from-[#8C6D28] via-[#D4AF37] to-[#8C6D28] text-[#05070A] text-[11px] font-bold py-1 px-4 text-center flex items-center justify-center gap-2 tracking-wide uppercase">
          <Flame className="w-3.5 h-3.5 fill-[#05070A] text-[#05070A] animate-bounce" />
          <span>
            {t('banner_jackpot')} <strong className="font-extrabold text-[#05070A]">$40,700+</strong>
          </span>
          <Link
            href="/draws"
            className="underline hover:opacity-80 transition text-[10px] tracking-wider font-extrabold ml-1"
          >
            {t('view_mechanics')}
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D28] flex items-center justify-center text-[#05070A] font-black text-sm shadow-md shadow-[#D4AF37]/20 group-hover:scale-105 transition">
              §
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-extrabold text-lg tracking-tight text-white flex items-center gap-1 leading-tight">
                DIGITAL<span className="text-gradient-gold">.HEROES.</span>
              </span>
              <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-mono font-semibold -mt-0.5">
                PRIVATE GOLF CLUB
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            {!user ? (
              publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hover:text-[#F3E5AB] transition ${
                    pathname === link.href ? 'text-[#D4AF37] font-bold font-serif text-sm' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={`hover:text-[#F3E5AB] transition flex items-center gap-1.5 ${
                    pathname === '/dashboard' ? 'text-[#D4AF37] font-bold' : ''
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Dashboard
                </Link>
                <Link
                  href="/scores"
                  className={`hover:text-[#F3E5AB] transition flex items-center gap-1.5 ${
                    pathname === '/scores' ? 'text-[#D4AF37] font-bold' : ''
                  }`}
                >
                  <Target className="w-3.5 h-3.5 text-[#D4AF37]" />
                  My Scores
                </Link>
                <Link
                  href="/draws"
                  className={`hover:text-[#F3E5AB] transition flex items-center gap-1.5 ${
                    pathname === '/draws' ? 'text-[#D4AF37] font-bold' : ''
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-[#F5E6AB]" />
                  My Draws
                </Link>
                <Link
                  href="/impact"
                  className={`hover:text-[#F3E5AB] transition flex items-center gap-1.5 ${
                    pathname === '/impact' ? 'text-[#D4AF37] font-bold' : ''
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                  My Impact
                </Link>
                <Link
                  href="/subscription"
                  className={`hover:text-[#F3E5AB] transition flex items-center gap-1.5 ${
                    pathname === '/subscription' ? 'text-[#D4AF37] font-bold' : ''
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Subscription
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className={`hover:text-white transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F5E6AB] font-bold ${
                      pathname.startsWith('/admin') ? 'bg-[#D4AF37]/30 border-[#D4AF37]' : ''
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Admin Center
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {/* Multi-Language Selector Dropdown */}
            <div className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-[#D4AF37]/20 text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-[11px] font-semibold focus:outline-none cursor-pointer text-slate-200"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#0B0E17] text-white">
                    {l.flag} {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 text-slate-300 transition"
              title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F5E6AB]" />
              ) : (
                <Moon className="w-4 h-4 text-[#D4AF37]" />
              )}
            </button>

            {/* Direct Charity Donation button */}
            <button
              onClick={() => setDonationOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 bg-white/5 hover:bg-[#D4AF37]/15 text-[#F5E6AB] text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden xl:inline">{t('give_directly')}</span>
            </button>

            {/* User Session Controls */}
            {isLoading ? (
              <div className="w-24 h-8 bg-white/5 animate-pulse rounded-xl border border-white/10" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10 relative">
                {/* Profile Pill */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#D4AF37]/30 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F5E6AB] flex items-center justify-center text-[10px] font-bold text-[#05070A]">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-[#D4AF37] capitalize font-mono">{user.role}</div>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-[#D4AF37]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  {t('sign_in')}
                </button>
                <button
                  onClick={() => setSubOpen(true)}
                  className="px-4 py-2 btn-gold-primary rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Join Private Club
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0E17] border-b border-[#D4AF37]/30 px-5 py-6 space-y-4 animate-fadeIn">
            {user ? (
              <div className="space-y-2 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F5E6AB] flex items-center justify-center font-bold text-[#05070A] text-base">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm font-serif">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {authLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ${
                          pathname === link.href
                            ? 'bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#F5E6AB]'
                            : 'bg-white/5 border-white/10 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#D4AF37] shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2 border-b border-white/10 pb-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 text-sm font-semibold text-slate-300 ${
                      pathname === link.href ? 'text-[#D4AF37] font-bold font-serif' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-xs text-[#D4AF37] font-bold hover:bg-[#D4AF37]/10 rounded-xl transition"
                >
                  Sign Out ({user.name})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAuthMode('login');
                      setAuthOpen(true);
                    }}
                    className="py-3 text-xs font-semibold bg-white/10 text-white rounded-xl"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSubOpen(true);
                    }}
                    className="py-3 text-xs btn-gold-primary rounded-xl"
                  >
                    Join Private Club
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onNeedSubscribe={() => setSubOpen(true)}
      />

      <SubscriptionModal
        isOpen={subOpen}
        onClose={() => setSubOpen(false)}
        onSuccess={() => {
          window.location.href = '/dashboard';
        }}
      />

      <DirectDonationModal isOpen={donationOpen} onClose={() => setDonationOpen(false)} />
    </>
  );
}
