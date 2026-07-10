'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

interface Props {
  onResult?: (result: string) => void;
}

export function ScientificCalculator({ onResult }: Props) {
  const { lang } = useI18n();
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState('');
  const [newNum, setNewNum] = useState(true);

  const buttons = [
    ['sin', 'cos', 'tan', 'log'],
    ['√', 'x²', 'xʸ', 'π'],
    ['(', ')', 'e', '1/x'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['0', '.', '=', '+'],
    ['AC', '±', '%', '←'],
  ];

  const handleButton = (btn: string) => {
    try {
      if (btn === 'AC') { setDisplay('0'); setHistory(''); setNewNum(true); return; }
      if (btn === '←') {
        setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
        return;
      }
      if (btn === '=') {
        const expr = display
          .replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
          .replace(/π/g, String(Math.PI)).replace(/e/g, String(Math.E));
        const res = Function('"use strict"; return (' + expr + ')')();
        const strRes = String(parseFloat(res.toFixed(10)));
        setHistory(`${display} =`);
        setDisplay(strRes);
        setNewNum(true);
        onResult?.(strRes);
        return;
      }
      if (btn === 'sin') { const r = Math.sin(parseFloat(display) * Math.PI / 180); setDisplay(r.toFixed(8)); setNewNum(true); return; }
      if (btn === 'cos') { const r = Math.cos(parseFloat(display) * Math.PI / 180); setDisplay(r.toFixed(8)); setNewNum(true); return; }
      if (btn === 'tan') { const r = Math.tan(parseFloat(display) * Math.PI / 180); setDisplay(r.toFixed(8)); setNewNum(true); return; }
      if (btn === 'log') { const r = Math.log10(parseFloat(display)); setDisplay(r.toFixed(8)); setNewNum(true); return; }
      if (btn === '√') { const r = Math.sqrt(parseFloat(display)); setDisplay(r.toFixed(8)); setNewNum(true); return; }
      if (btn === 'x²') { const r = Math.pow(parseFloat(display), 2); setDisplay(String(r)); setNewNum(true); return; }
      if (btn === '1/x') { const r = 1 / parseFloat(display); setDisplay(String(r)); setNewNum(true); return; }
      if (btn === '±') { setDisplay(String(parseFloat(display) * -1)); return; }
      if (btn === 'π') { setDisplay(newNum ? String(Math.PI) : display + String(Math.PI)); setNewNum(false); return; }
      if (btn === 'e') { setDisplay(newNum ? String(Math.E) : display + String(Math.E)); setNewNum(false); return; }

      const isOp = ['+', '−', '×', '÷', 'xʸ', '(', ')'].includes(btn);
      if (newNum && !isOp) {
        setDisplay(btn === '.' ? '0.' : btn);
        setNewNum(false);
      } else {
        setDisplay(display === '0' && !isOp ? btn : display + btn);
        setNewNum(false);
      }
    } catch {
      setDisplay('Error');
      setNewNum(true);
    }
  };

  const btnStyle = (btn: string) => {
    if (btn === '=') return 'col-span-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all active:scale-95';
    if (['÷', '×', '−', '+'].includes(btn)) return 'bg-amber-500/20 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-500/30 transition-all active:scale-95';
    if (['AC', '←', '±', '%'].includes(btn)) return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all active:scale-95';
    if (['sin', 'cos', 'tan', 'log', '√', 'x²', 'xʸ', 'π', '(', ')', 'e', '1/x'].includes(btn)) return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-sm font-medium rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all active:scale-95';
    return 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95';
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Display */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-4 mb-4">
        <p className="text-gray-400 text-sm h-5 text-right">{history}</p>
        <p className="text-white text-3xl font-mono text-right mt-1 overflow-hidden text-ellipsis">{display}</p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((btn, i) => (
          <button
            key={`${btn}-${i}`}
            onClick={() => handleButton(btn)}
            className={`py-3 text-sm ${btnStyle(btn)}`}
          >
            {btn}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3">
        {lang === 'ar' ? 'الدوال المثلثية بالدرجات' : 'Trigonometric functions in degrees'}
      </p>
    </div>
  );
}
