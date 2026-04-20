'use client';

import Link from 'next/link';
import type { Series, Episode } from '@/lib/catalog';
import type { EpisodeProgress } from '@/lib/progress-store';

interface Props {
  series: Series;
  episode: Episode;
  progress: EpisodeProgress;
}

export default function ContinueWatchingCard({ series, episode, progress }: Props) {
  const pct = progress.durationSec > 0
    ? Math.min(1, progress.positionSec / progress.durationSec)
    : 0;

  return (
    <Link
      href={`/watch/${series.slug}?ep=${episode.number}`}
      className="group block flex-shrink-0 w-[180px] md:w-[220px] snap-start"
    >
      {/* 2:3 poster */}
      <div
        className="relative w-full overflow-hidden rounded-md bg-zinc-900"
        style={{ aspectRatio: '2 / 3' }}
      >
        <img
          src={series.posterUrl}
          alt={series.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* hover ring */}
        <div className="absolute inset-0 rounded-md ring-0 group-hover:ring-2 ring-white/20 transition-all duration-300" />
        {/* bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
        {/* episode label */}
        <div className="absolute bottom-5 left-2 right-2">
          <p className="text-xs text-white/70 line-clamp-1">Эп. {episode.number} · {episode.title}</p>
        </div>
        {/* progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
      </div>

      <p className="mt-2 text-sm font-medium text-white line-clamp-1">
        {series.title}
      </p>
      <p className="text-xs text-zinc-400 mt-0.5">
        {Math.round(pct * 100)}% просмотрено
      </p>
    </Link>
  );
}
