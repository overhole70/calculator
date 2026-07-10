'use client';

import { useI18n } from '@/lib/i18n/context';

export default function TermsPage() {
  const { t, lang } = useI18n();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('terms.title')}</h1>
          <p className="text-gray-300">{isAr ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-8">
          {[
            {
              title: isAr ? '1. قبول الشروط' : '1. Acceptance of Terms',
              content: isAr
                ? 'باستخدامك لموقع CalcHub، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الموقع.'
                : 'By using CalcHub, you agree to be bound by these terms and conditions. If you do not agree to these terms, please do not use the website.',
            },
            {
              title: isAr ? '2. استخدام الخدمة' : '2. Use of Service',
              content: isAr
                ? 'يُسمح لك باستخدام CalcHub للأغراض الشخصية وغير التجارية فقط. لا يجوز لك نسخ أو توزيع أو تعديل أي محتوى من الموقع دون إذن مسبق منا.'
                : 'You may use CalcHub for personal and non-commercial purposes only. You may not copy, distribute, or modify any content from the website without our prior permission.',
            },
            {
              title: isAr ? '3. دقة المعلومات' : '3. Accuracy of Information',
              content: isAr
                ? 'نسعى جاهدين لضمان دقة جميع الحاسبات والأدوات. ومع ذلك، نتحفظ بأن النتائج مقدمة "كما هي" دون ضمان للدقة الكاملة. يجب عليك التحقق من النتائج المهمة مع متخصصين قبل اتخاذ قرارات حاسمة.'
                : 'We strive to ensure the accuracy of all calculators and tools. However, we reserve that results are provided "as is" without guarantee of complete accuracy. You should verify important results with professionals before making critical decisions.',
            },
            {
              title: isAr ? '4. إخلاء المسؤولية' : '4. Limitation of Liability',
              content: isAr
                ? 'لن تكون CalcHub مسؤولة عن أي خسائر أو أضرار ناجمة عن استخدام الموقع أو الاعتماد على نتائج الحاسبات. الاستخدام على مسؤوليتك الخاصة.'
                : 'CalcHub shall not be liable for any losses or damages arising from the use of the website or reliance on calculator results. Use is at your own risk.',
            },
            {
              title: isAr ? '5. الملكية الفكرية' : '5. Intellectual Property',
              content: isAr
                ? 'جميع المحتويات والعلامات التجارية وحقوق الملكية الفكرية المرتبطة بـ CalcHub هي ملك لنا. يُحظر استخدامها دون إذن صريح.'
                : 'All content, trademarks, and intellectual property associated with CalcHub are owned by us. Their use without explicit permission is prohibited.',
            },
            {
              title: isAr ? '6. التغييرات في الخدمة' : '6. Changes to Service',
              content: isAr
                ? 'نحتفظ بالحق في تعديل أو إنهاء الخدمة أو أي جزء منها في أي وقت دون إشعار مسبق.'
                : 'We reserve the right to modify or discontinue the service or any part thereof at any time without prior notice.',
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{section.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
