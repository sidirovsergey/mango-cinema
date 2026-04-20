'use client';

import { CATALOG } from '@/lib/catalog';
import { getContinueWatching, useProgress } from '@/lib/progress-store';
import { useWatchlist } from '@/lib/watchlist-store';
import ContentRow from '@/components/ContentRow';
import ContinueWatchingCard from '@/components/ContinueWatchingCard';

export default function HomeClientRows() {
  // Subscribing to these causes re-render when data changes
  useProgress();
  const watchlist = useWatchlist();

  const continueWatching = getContinueWatching();
  const watchlistSeries = CATALOG.filter((s) => watchlist.includes(s.slug));

  return (
    <>
      {/* Continue Watching row */}
      {continueWatching.length > 0 && (
        <div className="relative mb-10 px-4 md:px-12">
          <h2 className="text-xl font-semibold text-white mb-3">Продолжить смотреть</h2>
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {continueWatching.map(({ series, episode, progress }) => (
              <ContinueWatchingCard
                key={episode.id}
                series={series}
                episode={episode}
                progress={progress}
              />
            ))}
          </div>
        </div>
      )}

      {/* My List row */}
      {watchlistSeries.length > 0 && (
        <ContentRow title="Мой список" series={watchlistSeries} />
      )}
    </>
  );
}
