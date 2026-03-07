// app/layout.tsx
import type { Metadata } from 'next';
import { Syne, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIFloatingButton from '@/components/ai/AIFloatingButton';

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PlacementIntel — Ace Your Placement',
  description: 'The comprehensive interview preparation platform built exclusively for LNMIIT students.',
  keywords: 'placement preparation, interview questions, resume analyzer, DSA roadmap, Google interview, Microsoft interview',
  openGraph: {
    title: 'PlacementIntel',
    description: 'AI-powered placement preparation for engineering students.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-[#030712] text-[#f8fafc]`}>
        <div className="grain-overlay"></div>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="relative flex flex-col min-h-screen z-10">
          <Navbar />
          <main id="main-content" className="flex-grow">
            {children}
          </main>
          <AIFloatingButton />
          <Footer />
        </div>
      </body>
    </html>
  );
}
