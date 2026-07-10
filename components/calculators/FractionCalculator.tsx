'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface Props { onResult?: (result: string) => void; }

function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b); }

export function FractionCalculator({ onResult }: Props) {
  const { t, lang } = useI18n();
  const [n1, setN1] = useState(''); const [d1, setD1] = useState('');
  const [n2, setN2] = useState(''); const [d2, setD2] = useState('');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseInt(n1), b = parseInt(d1), c = parseInt(n2), d = parseInt(d2);
    if ([a,b,c,d].some(isNaN) || b === 0 || d === 0) return;
    let rn: number, rd: number;
    if (op === '+') { rn = a*d + b*c; rd = b*d; }
    else if (op === '-') { rn = a*d - b*c; rd = b*d; }
    else if (op === '*') { rn = a*c; rd = b*d; }
    else { rn = a*d; rd = b*c; }
    const g = gcd(Math.abs(rn), Math.abs(rd));
    const sn = rn/g, sd = rd/g;
    const res = `${sn}/${sd} = ${(sn/sd).toFixed(6)}`;
    setResult(res);
    onResult?.(res);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {/* Fraction 1 */}
        <div className="flex flex-col items-center gap-1">
          <input type="number" value={n1} onChange={e=>setN1(e.target.value)} placeholder="1" className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="w-20 h-0.5 bg-gray-900 dark:bg-white" />
          <input type="number" value={d1} onChange={e=>setD1(e.target.value)} placeholder="2" className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* Operator */}
        <div className="flex gap-1.5">
          {['+','-','×','÷'].map(o => (
            <button key={o} onClick={() => setOp(o === '×' ? '*' : o === '÷' ? '/' : o)}
              className={`w-10 h-10 rounded-xl font-bold text-lg transition-all ${
                op === (o === '×' ? '*' : o === '÷' ? '/' : o)
                  ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}>{o}</button>
          ))}
        </div>

        {/* Fraction 2 */}
        <div className="flex flex-col items-center gap-1">
          <input type="number" value={n2} onChange={e=>setN2(e.target.value)} placeholder="3" className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="w-20 h-0.5 bg-gray-900 dark:bg-white" />
          <input type="number" value={d2} onChange={e=>setD2(e.target.value)} placeholder="4" className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={calculate} className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all">
          {t('tool.calculate')}
        </button>
        <button onClick={() => {setN1('');setD1('');setN2('');setD2('');setResult(null);}} className="py-3 px-5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {t('tool.reset')}
        </button>
      </div>

      {result && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">{t('tool.result')}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{result}</p>
        </div>
      )}
    </div>
  );
}
