'use client';

import { useState, useMemo } from 'react';
import { MOCK_USERS } from '../../../lib/admin-mock';
import DataTable, { TableRow, TableCell } from '../../../components/admin/DataTable';

const PAGE_SIZE = 20;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) => u.id.includes(q) || u.phone.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-semibold">Пользователи</h1>
        <p className="text-zinc-400 text-sm mt-1">{filtered.length} пользователей</p>
      </div>

      <input
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Поиск по ID или телефону..."
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-[#FF6B35]"
      />

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {pageUsers.map((u) => (
          <div key={u.id} className="bg-zinc-900/50 rounded-xl px-4 py-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium text-sm">{u.phone}</span>
              {u.has_subscription ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  Активна
                </span>
              ) : (
                <span className="text-zinc-500 text-xs">Без подписки</span>
              )}
            </div>
            <div className="text-zinc-400 text-xs">{u.display_name}</div>
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono">{u.id.slice(0, 12)}</span>
              <span>{u.coin_balance} монет · {formatDate(u.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DataTable headers={['ID', 'Телефон', 'Имя', 'Подписка', 'Монеты', 'Дата']}>
          {pageUsers.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <span className="font-mono text-xs text-zinc-400">{u.id.slice(0, 12)}</span>
              </TableCell>
              <TableCell>{u.phone}</TableCell>
              <TableCell className="text-white">{u.display_name}</TableCell>
              <TableCell>
                {u.has_subscription ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                    Активна
                  </span>
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </TableCell>
              <TableCell>{u.coin_balance}</TableCell>
              <TableCell className="text-zinc-400">{formatDate(u.created_at)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            Назад
          </button>
          <span className="text-zinc-400 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-1.5 disabled:opacity-40 hover:bg-zinc-700 transition-colors"
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}
