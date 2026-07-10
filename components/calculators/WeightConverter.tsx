'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

const UNITS = [
  { key: 'mg', label: 'Milligram (mg)', toBase: 0.000001 },
  { key: 'g', label: 'Gram (g)', toBase: 0.001 },
  { key: 'kg', label: 'Kilogram (kg)', toBase: 1 },
  { key: 't', label: 'Metric Ton (t)', toBase: 1000 },
  { key: 'oz', label: 'Ounce (oz)', toBase: 0.0283495 },
  { key: 'lb', label: 'Pound (lb)', toBase: 0.453592 },
  { key: 'st', label: 'Stone (st)', toBase: 6.35029 },
  { key: 'ton', label: 'US Ton (ton)', toBase: 907.185 },
];

export function WeightConverter() {
  const { t, lang } = useI18n();
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('kg');
  const [to, setTo] = useState('lb');

  const fromUnit = UNITS.find(u => u.key === from)!;
  const toUnit = UNITS.find(u => u.key === to)!;
  const valueNum = parseFloat(value);
  const result = isNaN(valueNum) ? null : (valueNum * fromUnit.toBase) / toUnit.toBase;

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'القيمة' : 'Value'}
        </label>
        <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Enter value..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      </div>
      <div className="grid grid-cols-5 gap-3 items-end">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{lang === 'ar' ? 'من' : 'From'}</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
        <div className="flex justify-center">
          <button onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition-colors text-xl font-bold">⇄</button>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{lang === 'ar' ? 'إلى' : 'To'}</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>
      {result !== null && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">{t('tool.result')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(result, 6)} <span className="text-xl text-gray-400">{to}</span></p>
          <p className="text-sm text-gray-500 mt-1">{formatNumber(valueNum)} {from} = {formatNumber(result, 6)} {to}</p>
        </div>
      )}
    </div>
  );
}
