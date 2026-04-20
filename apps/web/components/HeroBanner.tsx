'use client';

import Link from 'next/link';
import type { Series } from '@/lib/catalog';

interface Props {
  series: Series;
}

export default function HeroBanner({ series }: Props) {
  return (
    <section className="relative h-[65vh] md:h-[70vh] w-full overflow-hidden">
      <img
        src={series.bannerUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* bottom-up dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      {/* left-side dark gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent md:from-black/80" />

      <div className="relative z-10 flex flex-col justify-end h-full max-w-2xl px-4 md:px-12 pb-12 md:pb-20">
        <span className="text-mango text-xs md:text-sm font-semibold tracking-widest uppercase mb-3">
          Mango Original
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
          {series.title}
        </h1>
        <p className="text-base md:text-lg text-zinc-300 mb-6 line-clamp-3 max-w-lg">
          {series.tagline}
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/watch/${series.slug}`}
            className="flex items-center gap-2 bg-white text-black font-semibold rounded-md px-6 py-3 hover:bg-zinc-200 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11-6.86a1 1 0 0 0 0-1.74l-11-6.86A1 1 0 0 0 8 5.14z" />
            </svg>
            Смотреть
          </Link>
          <Link
            href={`/series/${series.slug}`}
            className="flex items-center gap-2 bg-zinc-700/70 backdrop-blur text-white font-semibold rounded-md px-6 py-3 hover:bg-zinc-600/80 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022zM12 9a.75.75 0 1 0 0-1.5A.75.75 0 0 0 12 9z"
                clipRule="evenodd"
              />
            </svg>
            Подробнее
          </Link>
        </div>
      </div>
    </section>
  );
}
