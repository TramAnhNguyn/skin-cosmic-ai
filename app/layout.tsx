import type { ReactNode } from 'react';
import './globals.css';
import AuthProvider from './components/AuthProvider';

export const metadata = {
  title: 'SkinCosmic AI',
  description: 'Tu van cham soc da toi gian',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
