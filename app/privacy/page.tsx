'use client';

import { useI18n } from '@/lib/i18n/context';

export default function PrivacyPage() {
  const { t, lang } = useI18n();

  const isAr = lang === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('privacy.title')}</h1>
          <p className="text-gray-300">{isAr ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 space-y-8 prose dark:prose-invert max-w-none">
          {[
            {
              title: isAr ? '1. المعلومات التي نجمعها' : '1. Information We Collect',
              content: isAr
                ? 'لا تجمع CalcHub أي معلومات شخصية تعريفية بشكل افتراضي. تعمل جميع الحسابات محلياً في متصفحك. قد نجمع بيانات استخدام مجهولة الهوية (مثل عدد الزيارات، أنواع الأجهزة) من خلال خدمات التحليل مثل Google Analytics لتحسين تجربة المستخدم.'
                : 'CalcHub does not collect any personally identifiable information by default. All calculations are performed locally in your browser. We may collect anonymized usage data (such as visit counts, device types) through analytics services like Google Analytics to improve user experience.',
            },
            {
              title: isAr ? '2. ملفات تعريف الارتباط (Cookies)' : '2. Cookies',
              content: isAr
                ? 'نستخدم ملفات تعريف الارتباط للأغراض التالية: (أ) تذكر تفضيلاتك كالوضع الداكن ولغة الواجهة، (ب) تحليل استخدام الموقع من خلال Google Analytics. يمكنك إلغاء تفعيل ملفات تعريف الارتباط في إعدادات متصفحك.'
                : 'We use cookies for the following purposes: (a) Remembering your preferences such as dark mode and language settings, (b) Analyzing website usage through Google Analytics. You can disable cookies in your browser settings.',
            },
            {
              title: isAr ? '3. الإعلانات' : '3. Advertising',
              content: isAr
                ? 'قد نعرض إعلانات من خلال Google AdSense. يستخدم Google ملفات تعريف الارتباط لعرض إعلانات ذات صلة باهتماماتك. يمكنك الاطلاع على سياسة خصوصية Google لمزيد من المعلومات حول كيفية استخدامهم لبياناتك.'
                : 'We may display advertisements through Google AdSense. Google uses cookies to show ads relevant to your interests. You can review Google\'s privacy policy for more information about how they use your data.',
            },
            {
              title: isAr ? '4. أمان البيانات' : '4. Data Security',
              content: isAr
                ? 'نتخذ تدابير أمنية معقولة لحماية أي بيانات نجمعها. جميع الاتصالات مشفرة باستخدام HTTPS. لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة.'
                : 'We take reasonable security measures to protect any data we collect. All communications are encrypted using HTTPS. We do not sell or share your personal data with third parties.',
            },
            {
              title: isAr ? '5. حقوقك' : '5. Your Rights',
              content: isAr
                ? 'لديك الحق في: طلب الاطلاع على بياناتك، طلب حذف بياناتك، إلغاء الاشتراك في التحليلات عبر إلغاء تفعيل ملفات تعريف الارتباط. للتواصل معنا بشأن حقوق الخصوصية، راسلنا عبر: privacy@calchub.net'
                : 'You have the right to: Request access to your data, request deletion of your data, opt out of analytics by disabling cookies. To contact us about privacy rights, email us at: privacy@calchub.net',
            },
            {
              title: isAr ? '6. تغييرات على هذه السياسة' : '6. Changes to This Policy',
              content: isAr
                ? 'قد نحدث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات جوهرية من خلال نشر إشعار على موقعنا.'
                : 'We may update this privacy policy from time to time. We will notify you of any significant changes by posting a notice on our website.',
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
