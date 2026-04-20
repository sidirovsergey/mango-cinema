import Link from 'next/link';
import type { Episode } from '@/lib/catalog';

interface Props {
  episode: Episode;
  seriesSlug: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function EpisodeListItem({ episode, seriesSlug }: Props) {
  return (
    <Link
      href={`/watch/${seriesSlug}?ep=${episode.number}`}
      className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-white/5 transition-colors"
    >
      {/* episode number */}
      <span className="w-6 shrink-0 text-center text-sm font-semibold text-white/40">
        {episode.number}
      </span>

      {/* title + duration */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{episode.title}</p>
        <p className="mt-0.5 text-xs text-white/40">{formatDuration(episode.duration)}</p>
      </div>

      {/* badge */}
      {episode.isFree ? (
        <span className="shrink-0 rounded-full bg-mango/20 px-2 py-0.5 text-xs font-semibold text-mango">
          FREE
        </span>
      ) : (
        <svg
          className="h-4 w-4 shrink-0 text-white/30"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-label="Заблокировано"
        >
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
      )}
    </Link>
  );
}
