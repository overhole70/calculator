'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props {
  onResult?: (result: string) => void;
}

export function LoanCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');
  const [result, setResult] = useState<{
    monthly: number; total: number; interest: number;
  } | null>(null);

  const calculate = () => {
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = termUnit === 'years' ? parseFloat(term) * 12 : parseFloat(term);

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;

    let monthly: number;
    if (r === 0) {
      monthly = P / n;
    } else {
      monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const total = monthly * n;
    const interest = total - P;

    const res = { monthly, total, interest };
    setResult(res);
    onResult?.(`${lang === 'ar' ? 'القسط الشهري' : 'Monthly Payment'}: $${formatNumber(monthly)}`);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'مبلغ القرض' : lang === 'fr' ? 'Montant du prêt' : 'Loan Amount'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'معدل الفائدة السنوي (%)' : lang === 'fr' ? 'Taux d\'intérêt annuel (%)' : 'Annual Interest Rate (%)'}
          </label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="5"
            step="0.1"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'مدة القرض' : lang === 'fr' ? 'Durée du prêt' : 'Loan Term'}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="5"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <select
              value={termUnit}
              onChange={e => setTermUnit(e.target.value as 'years' | 'months')}
              className="px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="years">{lang === 'ar' ? 'سنوات' : lang === 'fr' ? 'ans' : 'years'}</option>
              <option value="months">{lang === 'ar' ? 'أشهر' : lang === 'fr' ? 'mois' : 'months'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={calculate}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
        >
          {t('tool.calculate')}
        </button>
        <button
          onClick={() => { setAmount(''); setRate(''); setTerm(''); setResult(null); }}
          className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-1">
              {lang === 'ar' ? 'القسط الشهري' : lang === 'fr' ? 'Mensualité' : 'Monthly Payment'}
            </p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">
              ${formatNumber(result.monthly)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-xl font-bold text-gray-900 dark:text-white">${formatNumber(result.total)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'إجمالي المدفوع' : lang === 'fr' ? 'Total payé' : 'Total Payment'}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">${formatNumber(result.interest)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'إجمالي الفائدة' : lang === 'fr' ? 'Total intérêts' : 'Total Interest'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
