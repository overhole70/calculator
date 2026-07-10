'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { formatNumber } from '@/lib/utils';

interface Props { onResult?: (result: string) => void; }

export function CalorieCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('1.375');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [result, setResult] = useState<{ bmr: number; tdee: number; loss: number; gain: number } | null>(null);

  const activityLevels = [
    { val: '1.2', label: lang === 'ar' ? 'خامل جدًا' : 'Sedentary' },
    { val: '1.375', label: lang === 'ar' ? 'نشاط خفيف' : 'Light Exercise' },
    { val: '1.55', label: lang === 'ar' ? 'نشاط متوسط' : 'Moderate Exercise' },
    { val: '1.725', label: lang === 'ar' ? 'نشاط عالٍ' : 'Very Active' },
    { val: '1.9', label: lang === 'ar' ? 'نشاط مكثف' : 'Extremely Active' },
  ];

  const calculate = () => {
    let w = parseFloat(weight), h = parseFloat(height);
    const a = parseFloat(age), act = parseFloat(activity);
    if (isNaN(w) || isNaN(h) || isNaN(a)) return;
    if (unit === 'imperial') { w = w * 0.453592; h = h * 2.54; }
    const bmr = gender === 'male'
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    setResult({ bmr, tdee, loss: tdee - 500, gain: tdee + 300 });
    onResult?.(`TDEE: ${formatNumber(tdee)} kcal/day`);
  };

  return (
    <div className="space-y-5">
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 gap-1">
        {[{ key: 'metric' as const, label: lang === 'ar' ? 'متري' : 'Metric' }, { key: 'imperial' as const, label: lang === 'ar' ? 'إمبريالي' : 'Imperial' }].map(u => (
          <button key={u.key} onClick={() => { setUnit(u.key); setResult(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${unit === u.key ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>
            {u.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {[{ key: 'male' as const, label: lang === 'ar' ? '♂ ذكر' : '♂ Male' }, { key: 'female' as const, label: lang === 'ar' ? '♀ أنثى' : '♀ Female' }].map(g => (
          <button key={g.key} onClick={() => setGender(g.key)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${gender === g.key ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: lang === 'ar' ? 'العمر (سنة)' : 'Age (yrs)', val: age, set: setAge, ph: '25' },
          { label: lang === 'ar' ? `الوزن (${unit === 'metric' ? 'كجم' : 'رطل'})` : `Weight (${unit === 'metric' ? 'kg' : 'lbs'})`, val: weight, set: setWeight, ph: unit === 'metric' ? '70' : '154' },
          { label: lang === 'ar' ? `الطول (${unit === 'metric' ? 'سم' : 'بوصة'})` : `Height (${unit === 'metric' ? 'cm' : 'in'})`, val: height, set: setHeight, ph: unit === 'metric' ? '175' : '69' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
            <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {lang === 'ar' ? 'مستوى النشاط' : 'Activity Level'}
        </label>
        <select value={activity} onChange={e => setActivity(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
          {activityLevels.map(a => <option key={a.val} value={a.val}>{a.label} (×{a.val})</option>)}
        </select>
      </div>

      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => { setAge(''); setWeight(''); setHeight(''); setResult(null); }} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50 text-center">
            <p className="text-sm text-rose-600 dark:text-rose-400 mb-1">TDEE</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatNumber(result.tdee, 0)} <span className="text-xl text-gray-400">kcal/day</span></p>
            <p className="text-xs text-gray-500 mt-1">BMR: {formatNumber(result.bmr, 0)} kcal</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-center">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(result.loss, 0)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lang === 'ar' ? 'لخسارة الوزن' : 'Weight Loss'}</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-center">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(result.gain, 0)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lang === 'ar' ? 'لزيادة الوزن' : 'Weight Gain'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
