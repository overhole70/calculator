'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { categories } from '@/lib/tools/categories';
import { getToolsByCategory } from '@/lib/tools/tools-data';

export default function CategoriesPage() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t('home.categories.title')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('home.categories.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-12">
          {categories.map((category) => {
            const tools = getToolsByCategory(category.id);
            return (
              <div key={category.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${category.bgGradient} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-white">{category.names[lang]}</h2>
                        <p className="text-white/80 text-sm mt-0.5">{category.descriptions[lang]}</p>
                      </div>
                    </div>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-medium transition-all duration-300 backdrop-blur-sm whitespace-nowrap"
                    >
                      {t('category.allTools')} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Tools List */}
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {tools.slice(0, 8).map((tool) => (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.slug}`}
                        className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-base font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                          {tool.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {tool.names[lang]}
                        </span>
                      </Link>
                    ))}
                  </div>
                  {tools.length > 8 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                      <Link
                        href={`/categories/${category.slug}`}
                        className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      >
                        {tools.length - 8} {lang === 'ar' ? 'أداة أخرى' : lang === 'fr' ? 'autres outils' : 'more tools'} →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
