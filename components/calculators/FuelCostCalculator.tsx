'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props { onResult?: (result: string) => void; }

export function FuelCostCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [distance, setDistance] = useState('');
  const [efficiency, setEfficiency] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<{ liters: number; cost: number } | null>(null);

  const calculate = () => {
    const d = parseFloat(distance), e = parseFloat(efficiency), p = parseFloat(price);
    if (isNaN(d) || isNaN(e) || isNaN(p) || e === 0) return;
    let liters: number;
    if (unit === 'metric') liters = (d / 100) * e;
    else liters = d / e;
    const cost = liters * p;
    setResult({ liters, cost });
    onResult?.(`${lang === 'ar' ? 'التكلفة' : 'Cost'}: $${formatNumber(cost)}`);
  };

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {[
          { key: 'metric' as const, label: lang === 'ar' ? 'متري (لتر/100كم)' : 'Metric (L/100km)' },
          { key: 'imperial' as const, label: lang === 'ar' ? 'ميلز للجالون' : 'Imperial (mpg)' },
        ].map(u => (
          <button key={u.key} onClick={() => { setUnit(u.key); setResult(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${unit === u.key ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            {u.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? `المسافة (${unit === 'metric' ? 'كم' : 'ميل'})` : `Distance (${unit === 'metric' ? 'km' : 'miles'})`}
          </label>
          <input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="100"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? (unit === 'metric' ? 'الاستهلاك (ل/100كم)' : 'الكفاءة (ميل/جالون)') : (unit === 'metric' ? 'Efficiency (L/100km)' : 'Efficiency (mpg)')}
          </label>
          <input type="number" value={efficiency} onChange={e => setEfficiency(e.target.value)} placeholder={unit === 'metric' ? '8' : '30'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'سعر الوقود (لكل لتر/$)' : 'Fuel Price (per liter/$)'}
          </label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="1.50" step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => { setDistance(''); setEfficiency(''); setPrice(''); setResult(null); }} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl text-center">
            <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{formatNumber(result.liters, 2)} L</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lang === 'ar' ? 'الوقود المستهلك' : 'Fuel Consumed'}</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">${formatNumber(result.cost, 2)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lang === 'ar' ? 'التكلفة الإجمالية' : 'Total Cost'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
