import { CATALOG } from '@/lib/catalog';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ContentRow from '@/components/ContentRow';
import dynamic from 'next/dynamic';

const HomeClientRows = dynamic(() => import('@/components/HomeClientRows'), { ssr: false });

export default function CatalogPage() {
  const featured = CATALOG[0]!;

  const popular = CATALOG;
  const newReleases = [...CATALOG].reverse();
  const dramaRomance = CATALOG.filter((s) =>
    s.genres.some((g) => g === 'драма' || g === 'романтика')
  );
  const thrillerMystery = CATALOG.filter((s) =>
    s.genres.some((g) => g === 'триллер' || g === 'мистика')
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero banner sits directly under sticky header */}
      <HeroBanner series={featured} />

      {/* Content rows */}
      <main className="py-8">
        {/* Client-side: Continue Watching + My List (only shown if data exists) */}
        <HomeClientRows />

        <ContentRow title="Популярное сейчас" series={popular} />
        <ContentRow title="Новинки" series={newReleases} />
        <ContentRow title="Драма и романтика" series={dramaRomance} />
        <ContentRow title="Триллер и мистика" series={thrillerMystery} />
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-zinc-500 text-sm border-t border-white/5">
        <p className="font-semibold text-base text-white/80 mb-1">🥭 Mango Cinema</p>
        <p className="mb-3">© 2026</p>
        <div className="flex justify-center gap-6 text-xs text-zinc-400">
          <span className="cursor-pointer hover:text-white transition">О проекте</span>
          <span className="cursor-pointer hover:text-white transition">Контакты</span>
        </div>
      </footer>
    </div>
  );
}
