'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATALOG, Series } from '../../../lib/catalog';
import { getSeriesOverrides } from '../../../lib/admin-store';
import DataTable, { TableRow, TableCell } from '../../../components/admin/DataTable';

type Status = 'published' | 'draft';

export default function SeriesListPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  useEffect(() => {
    const overrides = getSeriesOverrides();
    const init: Record<string, Status> = {};
    CATALOG.forEach((s) => {
      init[s.slug] = (overrides[s.slug]?.slug as Status | undefined) === 'draft' ? 'draft' : 'published';
    });
    setStatuses(init);
  }, []);

  function handleStatusChange(slug: string, value: Status) {
    setStatuses((prev) => ({ ...prev, [slug]: value }));
  }

  const merged: Series[] = CATALOG.map((s) => {
    const overrides = getSeriesOverrides();
    return { ...s, ...overrides[s.slug] };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold">Серии</h1>
          <p className="text-zinc-400 text-sm mt-1">{merged.length} серий в каталоге</p>
        </div>
      </div>

      <DataTable headers={['Постер', 'Название', 'Студия', 'Эпизоды', 'Статус', 'Действия']}>
        {merged.map((series) => (
          <TableRow key={series.slug}>
            <TableCell>
              <div className="w-10 h-14 rounded overflow-hidden bg-zinc-800 relative">
                <Image
                  src={series.posterUrl}
                  alt={series.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                  unoptimized
                />
              </div>
            </TableCell>
            <TableCell>
              <span className="text-white font-medium">{series.title}</span>
            </TableCell>
            <TableCell>Mango Production</TableCell>
            <TableCell>{series.episodes.length}</TableCell>
            <TableCell>
              <select
                value={statuses[series.slug] ?? 'published'}
                onChange={(e) => handleStatusChange(series.slug, e.target.value as Status)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="published">Опубликовано</option>
                <option value="draft">Черновик</option>
              </select>
            </TableCell>
            <TableCell>
              <Link
                href={`/admin/series/${series.slug}`}
                className="text-[#FF6B35] hover:text-[#ff7d4d] text-sm transition-colors"
              >
                Редактировать
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
