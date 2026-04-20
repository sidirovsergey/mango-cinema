import Link from 'next/link';
import Image from 'next/image';
import type { Series } from '@/lib/catalog';

interface Props {
  series: Series;
}

export default function SeriesCard({ series }: Props) {
  return (
    <Link href={`/series/${series.slug}`} className="group block">
      {/* 2:3 poster */}
      <div
        className="relative w-full overflow-hidden rounded-xl bg-zinc-900"
        style={{ aspectRatio: '2 / 3' }}
      >
        <Image
          src={series.posterUrl}
          alt={series.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        {/* subtle bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* title + genres */}
      <div className="mt-2 px-0.5">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-white">
          {series.title}
        </p>
        <p className="mt-1 text-xs text-white/40 truncate">
          {series.genres.join(' · ')}
        </p>
      </div>
    </Link>
  );
}
