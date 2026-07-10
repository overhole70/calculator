import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieBanner } from '@/components/layout/CookieBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://calchub.net'),
  title: {
    default: 'CalcHub – Smart Calculators & Tools for Everyone',
    template: '%s | CalcHub',
  },
  description: 'Your comprehensive reference for smart calculators and tools across math, finance, health, science, and more. Free, fast, and accurate.',
  keywords: ['calculator', 'online calculator', 'free tools', 'math calculator', 'finance calculator', 'unit converter', 'health calculator'],
  authors: [{ name: 'CalcHub' }],
  creator: 'CalcHub',
  publisher: 'CalcHub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://calchub.net',
    siteName: 'CalcHub',
    title: 'CalcHub – Smart Calculators & Tools for Everyone',
    description: 'Your comprehensive reference for smart calculators and tools across math, finance, health, science, and more.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CalcHub - Smart Calculators & Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalcHub – Smart Calculators & Tools',
    description: 'Free smart calculators and tools for math, finance, health, and everyday life.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://calchub.net',
    languages: {
      'en': 'https://calchub.net',
      'ar': 'https://calchub.net',
      'fr': 'https://calchub.net',
      'es': 'https://calchub.net',
      'de': 'https://calchub.net',
      'zh': 'https://calchub.net',
      'hi': 'https://calchub.net',
      'pt': 'https://calchub.net',
      'ru': 'https://calchub.net',
      'ja': 'https://calchub.net',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('calchub-theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300 min-h-screen">
        <I18nProvider>
          <Header />
          <main className="pt-16">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
