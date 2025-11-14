import '@/index.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { NewsletterPopup } from '@/components/NewsletterPopup';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import AnalyticsClient from './analytics-client';
import { Suspense } from 'react';

export const metadata = {
  title: 'Babyfiction',
  description: 'Modern, slick shopping experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsClient />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
            <NewsletterPopup />
            <ChatbotWidget />
          </div>
        </Providers>
      </body>
    </html>
  );
}


