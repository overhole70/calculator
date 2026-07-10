'use client';

import { useState } from 'react';
import { Mail, MessageSquare, User, Send, CheckCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function ContactPage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-gradient-to-br from-indigo-950 via-gray-950 to-purple-950 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('contact.title')}</h1>
          <p className="text-gray-300 text-lg">
            {lang === 'ar' ? 'نحن نرحب بأسئلتك ومقترحاتك' : lang === 'fr' ? 'Nous accueillons vos questions et suggestions' : 'We welcome your questions and suggestions'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {submitted ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('contact.success')}</h2>
            <p className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'سنرد عليك في أقرب وقت ممكن' : lang === 'fr' ? 'Nous vous répondrons dès que possible' : 'We\'ll get back to you as soon as possible'}
            </p>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
              className="mt-6 px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium">
              {lang === 'ar' ? 'إرسال رسالة أخرى' : 'Send Another Message'}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <User className="w-4 h-4 inline mr-1" />{t('contact.name')} *
                  </label>
                  <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder={t('contact.name')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Mail className="w-4 h-4 inline mr-1" />{t('contact.email')} *
                  </label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="example@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {lang === 'ar' ? 'الموضوع' : lang === 'fr' ? 'Sujet' : 'Subject'} *
                </label>
                <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                  placeholder={lang === 'ar' ? 'موضوع الرسالة' : 'Message subject'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <MessageSquare className="w-4 h-4 inline mr-1" />{t('contact.message')} *
                </label>
                <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                  placeholder={t('contact.message')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {t('contact.send')}
              </button>
            </form>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">
            {lang === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {lang === 'ar' ? '📧 البريد الإلكتروني: support@calchub.net' : '📧 Email: support@calchub.net'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {lang === 'ar' ? '⏰ وقت الاستجابة: 24-48 ساعة في أيام العمل' : '⏰ Response time: 24-48 hours on business days'}
          </p>
        </div>
      </div>
    </div>
  );
}
