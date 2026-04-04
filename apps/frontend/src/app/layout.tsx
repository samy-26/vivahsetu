import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'VivahSetu - Brahmana Matrimonial', template: '%s | VivahSetu' },
  description: 'Find your perfect life partner from the Brahmana community. Verified profiles, secure matchmaking.',
  keywords: ['matrimonial', 'brahmana', 'marriage', 'shaadi', 'vivah'],
  openGraph: {
    title: 'VivahSetu - Brahmana Matrimonial',
    description: 'Find your perfect life partner from the Brahmana community.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              success: { style: { background: '#27ae60', color: '#fff' } },
              error: { style: { background: '#B5341A', color: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
