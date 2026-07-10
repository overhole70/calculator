'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

export function BinaryConverter() {
  const { lang } = useI18n();
  const [input, setInput] = useState('');
  const [from, setFrom] = useState('decimal');
  const [results, setResults] = useState<{ decimal: string; binary: string; hex: string; octal: string } | null>(null);

  const convert = (val: string, fromBase: string) => {
    if (!val.trim()) { setResults(null); return; }
    let decimal: number;
    try {
      if (fromBase === 'decimal') decimal = parseInt(val, 10);
      else if (fromBase === 'binary') decimal = parseInt(val, 2);
      else if (fromBase === 'hex') decimal = parseInt(val, 16);
      else decimal = parseInt(val, 8);
      if (isNaN(decimal)) { setResults(null); return; }
      setResults({
        decimal: decimal.toString(10),
        binary: decimal.toString(2),
        hex: decimal.toString(16).toUpperCase(),
        octal: decimal.toString(8),
      });
    } catch { setResults(null); }
  };

  const handleChange = (val: string) => { setInput(val); convert(val, from); };
  const handleFromChange = (f: string) => { setFrom(f); setInput(''); setResults(null); };

  const bases = [
    { key: 'decimal', label: lang === 'ar' ? 'عشري' : 'Decimal (10)', placeholder: '255' },
    { key: 'binary', label: lang === 'ar' ? 'ثنائي' : 'Binary (2)', placeholder: '11111111' },
    { key: 'hex', label: lang === 'ar' ? 'سداسي عشر' : 'Hexadecimal (16)', placeholder: 'FF' },
    { key: 'octal', label: lang === 'ar' ? 'ثماني' : 'Octal (8)', placeholder: '377' },
  ];

  const current = bases.find(b => b.key === from);

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1 flex-wrap">
        {bases.map(b => (
          <button key={b.key} onClick={() => handleFromChange(b.key)}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${
              from === b.key ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}>{b.label}</button>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'أدخل القيمة' : 'Enter Value'}
        </label>
        <input type="text" value={input} onChange={e => handleChange(e.target.value)} placeholder={current?.placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-lg" />
      </div>
      {results && (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: lang === 'ar' ? 'عشري' : 'Decimal', val: results.decimal, base: '10' },
            { label: lang === 'ar' ? 'ثنائي' : 'Binary', val: results.binary, base: '2' },
            { label: lang === 'ar' ? 'سداسي عشر' : 'Hexadecimal', val: results.hex, base: '16' },
            { label: lang === 'ar' ? 'ثماني' : 'Octal', val: results.octal, base: '8' },
          ].map(item => (
            <div key={item.base} className={`p-4 rounded-xl border ${from === bases.find(b => b.label === item.label)?.key ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label} (Base {item.base})</p>
              <p className="text-lg font-bold font-mono text-gray-900 dark:text-white break-all">{item.val}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
