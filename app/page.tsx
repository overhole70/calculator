'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, ArrowRight, Star, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { categories } from '@/lib/tools/categories';
import { getPopularTools, getNewTools } from '@/lib/tools/tools-data';
import { searchTools } from '@/lib/tools/tools-data';
import type { Tool } from '@/lib/tools/tools-data';
import { SearchModal } from '@/components/search/SearchModal';

export default function HomePage() {
  const { t, lang } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const popularTools = getPopularTools();
  const newTools = getNewTools();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(true);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950" />
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" />
            <span>{t('site.tagline')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {t('home.hero.title').split(' ').slice(0, 4).join(' ')}{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {t('home.hero.title').split(' ').slice(4).join(' ')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-12">
            <div className="relative flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-2xl hover:border-indigo-400/50 transition-all duration-300 group focus-within:border-indigo-400/50">
              <Search className="w-5 h-5 text-gray-400 absolute ltr:left-5 rtl:right-5 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                placeholder={t('home.hero.searchPlaceholder')}
                className="flex-1 bg-transparent text-white placeholder-gray-400 py-4 ltr:pl-14 rtl:pr-14 ltr:pr-4 rtl:pl-4 text-base outline-none"
              />
              <button
                type="submit"
                className="m-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg whitespace-nowrap"
              >
                {t('tool.calculate')}
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 text-center">
            {[
              { num: '74+', label: lang === 'ar' ? 'أداة' : lang === 'fr' ? 'Outils' : lang === 'es' ? 'Herramientas' : 'Tools' },
              { num: '8', label: lang === 'ar' ? 'فئة' : lang === 'fr' ? 'Catégories' : lang === 'es' ? 'Categorías' : 'Categories' },
              { num: '10', label: lang === 'ar' ? 'لغات' : lang === 'fr' ? 'Langues' : lang === 'es' ? 'Idiomas' : 'Languages' },
              { num: '100%', label: lang === 'ar' ? 'مجاني' : lang === 'fr' ? 'Gratuit' : lang === 'es' ? 'Gratis' : 'Free' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.num}</div>
                <div className="text-xs sm:text-sm text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.categories.title')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.categories.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.bgGradient}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      {category.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                      {category.toolCount} {t('category.toolsCount')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {category.names[lang]}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                    {category.descriptions[lang]}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{t('category.allTools')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  {t('home.popular.title')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('home.popular.subtitle')}
              </h2>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all"
            >
              {t('category.allTools')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ToolsGrid tools={popularTools} lang={lang} />
        </div>
      </section>

      {/* New Tools */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {t('home.new.title')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {t('home.new.subtitle')}
              </h2>
            </div>
          </div>

          <ToolsGrid tools={newTools} lang={lang} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16">
            {lang === 'ar' ? 'لماذا تختار CalcHub؟' : lang === 'fr' ? 'Pourquoi Choisir CalcHub?' : lang === 'es' ? '¿Por Qué Elegir CalcHub?' : 'Why Choose CalcHub?'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: lang === 'ar' ? 'سريع ودقيق' : lang === 'fr' ? 'Rapide et Précis' : 'Fast & Accurate',
                desc: lang === 'ar' ? 'نتائج فورية بدقة عالية' : lang === 'fr' ? 'Résultats instantanés avec haute précision' : 'Instant results with high precision',
              },
              {
                icon: '🌍',
                title: lang === 'ar' ? 'متعدد اللغات' : lang === 'fr' ? 'Multilingue' : 'Multilingual',
                desc: lang === 'ar' ? '10 لغات مدعومة بالكامل' : lang === 'fr' ? '10 langues entièrement supportées' : '10 languages fully supported',
              },
              {
                icon: '📱',
                title: lang === 'ar' ? 'متجاوب مع الأجهزة' : lang === 'fr' ? 'Responsive' : 'Fully Responsive',
                desc: lang === 'ar' ? 'يعمل على أي جهاز أو شاشة' : lang === 'fr' ? 'Fonctionne sur tout appareil' : 'Works on any device or screen',
              },
              {
                icon: '🆓',
                title: lang === 'ar' ? 'مجاني تمامًا' : lang === 'fr' ? 'Entièrement Gratuit' : 'Completely Free',
                desc: lang === 'ar' ? 'جميع الأدوات مجانية دون تسجيل' : lang === 'fr' ? 'Tous les outils gratuits sans inscription' : 'All tools free, no registration needed',
              },
              {
                icon: '🔒',
                title: lang === 'ar' ? 'خصوصيتك محفوظة' : lang === 'fr' ? 'Confidentialité Protégée' : 'Privacy Protected',
                desc: lang === 'ar' ? 'لا نخزن أي بيانات شخصية' : lang === 'fr' ? 'Nous ne stockons aucune donnée personnelle' : 'We store no personal data',
              },
              {
                icon: '📖',
                title: lang === 'ar' ? 'محتوى مفيد' : lang === 'fr' ? 'Contenu Utile' : 'Helpful Content',
                desc: lang === 'ar' ? 'شروحات وأمثلة لكل أداة' : lang === 'fr' ? 'Explications et exemples pour chaque outil' : 'Explanations and examples for every tool',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function ToolsGrid({ tools, lang }: { tools: Tool[]; lang: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <Link
          key={tool.id}
          href={`/tools/${tool.slug}`}
          className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            {tool.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {(tool.names as Record<string, string>)[lang] || tool.names['en']}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {(tool.descriptions as Record<string, string>)[lang] || tool.descriptions['en']}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
        </Link>
      ))}
    </div>
  );
}
