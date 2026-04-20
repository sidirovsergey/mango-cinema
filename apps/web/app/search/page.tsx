'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import SeriesCompactCard from '@/components/SeriesCompactCard';
import ContentRow from '@/components/ContentRow';
import { searchCatalog } from '@/lib/search';
import { CATALOG } from '@/lib/catalog';

function SearchResults() {
  const params = useSearchParams();
  const q = params.get('q') ?? '';
  const results = q.trim() ? searchCatalog(q) : [];

  const seriesResults = results.filter((r) => r.type === 'series').map((r) => {
    if (r.type === 'series') return r.series;
    return null;
  }).filter(Boolean) as import('@/lib/catalog').Series[];

  const episodeResults = results.filter((r) => r.type === 'episode') as import('@/lib/search').SearchResultEpisode[];

  const hasResults = results.length > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {q.trim() ? (
          <h1 className="text-2xl font-bold mb-6">
            Результаты для &ldquo;{q}&rdquo;
          </h1>
        ) : (
          <h1 className="text-2xl font-bold mb-6 text-zinc-400">Введите запрос</h1>
        )}

        {!q.trim() || hasResults ? (
          <>
            {/* Series section */}
            {seriesResults.length > 0 && (
              <section className="mb-10">
                <h2 className="text-base font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                  Сериалы
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {seriesResults.map((s) => (
                    <SeriesCompactCard key={s.slug} series={s} />
                  ))}
                </div>
              </section>
            )}

            {/* Episodes section */}
            {episodeResults.length > 0 && (
              <section className="mb-10">
                <h2 className="text-base font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                  Эпизоды
                </h2>
                <div className="flex flex-col gap-1">
                  {episodeResults.map((r) => (
                    <Link
                      key={`${r.series.slug}-ep-${r.episode.number}`}
                      href={`/watch/${r.series.slug}?ep=${r.episode.number}`}
                      className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-zinc-900 transition-colors"
                    >
                      <img
                        src={r.series.posterUrl}
                        alt={r.series.title}
                        width={48}
                        height={72}
                        className="rounded object-cover shrink-0"
                        style={{ width: 48, height: 72 }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white line-clamp-1">{r.episode.title}</p>
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{r.snippet}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <p className="text-xl text-zinc-400 mb-2">Ничего не найдено.</p>
            <p className="text-sm text-zinc-600">Попробуйте другой запрос.</p>
          </div>
        )}

        {/* Suggestions / Popular */}
        {(!hasResults || !q.trim()) && (
          <div className="-mx-4 md:-mx-8">
            <ContentRow title="Популярное" series={CATALOG} />
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse mb-6" />
        </div>
      </main>
    }>
      <SearchResults />
    </Suspense>
  );
}
