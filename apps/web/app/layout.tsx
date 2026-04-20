import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const GlobalModals = dynamic(() => import('@/components/auth/GlobalModals'), { ssr: false });
const Toast = dynamic(() => import('@/components/Toast'), { ssr: false });

export const metadata: Metadata = {
  title: 'Mango Cinema',
  description: 'Вертикальные AI-микросериалы',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Mango',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF6B35',
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
        <Toast />
      </body>
    </html>
  );
}
