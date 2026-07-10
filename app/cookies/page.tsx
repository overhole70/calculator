'use client';

import { useI18n } from '@/lib/i18n/context';

export default function CookiesPage() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('nav.cookies')}</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isAr ? 'ما هي ملفات تعريف الارتباط؟' : 'What are Cookies?'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {isAr
                ? 'ملفات تعريف الارتباط هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارتك لموقعنا. تساعدنا هذه الملفات على تذكر تفضيلاتك وتحسين تجربتك.'
                : 'Cookies are small text files stored on your device when you visit our website. These files help us remember your preferences and improve your experience.'}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isAr ? 'أنواع ملفات تعريف الارتباط التي نستخدمها' : 'Types of Cookies We Use'}
            </h2>
            <div className="space-y-4">
              {[
                {
                  name: isAr ? 'ضرورية' : 'Essential',
                  desc: isAr ? 'ضرورية لعمل الموقع بشكل صحيح، مثل تذكر اللغة والوضع الداكن.' : 'Required for the website to function properly, such as remembering language and dark mode.',
                  examples: ['calchub-theme', 'calchub-lang', 'calchub-cookies'],
                },
                {
                  name: isAr ? 'تحليلية' : 'Analytics',
                  desc: isAr ? 'تساعدنا على فهم كيفية استخدام الزوار للموقع لتحسين الخدمة.' : 'Help us understand how visitors use the site to improve our service.',
                  examples: ['_ga', '_ga_*', '_gid'],
                },
                {
                  name: isAr ? 'إعلانية' : 'Advertising',
                  desc: isAr ? 'تُستخدم من قِبَل Google AdSense لعرض إعلانات ذات صلة.' : 'Used by Google AdSense to display relevant advertisements.',
                  examples: ['NID', 'DSID', 'IDE'],
                },
              ].map(type => (
                <div key={type.name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{type.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{type.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {type.examples.map(ex => (
                      <code key={ex} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">{ex}</code>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isAr ? 'كيف تتحكم في ملفات تعريف الارتباط' : 'How to Control Cookies'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {isAr
                ? 'يمكنك التحكم في ملفات تعريف الارتباط وحذفها من خلال إعدادات متصفحك. لاحظ أن تعطيل بعض ملفات تعريف الارتباط قد يؤثر على وظائف الموقع.'
                : 'You can control and delete cookies through your browser settings. Note that disabling some cookies may affect website functionality.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
