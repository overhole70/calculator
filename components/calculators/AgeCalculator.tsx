'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  onResult?: (result: string) => void;
}

export function AgeCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [birthDate, setBirthDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{
    years: number; months: number; days: number; totalDays: number; nextBirthday: number;
  } | null>(null);

  const calculate = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const to = new Date(toDate);

    if (birth > to) return;

    let years = to.getFullYear() - birth.getFullYear();
    let months = to.getMonth() - birth.getMonth();
    let days = to.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(to.getFullYear(), to.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((to.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

    const nextBirthday = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= to) nextBirthday.setFullYear(to.getFullYear() + 1);
    const daysToNextBirthday = Math.floor((nextBirthday.getTime() - to.getTime()) / (1000 * 60 * 60 * 24));

    const res = { years, months, days, totalDays, nextBirthday: daysToNextBirthday };
    setResult(res);
    onResult?.(`${years} ${lang === 'ar' ? 'سنوات' : 'years'}, ${months} ${lang === 'ar' ? 'أشهر' : 'months'}, ${days} ${lang === 'ar' ? 'أيام' : 'days'}`);
  };

  const labels = {
    birth: { ar: 'تاريخ الميلاد', fr: 'Date de naissance', es: 'Fecha de nacimiento', en: 'Date of Birth', de: 'Geburtsdatum', zh: '出生日期', hi: 'जन्म तिथि', pt: 'Data de Nascimento', ru: 'Дата рождения', ja: '生年月日' },
    to: { ar: 'حساب حتى تاريخ', fr: "Calculer jusqu'au", es: 'Calcular hasta', en: 'Calculate to date', de: 'Berechnen bis zum', zh: '计算到日期', hi: 'तारीख तक गणना करें', pt: 'Calcular até a data', ru: 'Вычислить до даты', ja: '計算する日付' },
    years: { ar: 'سنة', fr: 'ans', es: 'años', en: 'years', de: 'Jahre', zh: '年', hi: 'वर्ष', pt: 'anos', ru: 'лет', ja: '歳' },
    months: { ar: 'شهر', fr: 'mois', es: 'meses', en: 'months', de: 'Monate', zh: '月', hi: 'महीने', pt: 'meses', ru: 'месяцев', ja: 'ヶ月' },
    days: { ar: 'يوم', fr: 'jours', es: 'días', en: 'days', de: 'Tage', zh: '天', hi: 'दिन', pt: 'dias', ru: 'дней', ja: '日' },
  } as Record<string, Record<string, string>>;

  const L = (key: string) => labels[key]?.[lang] ?? labels[key]?.['en'] ?? key;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {L('birth')}
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {L('to')}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
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
          onClick={() => { setBirthDate(''); setResult(null); }}
          className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-3">{t('tool.result')}</p>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.years}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{L('years')}</p>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600 pb-3">·</div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.months}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{L('months')}</p>
              </div>
              <div className="text-2xl text-gray-300 dark:text-gray-600 pb-3">·</div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{result.days}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{L('days')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.totalDays.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'إجمالي الأيام' : lang === 'fr' ? 'Jours totaux' : 'Total Days'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.nextBirthday}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {lang === 'ar' ? 'أيام حتى عيد ميلادك' : lang === 'fr' ? 'Jours avant anniversaire' : 'Days to Birthday'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
