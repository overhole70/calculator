'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props { onResult?: (result: string) => void; }

export function MortgageCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [price, setPrice] = useState('');
  const [down, setDown] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState<{ monthly: number; total: number; interest: number; loan: number } | null>(null);

  const calculate = () => {
    const p = parseFloat(price), d = parseFloat(down) || 0, r = parseFloat(rate) / 100 / 12, n = parseFloat(years) * 12;
    const loan = p - d;
    if (isNaN(p) || isNaN(r) || isNaN(n) || loan <= 0) return;
    const monthly = r === 0 ? loan / n : loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    const interest = total - loan;
    setResult({ monthly, total, interest, loan });
    onResult?.(`${lang === 'ar' ? 'القسط' : 'Monthly'}: $${formatNumber(monthly)}`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: lang === 'ar' ? 'سعر العقار' : 'Property Price', val: price, set: setPrice, prefix: '$', ph: '300000' },
          { label: lang === 'ar' ? 'الدفعة الأولى' : 'Down Payment', val: down, set: setDown, prefix: '$', ph: '60000' },
          { label: lang === 'ar' ? 'معدل الفائدة (%)' : 'Interest Rate (%)', val: rate, set: setRate, prefix: '', ph: '4.5' },
          { label: lang === 'ar' ? 'مدة القرض (سنوات)' : 'Loan Term (years)', val: years, set: setYears, prefix: '', ph: '30' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
            <div className="relative">
              {f.prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{f.prefix}</span>}
              <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                className={`w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${f.prefix ? 'pl-8 pr-4' : 'px-4'}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => { setPrice(''); setDown(''); setRate(''); setResult(null); }} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
            <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">{lang === 'ar' ? 'القسط الشهري' : 'Monthly Payment'}</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">${formatNumber(result.monthly)}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: lang === 'ar' ? 'مبلغ القرض' : 'Loan Amount', val: `$${formatNumber(result.loan)}`, cls: '' },
              { label: lang === 'ar' ? 'إجمالي المدفوع' : 'Total Payment', val: `$${formatNumber(result.total)}`, cls: '' },
              { label: lang === 'ar' ? 'إجمالي الفائدة' : 'Total Interest', val: `$${formatNumber(result.interest)}`, cls: 'text-red-600 dark:text-red-400' },
            ].map(item => (
              <div key={item.label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
                <p className={`text-base font-bold ${item.cls || 'text-gray-900 dark:text-white'}`}>{item.val}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
