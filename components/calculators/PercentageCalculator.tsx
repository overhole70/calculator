'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props {
  onResult?: (result: string) => void;
}

export function PercentageCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState<'of' | 'change' | 'what'>('of');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseFloat(val1);
    const b = parseFloat(val2);

    let res = '';
    if (isNaN(a) || isNaN(b)) return;

    if (mode === 'of') {
      res = `${formatNumber(a)} % ${lang === 'ar' ? 'من' : 'of'} ${formatNumber(b)} = ${formatNumber((a / 100) * b)}`;
    } else if (mode === 'change') {
      const pct = ((b - a) / a) * 100;
      const word = pct >= 0 ? (lang === 'ar' ? 'زيادة' : 'increase') : (lang === 'ar' ? 'انخفاض' : 'decrease');
      res = `${formatNumber(Math.abs(pct))}% ${word}`;
    } else {
      res = `${formatNumber((a / b) * 100)}%`;
    }

    setResult(res);
    onResult?.(res);
  };

  const reset = () => {
    setVal1('');
    setVal2('');
    setResult(null);
  };

  const modes = [
    { key: 'of' as const, label: lang === 'ar' ? 'نسبة مئوية من' : lang === 'fr' ? '% de' : '% of' },
    { key: 'change' as const, label: lang === 'ar' ? 'نسبة التغيير' : lang === 'fr' ? 'Variation %' : '% Change' },
    { key: 'what' as const, label: lang === 'ar' ? 'ما النسبة؟' : lang === 'fr' ? 'Quelle %?' : 'What %?' },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); setResult(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === m.key
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        {mode === 'of' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'النسبة المئوية (%)' : lang === 'fr' ? 'Pourcentage (%)' : 'Percentage (%)'}
              </label>
              <input
                type="number"
                value={val1}
                onChange={e => setVal1(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'الرقم الكلي' : lang === 'fr' ? 'Nombre total' : 'Total Number'}
              </label>
              <input
                type="number"
                value={val2}
                onChange={e => setVal2(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </>
        )}
        {mode === 'change' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'القيمة القديمة' : lang === 'fr' ? 'Ancienne valeur' : 'Original Value'}
              </label>
              <input
                type="number"
                value={val1}
                onChange={e => setVal1(e.target.value)}
                placeholder="e.g. 100"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'القيمة الجديدة' : lang === 'fr' ? 'Nouvelle valeur' : 'New Value'}
              </label>
              <input
                type="number"
                value={val2}
                onChange={e => setVal2(e.target.value)}
                placeholder="e.g. 125"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </>
        )}
        {mode === 'what' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'الجزء' : lang === 'fr' ? 'Partie' : 'Part'}
              </label>
              <input
                type="number"
                value={val1}
                onChange={e => setVal1(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {lang === 'ar' ? 'الكل' : lang === 'fr' ? 'Total' : 'Total'}
              </label>
              <input
                type="number"
                value={val2}
                onChange={e => setVal2(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={calculate}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
        >
          {t('tool.calculate')}
        </button>
        <button
          onClick={reset}
          className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {t('tool.reset')}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">{t('tool.result')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{result}</p>
        </div>
      )}
    </div>
  );
}
