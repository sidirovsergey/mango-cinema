import { notFound } from 'next/navigation';
import { CATALOG } from '@/lib/catalog';
import VerticalPlayer from '@/components/VerticalPlayer';

interface Props {
  params: { slug: string };
  searchParams: { ep?: string };
}

export function generateStaticParams() {
  return CATALOG.map((s) => ({ slug: s.slug }));
}

export default function WatchPage({ params, searchParams }: Props) {
  const series = CATALOG.find((s) => s.slug === params.slug);
  if (!series) notFound();

  const epNum = searchParams.ep ? parseInt(searchParams.ep, 10) : 1;
  const startIndex = Math.max(0, series.episodes.findIndex((e) => e.number === epNum));

  return (
    <VerticalPlayer
      episodes={series.episodes}
      startIndex={startIndex}
      seriesSlug={series.slug}
      series={series}
    />
  );
}
