'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { setAuthed } from '../../lib/admin-store';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/series', label: 'Серии' },
  { href: '/admin/studios', label: 'Студии' },
  { href: '/admin/plans', label: 'Планы и монеты' },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/payments', label: 'Платежи' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    setAuthed(false);
    router.push('/admin/login');
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col"
      style={{ background: '#0F0F0F', borderRight: '1px solid #1a1a1a' }}
    >
      <div className="px-6 py-5 border-b border-zinc-800">
        <span className="text-[#FF6B35] font-bold text-base leading-tight block">
          Mango Cinema
        </span>
        <span className="text-zinc-500 text-xs">Admin Panel</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'text-white bg-zinc-800 border-l-2 border-[#FF6B35] pl-[10px]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-left"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
