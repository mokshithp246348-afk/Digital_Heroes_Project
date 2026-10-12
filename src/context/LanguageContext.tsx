'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SupportedLanguage, TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageOption } from '@/lib/translations';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>, fallback?: string) => string;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  const updateDocumentAttributes = (lang: SupportedLanguage) => {
    if (typeof window === 'undefined') return;
    const option = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    const dir = option?.dir || 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  };

  useEffect(() => {
    const saved = localStorage.getItem('dh_language') as SupportedLanguage;
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
      updateDocumentAttributes(saved);
    } else {
      updateDocumentAttributes('en');
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('dh_language', lang);
    updateDocumentAttributes(lang);
    window.dispatchEvent(new Event('dh-language-change'));
  };

  const t = (key: string, params?: Record<string, string | number>, fallback?: string): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    let text = dict[key] || TRANSLATIONS['en']?.[key] || fallback || key;

    if (params && typeof text === 'string') {
      Object.entries(params).forEach(([pKey, pVal]) => {
        text = text.replace(new RegExp(`{\\s*${pKey}\\s*}`, 'g'), String(pVal));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
