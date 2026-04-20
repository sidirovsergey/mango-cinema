import type { Series } from '@/lib/catalog';
import SeriesCompactCard from './SeriesCompactCard';

interface Props {
  title: string;
  series: Series[];
}

export default function ContentRow({ title, series }: Props) {
  if (series.length === 0) return null;

  return (
    <div className="relative mb-10 px-4 md:px-12">
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {series.map((s) => (
          <SeriesCompactCard key={s.slug} series={s} />
        ))}
      </div>
    </div>
  );
}
