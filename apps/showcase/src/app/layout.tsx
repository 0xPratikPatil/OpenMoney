import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Sidebar } from '@/components/sidebar';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'OpenMoney · Design System',
  description:
    'A dark-first, production-grade component library for building premium financial interfaces. TypeScript, React 19, Tailwind v4, motion/react.',
  keywords: ['design system', 'react components', 'ui library', 'typescript', 'tailwind', 'finance'],
  openGraph: {
    title: 'OpenMoney · Design System',
    description: 'Premium components for the modern web. Dark-first, motion-rich, production-grade.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-surface-0 text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto scroll-smooth">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
