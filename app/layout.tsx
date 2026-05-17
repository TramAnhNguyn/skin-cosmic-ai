import type { ReactNode } from 'react';
import { Outfit } from 'next/font/google';
import './globals.css';
import AuthProvider from './components/AuthProvider';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: 'SkinCosmic AI',
  description: 'Tư vấn chăm sóc da tối giản',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={outfit.variable}>
      <body className="font-sans antialiased text-slate-800 bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
