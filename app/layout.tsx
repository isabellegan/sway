import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sway | Agentic Orchestration',
  description:
    'Sway is a real-time multi-agent orchestration platform for engineering war rooms. Coordinate distributed systems, resolve race conditions, and deploy infrastructure — all from a single split-screen command surface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-zinc-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden bg-zinc-950 text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
