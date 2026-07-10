'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { ScientificCalculator } from './ScientificCalculator';
import { FractionCalculator } from './FractionCalculator';
import { SquareRootCalculator } from './SquareRootCalculator';
import { DateDifferenceCalculator } from './DateDifferenceCalculator';
import { WeightConverter } from './WeightConverter';
import { BinaryConverter } from './BinaryConverter';
import { ColorConverter } from './ColorConverter';
import { FuelCostCalculator } from './FuelCostCalculator';
import { RandomNumberGenerator } from './RandomNumberGenerator';
import { MortgageCalculator } from './MortgageCalculator';
import { CalorieCalculator } from './CalorieCalculator';

interface Props {
  toolId: string;
  onResult?: (result: string) => void;
}

export function GenericCalculator({ toolId, onResult }: Props) {
  const { lang } = useI18n();

  switch (toolId) {
    case 'scientific':
      return <ScientificCalculator onResult={onResult} />;
    case 'fraction':
      return <FractionCalculator onResult={onResult} />;
    case 'square-root':
      return <SquareRootCalculator onResult={onResult} />;
    case 'date-difference':
      return <DateDifferenceCalculator onResult={onResult} />;
    case 'weight':
      return <WeightConverter />;
    case 'binary':
      return <BinaryConverter />;
    case 'color':
      return <ColorConverter />;
    case 'fuel':
      return <FuelCostCalculator onResult={onResult} />;
    case 'random-number':
      return <RandomNumberGenerator />;
    case 'mortgage':
      return <MortgageCalculator onResult={onResult} />;
    case 'calorie':
      return <CalorieCalculator onResult={onResult} />;
    default:
      return (
        <div className="p-8 text-center text-gray-400">
          <p className="text-4xl mb-4">🔧</p>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            {lang === 'ar' ? 'هذه الأداة قيد التطوير' : 'This tool is coming soon'}
          </p>
          <p className="text-sm mt-2">
            {lang === 'ar' ? 'نعمل على إضافة هذه الأداة قريبًا' : 'We\'re working on adding this tool soon'}
          </p>
        </div>
      );
  }
}
