'use client';

import { isAuthed, unlockEpisode, useUser } from '@/lib/user-store';
import { openAuthModal, openCoinStoreModal, openSubscriptionModal } from '@/lib/modal-store';
import { EPISODE_UNLOCK_COST } from '@/lib/plans';
import type { Episode, Series } from '@/lib/catalog';

interface Props {
  episode: Episode;
  series: Series;
  onUnlocked(): void;
}

export default function EpisodePaywall({ episode, series, onUnlocked }: Props) {
  const user = useUser();
  const authed = !!user;

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthed()) {
      openAuthModal('mango-modal-open-subscription');
    } else {
      openSubscriptionModal();
    }
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthed()) {
      openAuthModal('mango-modal-open-coins');
      return;
    }
    const balance = user?.coinBalance ?? 0;
    if (balance < EPISODE_UNLOCK_COST) {
      openCoinStoreModal();
      return;
    }
    const ok = unlockEpisode(episode.id, EPISODE_UNLOCK_COST);
    if (ok) onUnlocked();
  };

  const handleAuth = (e: React.MouseEvent) => {
    e.stopPropagation();
    openAuthModal();
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col justify-end"
      style={{
        backgroundImage: `url(${series.bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />

      {/* Content */}
      <div className="relative z-10 px-6 pb-8 pt-4 flex flex-col items-center text-center">
        <div className="text-4xl mb-3">🔒</div>
        <p className="text-lg font-bold text-white mb-1">
          Этот эпизод доступен по подписке
        </p>
        <p className="text-sm text-zinc-300 mb-6">
          Эпизод {episode.number} · {episode.title}
        </p>

        {!authed && (
          <button
            onClick={handleAuth}
            className="mb-4 text-sm text-zinc-300 underline underline-offset-2 hover:text-white transition-colors"
          >
            Войти / Зарегистрироваться
          </button>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={handleSubscribe}
            className="w-full rounded-xl bg-mango py-3 text-sm font-bold text-white hover:bg-orange-500 active:scale-[0.98] transition-all"
          >
            Оформить подписку
          </button>
          <button
            onClick={handleUnlock}
            className="w-full rounded-xl border border-zinc-600 bg-zinc-800/80 py-3 text-sm font-semibold text-white hover:bg-zinc-700 active:scale-[0.98] transition-all"
          >
            Разблокировать за {EPISODE_UNLOCK_COST} монет
          </button>
        </div>
      </div>
    </div>
  );
}
