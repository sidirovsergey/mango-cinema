import Link from 'next/link';
import type { Series } from '@/lib/catalog';

interface Props {
  series: Series;
}

export default function SeriesCompactCard({ series }: Props) {
  return (
    <Link
      href={`/series/${series.slug}`}
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
        {/* subtle shadow glow on hover */}
        <div className="absolute inset-0 rounded-md ring-0 group-hover:ring-2 ring-white/20 transition-all duration-300" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      <p className="mt-2 text-sm font-medium text-white line-clamp-1">
        {series.title}
      </p>
      <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
        {series.tagline || series.genres[0]}
      </p>
    </Link>
  );
}
