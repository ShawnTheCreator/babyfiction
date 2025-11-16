// imports
import '@/index.css';
import Providers from './providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AnalyticsClient from './analytics-client';
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Rubik_Burned, Rubik_Dirt, Rubik_Doodle_Shadow, Rubik_Distressed, Inter } from 'next/font/google';
import { ChatbotWidget } from '@/components/ChatbotWidget'; // removed

const rubikBurned = Rubik_Burned({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-logo',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const rubikDirt = Rubik_Dirt({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nav',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const rubikDoodleShadow = Rubik_Doodle_Shadow({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-headers',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const rubikDistressed = Rubik_Distressed({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const inter = Inter({ 
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: 'Babyfiction',
  description: 'Modern, slick shopping experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubikBurned.variable} ${rubikDirt.variable} ${rubikDoodleShadow.variable} ${rubikDistressed.variable} ${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <Suspense fallback={null}>
            <AnalyticsClient />
          </Suspense>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-24 md:pt-28">{children}</main>
            <Footer />
          </div>
          {/* Chatbot mount removed to restore original layout */}
        </Providers>
      </body>
    </html>
  );
}


