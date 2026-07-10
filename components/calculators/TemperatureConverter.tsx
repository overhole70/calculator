'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

export function TemperatureConverter() {
  const { t, lang } = useI18n();
  const [value, setValue] = useState('');
  const [from, setFrom] = useState('celsius');

  const convert = (val: number, fromUnit: string) => {
    let celsius: number;
    if (fromUnit === 'celsius') celsius = val;
    else if (fromUnit === 'fahrenheit') celsius = (val - 32) * 5 / 9;
    else if (fromUnit === 'kelvin') celsius = val - 273.15;
    else celsius = (val - 491.67) * 5 / 9;

    return {
      celsius: fromUnit === 'celsius' ? val : celsius,
      fahrenheit: celsius * 9 / 5 + 32,
      kelvin: celsius + 273.15,
      rankine: (celsius + 273.15) * 9 / 5,
    };
  };

  const v = parseFloat(value);
  const results = !isNaN(v) ? convert(v, from) : null;

  const units = [
    { key: 'celsius', label: 'Celsius (°C)', symbol: '°C' },
    { key: 'fahrenheit', label: 'Fahrenheit (°F)', symbol: '°F' },
    { key: 'kelvin', label: 'Kelvin (K)', symbol: 'K' },
    { key: 'rankine', label: 'Rankine (°R)', symbol: '°R' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'درجة الحرارة' : lang === 'fr' ? 'Température' : 'Temperature'}
          </label>
          <input
            type="number"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="e.g. 100"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'من وحدة' : lang === 'fr' ? 'De l\'unité' : 'From Unit'}
          </label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
          </select>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-2 gap-3">
          {units.map(unit => (
            <div
              key={unit.key}
              className={`p-4 rounded-xl border transition-all ${
                unit.key === from
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'
              }`}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{unit.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(results[unit.key as keyof typeof results], 4)}
                <span className="text-base font-normal text-gray-400 ml-1">{unit.symbol}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Common temperatures reference */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          {lang === 'ar' ? 'درجات شائعة' : 'Common Temperatures'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {[
            { name: lang === 'ar' ? 'غليان الماء' : 'Water Boiling', c: 100 },
            { name: lang === 'ar' ? 'جسم الإنسان' : 'Human Body', c: 37 },
            { name: lang === 'ar' ? 'درجة الغرفة' : 'Room Temp', c: 22 },
            { name: lang === 'ar' ? 'تجمد الماء' : 'Water Freezing', c: 0 },
            { name: lang === 'ar' ? 'الفضاء الخارجي' : 'Outer Space', c: -270 },
          ].map(ref => (
            <button
              key={ref.name}
              onClick={() => { setValue(String(ref.c)); setFrom('celsius'); }}
              className="text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {ref.name}
              </span>
              <br />
              <span className="font-medium text-gray-900 dark:text-white">{ref.c}°C</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
