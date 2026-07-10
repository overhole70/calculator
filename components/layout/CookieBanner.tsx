'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('calchub-cookies');
    if (!accepted) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('calchub-cookies', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('calchub-cookies', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Cookie Notice</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {t('cookies.message')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {t('cookies.decline')}
          </button>
          <button
            onClick={accept}
            className="flex-1 py-2 px-4 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            {t('cookies.accept')}
          </button>
        </div>
        <div className="mt-3 text-center">
          <Link href="/cookies" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('cookies.learnMore')}
          </Link>
        </div>
      </div>
    </div>
  );
}
