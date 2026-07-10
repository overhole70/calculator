'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props {
  onResult?: (result: string) => void;
}

export function BMICalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [result, setResult] = useState<{ bmi: number; category: string; color: string } | null>(null);

  const getBMICategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return {
      category: lang === 'ar' ? 'نقص الوزن' : lang === 'fr' ? 'Insuffisance pondérale' : 'Underweight',
      color: 'text-blue-600 dark:text-blue-400',
    };
    if (bmi < 25) return {
      category: lang === 'ar' ? 'وزن طبيعي' : lang === 'fr' ? 'Poids normal' : 'Normal Weight',
      color: 'text-emerald-600 dark:text-emerald-400',
    };
    if (bmi < 30) return {
      category: lang === 'ar' ? 'زيادة في الوزن' : lang === 'fr' ? 'Surpoids' : 'Overweight',
      color: 'text-amber-600 dark:text-amber-400',
    };
    return {
      category: lang === 'ar' ? 'سمنة' : lang === 'fr' ? 'Obésité' : 'Obese',
      color: 'text-red-600 dark:text-red-400',
    };
  };

  const calculate = () => {
    let w = parseFloat(weight);
    let h: number;

    if (unit === 'metric') {
      h = parseFloat(height) / 100;
      if (isNaN(w) || isNaN(h) || h <= 0) return;
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inches = parseFloat(heightIn) || 0;
      h = (ft * 0.3048) + (inches * 0.0254);
      w = w * 0.453592;
      if (isNaN(w) || h <= 0) return;
    }

    const bmi = w / (h * h);
    const { category, color } = getBMICategory(bmi);
    const res = { bmi, category, color };
    setResult(res);
    onResult?.(`BMI: ${formatNumber(bmi)} — ${category}`);
  };

  const getBMIBarPosition = (bmi: number) => {
    const min = 10, max = 40;
    return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
  };

  return (
    <div className="space-y-6">
      {/* Unit Toggle */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {[
          { key: 'metric' as const, label: lang === 'ar' ? 'متري (kg/cm)' : lang === 'fr' ? 'Métrique' : 'Metric (kg/cm)' },
          { key: 'imperial' as const, label: lang === 'ar' ? 'إمبريالي (lb/ft)' : lang === 'fr' ? 'Impérial' : 'Imperial (lb/ft)' },
        ].map((u) => (
          <button
            key={u.key}
            onClick={() => { setUnit(u.key); setResult(null); }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              unit === u.key
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {lang === 'ar' ? 'الوزن' : lang === 'fr' ? 'Poids' : 'Weight'} ({unit === 'metric' ? 'kg' : 'lbs'})
          </label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={unit === 'metric' ? '70' : '154'}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        {unit === 'metric' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {lang === 'ar' ? 'الطول (سم)' : lang === 'fr' ? 'Taille (cm)' : 'Height (cm)'}
            </label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="175"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {lang === 'ar' ? 'الطول (قدم / بوصة)' : 'Height (ft / in)'}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={heightFt}
                onChange={e => setHeightFt(e.target.value)}
                placeholder="5 ft"
                className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <input
                type="number"
                value={heightIn}
                onChange={e => setHeightIn(e.target.value)}
                placeholder="9 in"
                className="w-1/2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={calculate}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
        >
          {t('tool.calculate')}
        </button>
        <button
          onClick={() => { setWeight(''); setHeight(''); setResult(null); }}
          className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">BMI</p>
            <p className="text-5xl font-bold text-gray-900 dark:text-white">{formatNumber(result.bmi)}</p>
            <p className={`text-lg font-semibold mt-1 ${result.color}`}>{result.category}</p>
          </div>

          {/* BMI Scale */}
          <div className="space-y-2">
            <div className="relative h-4 rounded-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-red-500" />
              <div
                className="absolute top-0 bottom-0 w-1 bg-white dark:bg-gray-900 shadow-lg transition-all duration-500"
                style={{ left: `${getBMIBarPosition(result.bmi)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-blue-500">
                {lang === 'ar' ? 'نحيف' : 'Under'}
              </span>
              <span className="text-emerald-500">
                {lang === 'ar' ? 'طبيعي' : 'Normal'}
              </span>
              <span className="text-amber-500">
                {lang === 'ar' ? 'زائد' : 'Over'}
              </span>
              <span className="text-red-500">
                {lang === 'ar' ? 'سمنة' : 'Obese'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
