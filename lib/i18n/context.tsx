'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, LANGUAGES, TranslationKey, getTranslation } from './translations';

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  dir: 'ltr',
});

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  const supported: Language[] = ['en', 'ar', 'fr', 'es', 'de', 'zh', 'hi', 'pt', 'ru', 'ja'];
  if (supported.includes(browserLang as Language)) return browserLang as Language;
  return 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('calchub-lang') as Language | null;
    if (stored && LANGUAGES[stored]) {
      setLangState(stored);
    } else {
      const detected = detectBrowserLanguage();
      setLangState(detected);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGUAGES[lang].dir;
    document.documentElement.setAttribute('data-lang', lang);
  }, [lang]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('calchub-lang', newLang);
  };

  const t = (key: TranslationKey) => getTranslation(lang, key);
  const dir = LANGUAGES[lang].dir;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
