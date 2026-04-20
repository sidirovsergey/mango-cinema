'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, logout } from '@/lib/user-store';
import { openSubscriptionModal, openCoinStoreModal } from '@/lib/modal-store';
import { useWatchlist, toggleWatchlist } from '@/lib/watchlist-store';
import { useProgress, getContinueWatching } from '@/lib/progress-store';
import { CATALOG } from '@/lib/catalog';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `+7 ••• ••• ${last4}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} д назад`;
}

const PLAN_NAMES: Record<string, string> = {
  month: 'Месяц',
  quarter: 'Квартал',
  year: 'Год',
};

const MOCK_PAYMENTS = [
  { date: '20.04.2026', desc: 'Подписка Год', amount: '1 990 ₽' },
  { date: '18.04.2026', desc: '700 монет', amount: '499 ₽' },
  { date: '15.04.2026', desc: 'Подписка Месяц', amount: '299 ₽' },
];

export default function ProfilePage() {
  const router = useRouter();
  const user = useUser();
  const watchlist = useWatchlist();
  useProgress(); // subscribe to re-render on progress changes

  // If not authed after hydration, redirect
  useEffect(() => {
    // useUser returns null on SSR and on first render; wait a tick
    const t = setTimeout(() => {
      if (user === null) {
        router.push('/');
      }
    }, 300);
    return () => clearTimeout(t);
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Войдите, чтобы открыть профиль</p>
          <Link
            href="/"
            className="rounded-xl bg-mango px-6 py-3 text-sm font-bold text-white"
          >
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const subActive =
    user.subscription.active &&
    user.subscription.expiresAt &&
    new Date(user.subscription.expiresAt) > new Date();

  const avatarLetter = (user.phone.replace(/\D/g, '')[1] ?? '7');

  const continueWatching = getContinueWatching();
  const recentActivity = continueWatching.slice(0, 5);

  const watchlistSeries = CATALOG.filter((s) => watchlist.includes(s.slug));
  const showPayments = subActive || user.coinBalance > 0;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Back nav */}
      <div className="sticky top-0 z-10 border-b border-white/5 bg-black/80 backdrop-blur px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-base font-semibold">Профиль</h1>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* 1. Header: avatar + phone + member since */}
        <div className="flex items-center gap-5">
          <div
            className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #FF6B35, #ff3d00)' }}
          >
            {avatarLetter}
          </div>
          <div>
            <p className="text-xl font-bold">{maskPhone(user.phone)}</p>
            <p className="mt-1 text-sm text-zinc-400">
              С нами с {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* 2. Subscription card */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Подписка</p>
          {subActive ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">Подписка активна</span>
              </div>
              <p className="text-white font-medium">
                {PLAN_NAMES[user.subscription.plan ?? ''] ?? user.subscription.plan}
              </p>
              <p className="text-sm text-zinc-400">
                Продлевается {formatDate(user.subscription.expiresAt!)}
              </p>
              <button
                className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-300 transition"
                onClick={() => alert('Отмена доступна в ЛК ЮKassa')}
              >
                Отменить подписку
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm">Нет активной подписки</p>
              <button
                onClick={() => openSubscriptionModal()}
                className="rounded-xl bg-mango px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-500 transition active:scale-95"
              >
                Оформить
              </button>
            </div>
          )}
        </div>

        {/* 3. Coin balance card */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Монеты</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🪙</span>
              <span className="text-3xl font-bold">{user.coinBalance}</span>
            </div>
            <button
              onClick={() => openCoinStoreModal()}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition active:scale-95"
            >
              Пополнить
            </button>
          </div>
        </div>

        {/* 4. Watchlist */}
        {watchlistSeries.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Мой список</p>
            <div
              className="flex gap-3 overflow-x-auto scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {watchlistSeries.map((s) => (
                <div key={s.slug} className="relative flex-shrink-0 w-28">
                  <Link href={`/series/${s.slug}`}>
                    <div
                      className="relative w-full overflow-hidden rounded-md bg-zinc-800"
                      style={{ aspectRatio: '2 / 3' }}
                    >
                      <img
                        src={s.posterUrl}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-1 text-xs text-white/80 line-clamp-1">{s.title}</p>
                  </Link>
                  <button
                    onClick={() => toggleWatchlist(s.slug)}
                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white text-xs hover:bg-black transition"
                    aria-label="Убрать из списка"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Recent activity */}
        {recentActivity.length > 0 && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">Недавнее</p>
            <div className="space-y-3">
              {recentActivity.map(({ series, episode, progress }) => {
                const pct = progress.durationSec > 0
                  ? Math.round((progress.positionSec / progress.durationSec) * 100)
                  : 0;
                return (
                  <Link
                    key={episode.id}
                    href={`/watch/${series.slug}?ep=${episode.number}`}
                    className="flex items-center gap-3 group"
                  >
                    <img
                      src={series.posterUrl}
                      alt={series.title}
                      className="h-12 w-8 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-mango transition">
                        {series.title} · Эпизод {episode.number}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {pct}% просмотрено · {timeAgo(progress.lastWatchedAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Payment history */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3">История платежей</p>
          {showPayments ? (
            <div className="space-y-3">
              {MOCK_PAYMENTS.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-white">{p.desc}</span>
                    <span className="ml-2 text-zinc-500 text-xs">{p.date}</span>
                  </div>
                  <span className="text-white font-semibold">{p.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">Пока пусто</p>
          )}
        </div>

        {/* 7. Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl border border-red-500/30 py-4 text-base font-semibold text-red-400 hover:bg-red-500/10 transition active:scale-[0.98]"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
