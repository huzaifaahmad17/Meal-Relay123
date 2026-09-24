import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: {
    default: 'Meal Relay | Jaipur Food Rescue Network',
    template: '%s | Meal Relay',
  },
  description:
    'Connect surplus food from restaurants and homes with NGOs and volunteers. Real-time tracking, smart matching, and full transparency — built for a hunger-free India.',
  keywords: [
    'food redistribution',
    'food waste',
    'NGO',
    'volunteer',
    'India',
    'zero waste',
    'food donation',
    'food rescue',
  ],
  authors: [{ name: 'Meal Relay Team' }],
  openGraph: {
    title: 'Meal Relay | Jaipur Food Rescue Network',
    description:
      'Turn food waste into hope. Connect with NGOs and volunteers to redistribute surplus food in real time.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
