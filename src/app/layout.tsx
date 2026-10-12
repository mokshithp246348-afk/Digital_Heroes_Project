import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DemoSwitcher from '@/components/common/DemoSwitcher';
import ThreeGolfExperience from '@/components/common/ThreeGolfExperience';
import LiveGolfChatbot from '@/components/common/LiveGolfChatbot';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'Digital Heroes | Private Golf Club & Philanthropic Rewards',
  description:
    'An ultra-premium subscription platform combining Stableford golf score tracking, charity fundraising, and transparent monthly jackpot prize pools.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Digital Heroes | Private Golf & Charity Platform',
    description: 'Log rolling golf scores, enter monthly jackpot draws, and support verified charities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#05070A] text-slate-100 antialiased selection:bg-[#D4AF37] selection:text-[#05070A] relative">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <ThreeGolfExperience />
                <div className="relative z-10 flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-1 focus:outline-none" id="main-content">{children}</main>
                  <Footer />
                </div>
                <LiveGolfChatbot />
                <DemoSwitcher />
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
