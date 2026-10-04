import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Stemly — AI 音樂分軌工作台',
  description: '用 AI 拆分人聲與樂器、微調每條音軌，並獲得演奏回饋。',
  openGraph: {
    title: 'Stemly — AI 音樂分軌工作台',
    description: '拆分人聲與樂器、微調每條音軌，並獲得演奏回饋。',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stemly — AI 音樂分軌工作台',
    description: '拆分人聲與樂器、微調每條音軌，並獲得演奏回饋。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
