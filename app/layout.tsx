import type { Metadata } from 'next';
import { JetBrains_Mono, Source_Sans_3, Space_Grotesk } from 'next/font/google';

import './globals.css';

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Prowl QA Hub | Community Hunt Library',
  description: 'Browse verified community Prowl hunts and submit new templates via pull request.',
  icons: {
    icon: '/assets/brand/mascot.png',
    apple: '/assets/brand/mascot.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>{children}</body>
    </html>
  );
}
