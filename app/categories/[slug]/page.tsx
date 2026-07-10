'use client';

import Link from 'next/link';
import { use } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { getCategoryBySlug, categories } from '@/lib/tools/categories';
import { getToolsByCategory } from '@/lib/tools/tools-data';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: Props) {
  const { slug } = use(params);
  const { t, lang } = useI18n();
  const category = getCategoryBySlug(slug);
  const tools = category ? getToolsByCategory(category.id) : [];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Category not found</h1>
          <Link href="/categories" className="text-indigo-600 hover:underline">← Back to Categories</Link>
        </div>
      </div>
    );
  }

  const relatedCategories = categories.filter(c => c.id !== category.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className={`bg-gradient-to-br ${category.bgGradient} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/categories" className="hover:text-white transition-colors">
              {t('nav.categories')}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{category.names[lang]}</span>
          </nav>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl">
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{category.names[lang]}</h1>
              <p className="text-white/80 mt-1.5 text-lg">{category.descriptions[lang]}</p>
              <p className="text-white/60 text-sm mt-1">
                {tools.length} {t('category.toolsCount')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tools Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span>{category.icon}</span>
              {t('category.allTools')} — {category.names[lang]}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.names[lang]}
                        </h3>
                        {tool.isNew && (
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                        {tool.isPopular && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                            ★
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                        {tool.descriptions[lang]}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                {lang === 'ar' ? 'فئات أخرى' : lang === 'fr' ? 'Autres Catégories' : 'Other Categories'}
              </h3>
              <div className="space-y-2">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {cat.names[lang]}
                      </p>
                      <p className="text-xs text-gray-400">{cat.toolCount} {t('category.toolsCount')}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="block text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline pt-2 font-medium"
                >
                  {t('category.allTools')} →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
