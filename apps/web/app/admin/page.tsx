'use client';

import Link from 'next/link';
import { CATALOG } from '../../lib/catalog';
import StatCard from '../../components/admin/StatCard';
import DataTable, { TableRow, TableCell } from '../../components/admin/DataTable';

const STATS = [
  { label: 'Активные подписки', value: '1 247' },
  { label: 'Новых подписок сегодня', value: '23' },
  { label: 'Доход от монет сегодня', value: '48 320 ₽' },
  { label: 'DAU', value: '8 914' },
];

export default function DashboardPage() {
  const topSeries = [...CATALOG].sort((a, b) => a.title.localeCompare(b.title, 'ru'));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-white text-2xl font-semibold">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Обзор платформы Mango Cinema</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div>
        <h2 className="text-white text-lg font-medium mb-4">Топ 5 серий</h2>
        <DataTable headers={['Название', 'Эпизоды', 'Статус']}>
          {topSeries.map((s) => (
            <TableRow key={s.slug}>
              <TableCell>
                <Link href={`/admin/series/${s.slug}`} className="text-white hover:text-[#FF6B35] transition-colors">
                  {s.title}
                </Link>
              </TableCell>
              <TableCell>{s.episodes.length}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Опубликовано
                </span>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </div>
    </div>
  );
}
