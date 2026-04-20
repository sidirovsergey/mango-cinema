import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CATALOG } from '@/lib/catalog';
import Header from '@/components/Header';
import EpisodeListItem from '@/components/EpisodeListItem';
import WatchlistButton from '@/components/WatchlistButton';
import ContentRow from '@/components/ContentRow';
import { getSimilarSeries } from '@/lib/recommendations';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return CATALOG.map((s) => ({ slug: s.slug }));
}

export default function SeriesPage({ params }: Props) {
  const series = CATALOG.find((s) => s.slug === params.slug);
  if (!series) notFound();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Banner */}
      <div className="relative w-full" style={{ aspectRatio: '3 / 2', maxHeight: 420 }}>
        <Image
          src={series.bannerUrl}
          alt={series.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* title + description over gradient */}
        <div className="absolute bottom-0 inset-x-0 px-4 pb-5">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {series.genres.map((g) => (
              <span
                key={g}
                className="rounded-full border border-white/20 px-2 py-0.5 text-xs text-white/60"
              >
                {g}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold leading-tight">{series.title}</h1>
          <p className="mt-1 text-sm text-white/70 leading-snug max-w-sm">
            {series.description}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-lg px-4 pt-5 pb-2 flex flex-col gap-3">
        <Link
          href={`/watch/${series.slug}?ep=1`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-mango py-3.5 text-base font-bold text-white shadow-lg active:scale-95 transition-transform"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Смотреть
        </Link>
        <WatchlistButton slug={series.slug} />
      </div>

      {/* Episode list */}
      <div className="mx-auto max-w-lg px-4 pb-10">
        <h2 className="mt-4 mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">
          Эпизоды — {series.episodes.length}
        </h2>
        <div className="divide-y divide-white/5">
          {series.episodes.map((ep) => (
            <EpisodeListItem key={ep.id} episode={ep} seriesSlug={series.slug} />
          ))}
        </div>
      </div>

      {/* Similar series */}
      <div className="pb-10">
        <ContentRow title="Похожие сериалы" series={getSimilarSeries(series.slug, 4)} />
      </div>
    </div>
  );
}
