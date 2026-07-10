'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface Props { onResult?: (result: string) => void; }

export function DateDifferenceCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [result, setResult] = useState<{ days: number; weeks: number; months: number; years: number } | null>(null);

  const calculate = () => {
    if (!date1 || !date2) return;
    const d1 = new Date(date1), d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    const res = { days, weeks, months, years };
    setResult(res);
    onResult?.(`${days} ${lang === 'ar' ? 'يوم' : 'days'}`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'التاريخ الأول' : 'First Date'}
          </label>
          <input type="date" value={date1} onChange={e => setDate1(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'التاريخ الثاني' : 'Second Date'}
          </label>
          <input type="date" value={date2} onChange={e => setDate2(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => { setDate1(''); setDate2(''); setResult(null); }} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { val: result.days, label: lang === 'ar' ? 'يوم' : 'Days' },
            { val: result.weeks, label: lang === 'ar' ? 'أسبوع' : 'Weeks' },
            { val: result.months, label: lang === 'ar' ? 'شهر' : 'Months' },
            { val: result.years, label: lang === 'ar' ? 'سنة' : 'Years' },
          ].map(item => (
            <div key={item.label} className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.val.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
