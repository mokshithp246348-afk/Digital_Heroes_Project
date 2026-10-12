'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CreditCard,
  Trophy,
  Heart,
  FileCheck,
  DollarSign,
  BarChart3,
  History,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  CheckCircle2,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { getCurrentUser, setCurrentUser, getWinners } from '@/lib/storage';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [pendingWinnersCount, setPendingWinnersCount] = useState(0);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState(0);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!adminUser) {
      const fetchAdminSession = async () => {
        try {
          const res = await fetch('/api/admin/session', { cache: 'no-store' });
          const data = await res.json();
          if (data.authenticated && data.user && data.user.role === 'admin') {
            setAdminUser(data.user);
          } else {
            router.push('/admin/login');
          }
        } catch {
          router.push('/admin/login');
        }
      };
      fetchAdminSession();
    }

    // Check pending queues for nav badges
    const winners = getWinners();
    setPendingWinnersCount(winners.filter((w) => w.verificationStatus === 'pending').length);
    setPendingPayoutsCount(
      winners.filter((w) => w.verificationStatus === 'approved' && w.paymentStatus !== 'paid').length
    );
  }, [pathname, router, adminUser]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    router.push('/admin/login');
  };

  const navCategories = [
    {
      title: 'OPERATIONS',
      items: [
        { href: '/admin', label: 'Command Center', icon: LayoutDashboard },
        { href: '/admin/draws', label: 'Draw Operations', icon: Trophy },
        {
          href: '/admin/winners',
          label: 'Winner Verification',
          icon: FileCheck,
          badge: pendingWinnersCount > 0 ? pendingWinnersCount : undefined,
        },
        {
          href: '/admin/payouts',
          label: 'Payout Operations',
          icon: DollarSign,
          badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
        },
      ],
    },
    {
      title: 'MEMBERS & REVENUE',
      items: [
        { href: '/admin/users', label: 'Subscriber Management', icon: Users },
        { href: '/admin/subscriptions', label: 'Pricing & Plans', icon: CreditCard },
        { href: '/admin/reports', label: 'Financial Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'IMPACT',
      items: [{ href: '/admin/charities', label: 'Charity Beneficiaries', icon: Heart }],
    },
    {
      title: 'SECURITY',
      items: [{ href: '/admin/audit', label: 'Audit Activity Log', icon: History }],
    },
  ];

  return (
    <div className="min-h-screen bg-golf-atmosphere text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060a0f]/90 backdrop-blur-xl px-4 sm:px-6 h-16 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              §
            </div>
            <div>
              <div className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                DIGITAL<span className="text-amber-400">.HEROES.</span>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold -mt-0.5">
                COMMAND CENTER
              </div>
            </div>
          </Link>
        </div>

        {/* Status Signal & Admin Profile Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Operational Status */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● SYSTEM OPERATIONAL</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition relative"
            >
              <Bell className="w-4 h-4" />
              {(pendingWinnersCount > 0 || pendingPayoutsCount > 0) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-[#0c121c] border border-white/15 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-fadeIn">
                <div className="font-bold text-white border-b border-white/10 pb-2 flex justify-between items-center">
                  <span>Operational Alerts</span>
                  <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/admin/winners"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  >
                    <div className="font-semibold text-amber-400">Winner Verification Queue</div>
                    <div className="text-[10px] text-slate-400">
                      {pendingWinnersCount > 0 ? `${pendingWinnersCount} scorecards pending review` : 'All scorecards verified'}
                    </div>
                  </Link>
                  <Link
                    href="/admin/payouts"
                    onClick={() => setNotificationsOpen(false)}
                    className="block p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                  >
                    <div className="font-semibold text-emerald-400">Payout Operations Queue</div>
                    <div className="text-[10px] text-slate-400">
                      {pendingPayoutsCount > 0 ? `${pendingPayoutsCount} disbursements ready for release` : 'No pending payouts'}
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">{adminUser?.name || 'Administrator'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0c121c] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fadeIn">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white">{adminUser?.name || 'Master Admin'}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {adminUser?.email || 'admin@digitalheroes.com'}
                  </div>
                </div>

                <Link
                  href="/admin/audit"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Audit Activity Log</span>
                </Link>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/10 transition font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar (Desktop) */}
        <aside
          className={`hidden md:flex flex-col border-r border-white/10 bg-[#05080f] p-4 transition-all duration-300 shrink-0 relative ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-900 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center shadow-lg transition"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          <div className="space-y-6 overflow-y-auto flex-1 pr-1">
            {navCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                {!isCollapsed && (
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3">
                    {cat.title}
                  </div>
                )}

                <nav className="space-y-1">
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={isCollapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition relative ${
                          isActive
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}

                        {item.badge !== undefined && (
                          <span
                            className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                              isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#070b12]">
              <span className="font-extrabold text-amber-400 text-sm">DIGITAL HEROES ADMIN</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-6 overflow-y-auto flex-1 bg-[#05080f]">
              {navCategories.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-2">
                    {cat.title}
                  </div>
                  <div className="space-y-1">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                            isActive ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-emerald-400" />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500 text-slate-950 font-extrabold">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        )}

        {/* Dynamic Admin Module Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-golf-atmosphere">{children}</main>
      </div>
    </div>
  );
}

