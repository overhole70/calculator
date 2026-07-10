'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props {
  onResult?: (result: string) => void;
}

export function TipCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState(15);
  const [people, setPeople] = useState(1);

  const billNum = parseFloat(bill) || 0;
  const tipAmount = (billNum * tipPct) / 100;
  const total = billNum + tipAmount;
  const perPerson = people > 0 ? total / people : total;

  const quickTips = [10, 15, 18, 20, 25];

  const handleResult = () => {
    if (bill) {
      onResult?.(`${lang === 'ar' ? 'الإجمالي' : 'Total'}: $${formatNumber(total)}`);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'مبلغ الفاتورة' : lang === 'fr' ? 'Montant de la facture' : 'Bill Amount'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
          <input
            type="number"
            value={bill}
            onChange={e => { setBill(e.target.value); handleResult(); }}
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {lang === 'ar' ? 'نسبة البقشيش' : lang === 'fr' ? 'Pourboire' : 'Tip Percentage'}
          </label>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{tipPct}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="50"
          value={tipPct}
          onChange={e => setTipPct(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex gap-2 mt-3">
          {quickTips.map(pct => (
            <button
              key={pct}
              onClick={() => setTipPct(pct)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
                tipPct === pct
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'عدد الأشخاص' : lang === 'fr' ? 'Nombre de personnes' : 'Number of People'}
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPeople(Math.max(1, people - 1))}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            −
          </button>
          <span className="text-2xl font-bold text-gray-900 dark:text-white w-12 text-center">{people}</span>
          <button
            onClick={() => setPeople(people + 1)}
            className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {billNum > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {lang === 'ar' ? 'البقشيش' : 'Tip'}
              </p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">${formatNumber(tipAmount)}</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {lang === 'ar' ? 'الإجمالي' : 'Total'}
              </p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">${formatNumber(total)}</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {lang === 'ar' ? 'لكل شخص' : 'Per Person'}
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${formatNumber(perPerson)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
