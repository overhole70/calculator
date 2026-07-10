'use client';

import { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { copyToClipboard } from '@/lib/utils';

export function RandomNumberGenerator() {
  const { lang } = useI18n();
  const [min, setMin] = useState('1');
  const [max, setMax] = useState('100');
  const [count, setCount] = useState('1');
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const mn = parseInt(min), mx = parseInt(max), c = Math.min(Math.max(parseInt(count) || 1, 1), 100);
    if (isNaN(mn) || isNaN(mx) || mn >= mx) return;
    const nums = Array.from({ length: c }, () => Math.floor(Math.random() * (mx - mn + 1)) + mn);
    setResults(nums);
  };

  const handleCopy = async () => {
    await copyToClipboard(results.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'الحد الأدنى' : 'Min'}
          </label>
          <input type="number" value={min} onChange={e => setMin(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'الحد الأقصى' : 'Max'}
          </label>
          <input type="number" value={max} onChange={e => setMax(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'العدد' : 'Count'}
          </label>
          <input type="number" value={count} min="1" max="100" onChange={e => setCount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
        </div>
      </div>

      <button onClick={generate} className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4" />
        {lang === 'ar' ? 'إنشاء أرقام عشوائية' : 'Generate Random Numbers'}
      </button>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {results.map((num, i) => (
              <div key={i} className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-100 dark:border-indigo-900/50 rounded-xl">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{num}</span>
              </div>
            ))}
          </div>
          <button onClick={handleCopy} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
            <Copy className="w-4 h-4" />
            {copied ? (lang === 'ar' ? 'تم النسخ!' : 'Copied!') : (lang === 'ar' ? 'نسخ الكل' : 'Copy All')}
          </button>
        </div>
      )}
    </div>
  );
}
