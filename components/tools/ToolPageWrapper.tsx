'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Home, ChevronRight, Copy, Check, Share2, Printer, Heart, HeartOff } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { getCategoryBySlug } from '@/lib/tools/categories';
import { getToolsByCategory } from '@/lib/tools/tools-data';
import type { Tool } from '@/lib/tools/tools-data';
import { copyToClipboard } from '@/lib/utils';

interface ToolPageWrapperProps {
  tool: Tool;
  result?: string;
  children: React.ReactNode;
  faqs?: { q: string; a: string }[];
  howToUse?: string[];
  tips?: string[];
  examples?: string[];
}

export function ToolPageWrapper({ tool, result, children, faqs, howToUse, tips, examples }: ToolPageWrapperProps) {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(() => {
    if (typeof window === 'undefined') return false;
    const favs = JSON.parse(localStorage.getItem('calchub-favorites') || '[]');
    return favs.includes(tool.id);
  });

  const category = getCategoryBySlug(tool.categoryId);
  const relatedTools = category ? getToolsByCategory(tool.categoryId).filter(t => t.id !== tool.id).slice(0, 4) : [];

  const handleCopy = async () => {
    if (result) {
      await copyToClipboard(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: tool.names[lang],
        text: tool.descriptions[lang],
        url: window.location.href,
      });
    } else {
      await copyToClipboard(window.location.href);
    }
  };

  const handlePrint = () => window.print();

  const toggleFavorite = () => {
    const favs: string[] = JSON.parse(localStorage.getItem('calchub-favorites') || '[]');
    if (favorited) {
      const updated = favs.filter(id => id !== tool.id);
      localStorage.setItem('calchub-favorites', JSON.stringify(updated));
    } else {
      favs.push(tool.id);
      localStorage.setItem('calchub-favorites', JSON.stringify(favs));
    }
    setFavorited(!favorited);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/categories" className="hover:text-white transition-colors">
              {t('nav.categories')}
            </Link>
            {category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link href={`/categories/${category.slug}`} className="hover:text-white transition-colors">
                  {category.names[lang]}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">{tool.names[lang]}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {tool.icon}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  {tool.names[lang]}
                </h1>
                <p className="text-white/70 mt-1.5 text-base">{tool.descriptions[lang]}</p>
              </div>
            </div>
            <button
              onClick={toggleFavorite}
              className="flex-shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label={favorited ? t('tool.unfavorite') : t('tool.favorite')}
              title={favorited ? t('tool.unfavorite') : t('tool.favorite')}
            >
              {favorited ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calculator Widget */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-6">
                {children}
              </div>

              {/* Action Bar */}
              {result && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? t('tool.copied') : t('tool.copy')}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('tool.share')}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors no-print"
                  >
                    <Printer className="w-4 h-4" />
                    {t('tool.print')}
                  </button>
                </div>
              )}
            </div>

            {/* How to Use */}
            {howToUse && howToUse.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  📖 {t('tool.howToUse')}
                </h2>
                <ol className="space-y-3">
                  {howToUse.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Examples */}
            {examples && examples.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  💡 {t('tool.examples')}
                </h2>
                <div className="space-y-3">
                  {examples.map((example, i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {tips && tips.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50 p-6">
                <h2 className="text-xl font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
                  ✨ {t('tool.tips')}
                </h2>
                <ul className="space-y-2.5">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="text-amber-500 flex-shrink-0 mt-0.5">→</span>
                      <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQ */}
            {faqs && faqs.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  ❓ {t('tool.faq')}
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-base">
                  {t('tool.relatedTools')}
                </h3>
                <div className="space-y-2">
                  {relatedTools.map((relTool) => (
                    <Link
                      key={relTool.id}
                      href={`/tools/${relTool.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <span className="text-lg">{relTool.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {relTool.names[lang]}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{relTool.descriptions[lang]}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                {category && (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="block mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium text-center"
                  >
                    {t('tool.backToCategory')} →
                  </Link>
                )}
              </div>
            )}

            {/* Ad Space */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-center min-h-[250px] flex flex-col items-center justify-center">
              <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">Advertisement</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Ad space 250×250</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
