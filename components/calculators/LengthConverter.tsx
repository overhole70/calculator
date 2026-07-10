'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

const UNITS = [
  { key: 'mm', label: 'Millimeter (mm)', toBase: 0.001 },
  { key: 'cm', label: 'Centimeter (cm)', toBase: 0.01 },
  { key: 'm', label: 'Meter (m)', toBase: 1 },
  { key: 'km', label: 'Kilometer (km)', toBase: 1000 },
  { key: 'in', label: 'Inch (in)', toBase: 0.0254 },
  { key: 'ft', label: 'Foot (ft)', toBase: 0.3048 },
  { key: 'yd', label: 'Yard (yd)', toBase: 0.9144 },
  { key: 'mi', label: 'Mile (mi)', toBase: 1609.344 },
  { key: 'nm', label: 'Nautical Mile', toBase: 1852 },
  { key: 'ly', label: 'Light Year', toBase: 9.461e15 },
];

export function LengthConverter() {
  const { t, lang } = useI18n();
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');

  const fromUnit = UNITS.find(u => u.key === from)!;
  const toUnit = UNITS.find(u => u.key === to)!;

  const valueNum = parseFloat(value);
  const result = isNaN(valueNum) ? null : (valueNum * fromUnit.toBase) / toUnit.toBase;

  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'القيمة' : lang === 'fr' ? 'Valeur' : 'Value'}
        </label>
        <input
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter value..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="grid grid-cols-5 gap-3 items-center">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'من' : lang === 'fr' ? 'De' : 'From'}
          </label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          >
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>

        <div className="flex justify-center pt-6">
          <button
            onClick={swap}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-bold text-xl"
            title="Swap"
          >
            ⇄
          </button>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'إلى' : lang === 'fr' ? 'À' : 'To'}
          </label>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          >
            {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>

      {result !== null && (
        <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">{t('tool.result')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(result, 8)} <span className="text-xl text-gray-400">{toUnit.key}</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {formatNumber(valueNum)} {from} = {formatNumber(result, 8)} {to}
          </p>
        </div>
      )}

      {/* Quick Reference Table */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {lang === 'ar' ? 'مرجع سريع' : lang === 'fr' ? 'Référence rapide' : 'Quick Reference'}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {value && !isNaN(valueNum) && UNITS.slice(0, 8).filter(u => u.key !== from).map(u => (
            <div key={u.key} className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">{u.label.split('(')[0].trim()}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatNumber((valueNum * fromUnit.toBase) / u.toBase, 6)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
