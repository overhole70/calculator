'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

export function ColorConverter() {
  const { lang } = useI18n();
  const [hex, setHex] = useState('#6366f1');
  const [pickerColor, setPickerColor] = useState('#6366f1');

  const hexToRgb = (h: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(hex);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  const handleHexChange = (val: string) => {
    setHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) setPickerColor(val);
  };

  const handlePickerChange = (val: string) => {
    setPickerColor(val);
    setHex(val);
  };

  return (
    <div className="space-y-5">
      {/* Color Preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-700 shadow-lg flex-shrink-0" style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#6366f1' }} />
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{lang === 'ar' ? 'اختر لونًا' : 'Pick a Color'}</p>
          <input type="color" value={pickerColor} onChange={e => handlePickerChange(e.target.value)}
            className="w-full h-10 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-700" />
        </div>
      </div>

      {/* HEX Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">HEX</label>
        <input type="text" value={hex} onChange={e => handleHexChange(e.target.value)} placeholder="#000000"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono" />
      </div>

      {rgb && hsl && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">RGB</p>
            <p className="font-mono font-bold text-gray-900 dark:text-white">rgb({rgb.r}, {rgb.g}, {rgb.b})</p>
            <div className="mt-2 flex gap-2">
              {[{ label: 'R', val: rgb.r, color: 'bg-red-500' }, { label: 'G', val: rgb.g, color: 'bg-green-500' }, { label: 'B', val: rgb.b, color: 'bg-blue-500' }].map(c => (
                <div key={c.label} className="flex-1 text-center">
                  <div className={`h-1 rounded-full ${c.color} mb-1`} style={{ width: `${(c.val/255)*100}%` }} />
                  <p className="text-xs text-gray-500">{c.label}: {c.val}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">HSL</p>
            <p className="font-mono font-bold text-gray-900 dark:text-white">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</p>
            <div className="mt-2 space-y-1">
              {[{ label: 'H', val: hsl.h, max: 360 }, { label: 'S', val: hsl.s, max: 100 }, { label: 'L', val: hsl.l, max: 100 }].map(c => (
                <div key={c.label} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">{c.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(c.val/c.max)*100}%` }} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{c.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Color Swatches */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">
          {lang === 'ar' ? 'ألوان شائعة' : 'Common Colors'}
        </p>
        <div className="flex flex-wrap gap-2">
          {['#ef4444','#f97316','#f59e0b','#22c55e','#0ea5e9','#6366f1','#8b5cf6','#ec4899','#000000','#6b7280','#ffffff'].map(c => (
            <button key={c} onClick={() => { setHex(c); setPickerColor(c); }}
              title={c}
              className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-700 shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}
