import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const GlobalModals = dynamic(() => import('@/components/auth/GlobalModals'), { ssr: false });

export const metadata: Metadata = {
  title: 'Mango Cinema',
  description: 'Вертикальные AI-микродрамы',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}
        <GlobalModals />
      </body>
    </html>
  );
}
