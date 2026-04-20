'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../components/admin/Sidebar';
import { isAuthed } from '../../lib/admin-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isAuthed()) {
      router.replace('/admin/login');
    }
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
