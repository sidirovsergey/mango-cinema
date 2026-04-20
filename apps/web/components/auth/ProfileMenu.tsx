'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { logout, useUser } from '@/lib/user-store';
import { openAuthModal, openCoinStoreModal, openSubscriptionModal } from '@/lib/modal-store';

export default function ProfileMenu() {
  const user = useUser();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal()}
        className="rounded-xl bg-mango px-4 py-2 text-sm font-bold text-white hover:bg-orange-500 active:scale-[0.98] transition-all"
      >
        Войти
      </button>
    );
  }

  const lastFour = user.phone.replace(/\D/g, '').slice(-4);
  const avatarLetter = '+';

  const subActive = user.subscription.active && user.subscription.expiresAt && new Date(user.subscription.expiresAt) > new Date();

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #FF6B35, #ff3d00)' }}
        aria-label="Профиль"
      >
        {avatarLetter}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl py-2 z-50">
          {/* Phone */}
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-xs text-zinc-500">Аккаунт</p>
            <p className="text-sm font-semibold text-white mt-0.5">
              +7 ••• ••• {lastFour}
            </p>
          </div>

          {/* My Profile */}
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center px-4 py-3 hover:bg-zinc-800 transition-colors text-sm text-zinc-300"
          >
            Мой профиль
          </Link>

          <div className="border-t border-zinc-800 my-1" />

          {/* Subscription row */}
          <button
            onClick={() => { setOpen(false); openSubscriptionModal(); }}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm text-zinc-300">Подписка</span>
            {subActive ? (
              <span className="text-xs font-semibold text-emerald-400">
                Активна до {formatDate(user.subscription.expiresAt!)}
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Нет подписки</span>
            )}
          </button>

          {/* Coins row */}
          <button
            onClick={() => { setOpen(false); openCoinStoreModal(); }}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm text-zinc-300">Монеты</span>
            <span className="text-sm font-semibold text-white flex items-center gap-1">
              🪙 {user.coinBalance}
            </span>
          </button>

          {/* Divider */}
          <div className="border-t border-zinc-800 my-1" />

          {/* Logout */}
          <button
            onClick={() => { setOpen(false); logout(); }}
            className="flex w-full items-center px-4 py-3 text-sm text-red-400 hover:bg-zinc-800 transition-colors"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
