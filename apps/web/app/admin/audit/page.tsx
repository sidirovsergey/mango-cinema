'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAuditLog, clearAuditLog, type AuditEntry } from '@/lib/admin-audit-store';

function actionColor(action: string): string {
  if (action.startsWith('series.')) return 'bg-blue-900/50 text-blue-300 border-blue-700/40';
  if (action.startsWith('plan.') || action.startsWith('coin_pack.'))
    return 'bg-purple-900/50 text-purple-300 border-purple-700/40';
  if (action.startsWith('studio.')) return 'bg-teal-900/50 text-teal-300 border-teal-700/40';
  if (action.startsWith('episode.')) return 'bg-emerald-900/50 text-emerald-300 border-emerald-700/40';
  if (action === 'login') return 'bg-amber-900/50 text-amber-300 border-amber-700/40';
  return 'bg-zinc-800 text-zinc-300 border-zinc-700';
}

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

function DetailsCell({ details }: { details?: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  if (!details) return <span className="text-zinc-600">—</span>;

  const str = JSON.stringify(details);
  if (str.length <= 60 || expanded) {
    return (
      <span
        className="font-mono text-xs text-zinc-400 break-all cursor-pointer"
        onClick={() => setExpanded(false)}
        title="Нажмите чтобы свернуть"
      >
        {str}
      </span>
    );
  }

  return (
    <span
      className="font-mono text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors"
      onClick={() => setExpanded(true)}
      title="Нажмите чтобы развернуть"
    >
      {str.slice(0, 60)}
      <span className="text-zinc-600">…</span>
    </span>
  );
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const reload = useCallback(() => {
    setEntries(getAuditLog());
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener('mango-admin-audit-update', onUpdate);
    return () => window.removeEventListener('mango-admin-audit-update', onUpdate);
  }, [reload]);

  function handleClear() {
    if (!confirm('Очистить весь лог аудита?')) return;
    clearAuditLog();
    reload();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-semibold">Audit Log</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {entries.length > 0
              ? `${entries.length} записей`
              : 'Журнал административных действий'}
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            className="bg-rose-900/50 border border-rose-700/40 text-rose-400 text-sm rounded-lg px-4 py-2 hover:bg-rose-900 transition-colors"
          >
            Очистить лог
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl bg-zinc-900/50">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Время', 'Актор', 'Действие', 'Цель', 'Детали'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-zinc-800 last:border-0">
                <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                  {formatTs(e.timestamp)}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-300">{e.actor}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded border ${actionColor(e.action)}`}
                  >
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-300 font-mono">{e.target}</td>
                <td className="px-4 py-3 max-w-xs">
                  <DetailsCell details={e.details} />
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-500 text-sm">
                  Пока нет записей
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
