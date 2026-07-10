'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { searchTools } from '@/lib/tools/tools-data';
import { getCategoryBySlug } from '@/lib/tools/categories';
import type { Tool } from '@/lib/tools/tools-data';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(searchTools(query, lang));
    } else {
      setResults([]);
    }
  }, [query, lang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="flex-1 text-gray-900 dark:text-white placeholder-gray-400 bg-transparent border-none outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 font-medium uppercase tracking-wide">
                {t('search.results')} ({results.length})
              </p>
              {results.map((tool) => {
                const category = getCategoryBySlug(tool.categoryId);
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center text-lg flex-shrink-0 border border-gray-100 dark:border-gray-700">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tool.names[lang]}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {category?.names[lang] ?? ''} · {tool.descriptions[lang]}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('search.noResults')}</p>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-400 dark:text-gray-500 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{t('search.placeholder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
