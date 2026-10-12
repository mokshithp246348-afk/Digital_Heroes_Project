'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-[#080b10] text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-xs">
                §
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                digital<span className="text-orange-400">.HEROES.</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer_tagline')}
            </p>
            <div className="text-[11px] text-slate-400">
              Digital Heroes 2026 Platform
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">{t('how_it_works')}</div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition">
                  {t('how_it_works')}
                </Link>
              </li>
              <li>
                <Link href="/#draws" className="hover:text-white transition">
                  {t('draw_engine')}
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition">
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/charities" className="hover:text-white transition">
                  {t('charities_impact')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  {t('golfer_dashboard')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {t('charities_impact')}
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="text-slate-300">{t('pledge_min')}</span>
              </li>
              <li>
                <Link href="/charities" className="hover:text-white transition">
                  {t('view_all_charities')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">
                  {t('admin_panel')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Verification & Security
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Scorecard Verification
              </div>
              <p className="text-slate-400 leading-relaxed">
                All winning combinations undergo review against official club or digital handicapping platform screenshots prior to payout disbursement.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Digital Heroes. {t('footer_rights')}
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:underline">{t('footer_privacy')}</Link>
            <span>·</span>
            <Link href="#" className="hover:underline">{t('footer_terms')}</Link>
            <span>·</span>
            <Link href="#" className="hover:underline">{t('footer_cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
