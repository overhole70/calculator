'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props {
  onResult?: (result: string) => void;
}

export function CompoundInterestCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [compound, setCompound] = useState('12');
  const [monthly, setMonthly] = useState('');
  const [result, setResult] = useState<{
    total: number; interest: number; totalContributions: number;
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseFloat(time);
    const n = parseFloat(compound);
    const m = parseFloat(monthly) || 0;

    if (isNaN(P) || isNaN(r) || isNaN(t)) return;

    // A = P(1 + r/n)^(nt) + PMT * [((1+r/n)^(nt) - 1) / (r/n)]
    const multiplier = Math.pow(1 + r / n, n * t);
    let total = P * multiplier;

    if (m > 0) {
      total += m * ((multiplier - 1) / (r / n));
    }

    const totalContributions = P + m * 12 * t;
    const interest = total - totalContributions;

    const res = { total, interest, totalContributions };
    setResult(res);
    onResult?.(`${lang === 'ar' ? 'الإجمالي' : 'Total'}: $${formatNumber(total)}`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'رأس المال الأولي' : lang === 'fr' ? 'Capital initial' : 'Principal Amount'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={principal}
              onChange={e => setPrincipal(e.target.value)}
              placeholder="10000"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'معدل الفائدة السنوي (%)' : 'Annual Interest Rate (%)'}
          </label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="7"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'المدة (سنوات)' : lang === 'fr' ? 'Durée (ans)' : 'Time (years)'}
          </label>
          <input
            type="number"
            value={time}
            onChange={e => setTime(e.target.value)}
            placeholder="10"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'التركيب' : lang === 'fr' ? 'Fréquence' : 'Compound Frequency'}
          </label>
          <select
            value={compound}
            onChange={e => setCompound(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="1">{lang === 'ar' ? 'سنوي' : 'Annually'}</option>
            <option value="2">{lang === 'ar' ? 'كل 6 أشهر' : 'Semi-annually'}</option>
            <option value="4">{lang === 'ar' ? 'ربع سنوي' : 'Quarterly'}</option>
            <option value="12">{lang === 'ar' ? 'شهري' : 'Monthly'}</option>
            <option value="365">{lang === 'ar' ? 'يومي' : 'Daily'}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'الإيداع الشهري (اختياري)' : 'Monthly Contribution (optional)'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={monthly}
              onChange={e => setMonthly(e.target.value)}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={calculate}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20"
        >
          {t('tool.calculate')}
        </button>
        <button
          onClick={() => { setPrincipal(''); setRate(''); setTime(''); setMonthly(''); setResult(null); }}
          className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-center">
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              {lang === 'ar' ? 'القيمة النهائية' : 'Final Value'}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">${formatNumber(result.total)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">${formatNumber(result.totalContributions)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'إجمالي الإيداعات' : 'Total Contributions'}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${formatNumber(result.interest)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'الفائدة المكتسبة' : 'Interest Earned'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
