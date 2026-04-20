'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../components/admin/Sidebar';
import { isAuthed } from '../../lib/admin-store';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoginPage && !isAuthed()) {
      router.replace('/admin/login');
    }
  }, [pathname, isLoginPage, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 bg-zinc-950 border-b border-zinc-900 md:hidden z-50">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          aria-label="Открыть меню"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-zinc-300 text-sm font-medium">Mango Admin</span>
        <div className="w-8" />
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-60 pt-14 md:pt-0 p-4 md:p-8 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
