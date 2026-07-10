'use client';

import { useI18n } from '@/lib/i18n/context';
import { Calculator, Globe, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  const { t, lang } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('about.title')}</h1>
          <p className="text-gray-300 text-lg">{t('about.description')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'رسالتنا' : lang === 'fr' ? 'Notre Mission' : 'Our Mission'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            {lang === 'ar'
              ? 'CalcHub هي منصة عالمية متكاملة توفر مئات الحاسبات والأدوات الذكية المجانية لمساعدة الأفراد والمهنيين في اتخاذ قرارات مستنيرة في حياتهم اليومية. نؤمن بأن الأدوات الحسابية الدقيقة يجب أن تكون متاحة للجميع، مجانًا وبدون قيود.'
              : lang === 'fr'
              ? 'CalcHub est une plateforme mondiale complète qui fournit des centaines de calculatrices et d\'outils intelligents gratuits pour aider les individus et les professionnels à prendre des décisions éclairées dans leur vie quotidienne.'
              : 'CalcHub is a comprehensive global platform providing hundreds of free smart calculators and tools to help individuals and professionals make informed decisions in their daily lives. We believe that accurate calculation tools should be available to everyone, free of charge.'}
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {lang === 'ar'
              ? 'نقدم أدوات في مجالات الرياضيات والمالية والصحة والتكنولوجيا والتحويلات والحياة اليومية، كلها مصممة بعناية لتوفير نتائج دقيقة وموثوقة.'
              : lang === 'fr'
              ? 'Nous proposons des outils dans les domaines des mathématiques, de la finance, de la santé, de la technologie et de la vie quotidienne.'
              : 'We provide tools across math, finance, health, technology, conversions, and everyday life – all carefully designed to deliver accurate and reliable results.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            {
              icon: <Zap className="w-6 h-6" />,
              title: lang === 'ar' ? 'دقة عالية وسرعة فائقة' : 'High Accuracy & Speed',
              desc: lang === 'ar' ? 'جميع حاسباتنا مُبنية على خوارزميات موثوقة تضمن الدقة في النتائج' : 'All our calculators are built on reliable algorithms ensuring accuracy in results',
              color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
            },
            {
              icon: <Globe className="w-6 h-6" />,
              title: lang === 'ar' ? 'دعم متعدد اللغات' : 'Multilingual Support',
              desc: lang === 'ar' ? 'نقدم المنصة بـ10 لغات عالمية مع دعم كامل للغات RTL و LTR' : 'We offer the platform in 10 global languages with full RTL and LTR support',
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
            },
            {
              icon: <Shield className="w-6 h-6" />,
              title: lang === 'ar' ? 'الخصوصية أولاً' : 'Privacy First',
              desc: lang === 'ar' ? 'لا نجمع بيانات شخصية ولا نبيع معلوماتك. جميع الحسابات تتم في متصفحك' : 'We don\'t collect personal data or sell your information. All calculations happen in your browser',
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
            },
            {
              icon: <Calculator className="w-6 h-6" />,
              title: lang === 'ar' ? 'محتوى تعليمي غني' : 'Rich Educational Content',
              desc: lang === 'ar' ? 'كل أداة مصحوبة بشرح مفصل وأمثلة ونصائح عملية' : 'Every tool comes with detailed explanations, examples, and practical tips',
              color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {lang === 'ar' ? 'إخلاء المسؤولية' : lang === 'fr' ? 'Avertissement' : 'Disclaimer'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {lang === 'ar'
              ? 'المعلومات والنتائج المقدمة على CalcHub هي لأغراض إعلامية وتعليمية فقط. لا ينبغي اعتبارها بديلاً عن المشورة المهنية في المجالات المالية أو الطبية أو القانونية. نوصي دائمًا بالتشاور مع متخصصين مؤهلين قبل اتخاذ قرارات مهمة.'
              : lang === 'fr'
              ? 'Les informations et résultats fournis sur CalcHub sont uniquement à des fins informatives et éducatives. Ils ne doivent pas être considérés comme un substitut aux conseils professionnels.'
              : 'The information and results provided on CalcHub are for informational and educational purposes only. They should not be considered as a substitute for professional advice in financial, medical, or legal matters. We always recommend consulting qualified professionals before making important decisions.'}
          </p>
        </div>
      </div>
    </div>
  );
}
