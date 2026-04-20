import { CATALOG } from '@/lib/catalog';
import SeriesCard from '@/components/SeriesCard';
import Header from '@/components/Header';

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
          Сериалы
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CATALOG.map((series) => (
            <SeriesCard key={series.slug} series={series} />
          ))}
        </div>
      </main>
    </div>
  );
}
