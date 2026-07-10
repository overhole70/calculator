'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props { onResult?: (result: string) => void; }

export function SquareRootCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [number, setNumber] = useState('');
  const [nthRoot, setNthRoot] = useState('2');
  const [result, setResult] = useState<{ value: number; root: number } | null>(null);

  const calculate = () => {
    const n = parseFloat(number);
    const r = parseFloat(nthRoot);
    if (isNaN(n) || isNaN(r) || r === 0) return;
    const val = Math.pow(n, 1/r);
    const res = { value: n, root: val };
    setResult(res);
    onResult?.(`${r === 2 ? '√' : `ⁿ√`}${n} = ${formatNumber(val, 8)}`);
  };

  const presets = [
    { n: 2, label: lang === 'ar' ? 'تربيعي' : 'Square' },
    { n: 3, label: lang === 'ar' ? 'تكعيبي' : 'Cube' },
    { n: 4, label: lang === 'ar' ? 'رباعي' : '4th' },
    { n: 10, label: lang === 'ar' ? 'عاشر' : '10th' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'الرقم' : 'Number'}
        </label>
        <input
          type="number"
          value={number}
          onChange={e => setNumber(e.target.value)}
          placeholder="e.g. 144"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {lang === 'ar' ? 'نوع الجذر' : 'Root Type'}
        </label>
        <div className="flex gap-2 mb-3">
          {presets.map(p => (
            <button key={p.n} onClick={() => setNthRoot(String(p.n))}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
                nthRoot === String(p.n) ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>{p.label}</button>
          ))}
        </div>
        <input
          type="number"
          value={nthRoot}
          onChange={e => setNthRoot(e.target.value)}
          min="2"
          placeholder="Root n"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => { setNumber(''); setResult(null); }} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>
      {result && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">{t('tool.result')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(result.root, 10)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {nthRoot}√{formatNumber(result.value)} = {formatNumber(result.root, 10)}
          </p>
        </div>
      )}
    </div>
  );
}
