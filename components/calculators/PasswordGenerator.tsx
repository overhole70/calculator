'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { copyToClipboard } from '@/lib/utils';

export function PasswordGenerator() {
  const { t, lang } = useI18n();
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState(0);

  const generate = () => {
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) return;

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);

    // Strength calc
    let s = 0;
    if (length >= 8) s++;
    if (length >= 12) s++;
    if (length >= 16) s++;
    if (uppercase && lowercase) s++;
    if (numbers) s++;
    if (symbols) s++;
    setStrength(Math.min(4, Math.floor(s / 1.5)));
  };

  const handleCopy = async () => {
    if (password) {
      await copyToClipboard(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const strengthConfig = [
    { label: lang === 'ar' ? 'ضعيفة جدًا' : 'Very Weak', color: 'bg-red-500' },
    { label: lang === 'ar' ? 'ضعيفة' : 'Weak', color: 'bg-orange-500' },
    { label: lang === 'ar' ? 'متوسطة' : 'Fair', color: 'bg-amber-500' },
    { label: lang === 'ar' ? 'قوية' : 'Strong', color: 'bg-emerald-500' },
    { label: lang === 'ar' ? 'قوية جدًا' : 'Very Strong', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-5">
      {/* Password Display */}
      <div className="relative">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 font-mono text-base text-gray-900 dark:text-white min-h-[56px] flex items-center break-all pr-24">
          {password || (
            <span className="text-gray-400">
              {lang === 'ar' ? 'اضغط إنشاء...' : 'Click generate...'}
            </span>
          )}
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1.5">
          <button
            onClick={generate}
            className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
            title="Generate"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Strength Indicator */}
      {password && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'قوة كلمة المرور' : 'Password Strength'}
            </span>
            <span className={strengthConfig[strength]?.color.replace('bg-', 'text-') || 'text-gray-500'}>
              {strengthConfig[strength]?.label}
            </span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= strength ? strengthConfig[strength]?.color : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Length */}
      <div>
        <div className="flex justify-between mb-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {lang === 'ar' ? 'الطول' : lang === 'fr' ? 'Longueur' : 'Length'}
          </label>
          <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{length}</span>
        </div>
        <input
          type="range"
          min="4"
          max="64"
          value={length}
          onChange={e => setLength(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>4</span>
          <span>64</span>
        </div>
      </div>

      {/* Character Options */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'uppercase', label: lang === 'ar' ? 'أحرف كبيرة (A-Z)' : 'Uppercase (A-Z)', state: uppercase, set: setUppercase },
          { key: 'lowercase', label: lang === 'ar' ? 'أحرف صغيرة (a-z)' : 'Lowercase (a-z)', state: lowercase, set: setLowercase },
          { key: 'numbers', label: lang === 'ar' ? 'أرقام (0-9)' : 'Numbers (0-9)', state: numbers, set: setNumbers },
          { key: 'symbols', label: lang === 'ar' ? 'رموز (!@#$)' : 'Symbols (!@#$)', state: symbols, set: setSymbols },
        ].map(opt => (
          <label key={opt.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={opt.state}
              onChange={e => opt.set(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={generate}
        className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20"
      >
        {lang === 'ar' ? 'إنشاء كلمة مرور' : lang === 'fr' ? 'Générer' : 'Generate Password'}
      </button>
    </div>
  );
}
