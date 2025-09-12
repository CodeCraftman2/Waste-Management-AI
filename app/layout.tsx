import React from 'react';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '../components/Providers';
import CustomCursor from '../components/CustomCursor';
import '../lib/translateService';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ScrapAI',
  description: 'AI-powered waste management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <CustomCursor />
          {children}
        </Providers>
      </body>
    </html>
  );
}
